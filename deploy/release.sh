#!/bin/sh
# Release on a server:
#   dev:   sh /opt/fitappMain/deploy/release.sh           — the current `main`
#   prod:  sh /opt/fitappMain/deploy/release.sh v1.0.1    — a version tag (only tested tasks), never plain main
#
# 1. backup: DB dump, .env, Caddyfile, local code changes and the previous commit → /root/fitapp-release-<ts>/
# 2. update: local code edits are stashed (Caddyfile and .env stay server-local), then `main` is pulled
#    or the tag is checked out (detached)
# 3. rebuild and restart, wait for the backend, print the Liquibase changesets that ran
# 4. old Docker build cache (older than a week) is pruned so the disk does not fill up
#
# Rollback (migrations are forward-only, so the DB is restored too):
#   sh deploy/release.sh <previous tag>   (or git checkout <previous-commit>; $COMPOSE up -d --build)
#   docker exec -i <db> sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --no-owner' < db.dump
set -eu

APP_DIR=${APP_DIR:-/opt/fitappMain}
COMPOSE="docker compose -f compose.yaml -f docker-compose.prod.yml"
REF=${1:-main}
cd "$APP_DIR"

# Run the script of the version being released, from a copy: git replaces this file during the update.
if [ -z "${FITAPP_RELEASE_COPY:-}" ]; then
  git fetch -q --tags origin
  if [ "$REF" = main ]; then SRC=origin/main; else SRC="refs/tags/$REF"; fi
  git rev-parse -q --verify "$SRC^{commit}" >/dev/null || { echo "ERROR: no tag $REF (git tag -l 'v*')"; exit 1; }
  git show "$SRC:deploy/release.sh" > /tmp/fitapp-release.sh
  FITAPP_RELEASE_COPY=1 exec sh /tmp/fitapp-release.sh "$@"
fi

TS=$(date +%Y%m%d-%H%M)
RELEASE_START=$(date +%s)
B=/root/fitapp-release-$TS
mkdir -p "$B"
chmod 700 "$B"

echo "== backup to $B"
git rev-parse HEAD > "$B/previous-commit"
git diff > "$B/local-changes.diff" || true
cp -p .env "$B/.env"
[ -f Caddyfile ] && cp -p Caddyfile "$B/Caddyfile"
DB=$($COMPOSE ps -q db)
[ -n "$DB" ] || { echo "ERROR: db container not running — no backup, stopping"; exit 1; }
docker exec "$DB" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$B/db.dump"
chmod 600 "$B/db.dump" "$B/.env"
echo "db dump: $(stat -c %s "$B/db.dump") bytes, previous commit $(cat "$B/previous-commit")"

echo "== update code"
# .env* used to be tracked: put the tracked version back so pull can remove it, the real one is restored below.
git checkout -q -- .env .env.local .env.server-nginx 2>/dev/null || true
# Server-local code edits (e.g. old CORS patches) are kept in a stash, not lost. Caddyfile stays as is.
git stash push -q -m "server-local-before-release-$TS" -- . ':(exclude)Caddyfile' 2>/dev/null || true
if [ "$REF" = main ]; then
  git checkout -q main
  git pull -q --ff-only origin main
else
  git checkout -q --detach "refs/tags/$REF"
fi
cp -p "$B/.env" .env
chmod 600 .env
echo "now at $(git log --oneline -1)"

echo "== rebuild and restart"
# FIT-74: build ids shown in the profile — the last commit that touched each part, so an unchanged backend
# keeps its container (and isn't restarted) when only the frontend changed.
export BACKEND_COMMIT=$(git log -1 --format=%h -- backend)
export FRONTEND_COMMIT=$(git log -1 --format=%h -- frontend)
# Version in the profile: the tag on prod ("1.0.1"), "1.0.1-3-g<hash>" on dev (3 commits after 1.0.1).
export APP_VERSION=$(git describe --tags --match 'v[0-9]*' 2>/dev/null | sed 's/^v//' || true)
echo "version ${APP_VERSION:-?}, frontend $FRONTEND_COMMIT, backend $BACKEND_COMMIT"
$COMPOSE up -d --build

echo "== wait for backend"
BACKEND=$($COMPOSE ps -q backend)
STARTED=$(docker inspect -f '{{.State.StartedAt}}' "$BACKEND")
if [ "$(date -d "$STARTED" +%s)" -lt "$RELEASE_START" ]; then
  # Only the frontend (or nothing) changed — the backend container wasn't recreated.
  [ "$(docker inspect -f '{{.State.Running}}' "$BACKEND")" = "true" ] || { echo "ERROR: backend is not running"; exit 1; }
  echo "backend unchanged, running since $STARTED"
else
  i=0
  while [ $i -lt 60 ]; do
    if docker logs "$BACKEND" 2>&1 | grep -qE "Started .*Application|APPLICATION FAILED"; then break; fi
    i=$((i + 1)); sleep 4
  done
  docker logs "$BACKEND" 2>&1 | grep -E "ChangeSet .* ran successfully|Started .*Application|APPLICATION FAILED|ERROR" | tail -20
  docker logs "$BACKEND" 2>&1 | grep -q "Started .*Application" || { echo "ERROR: backend did not start — see rollback above"; exit 1; }
fi
# Build cache grows with every release (it filled the dev disk to 85%); keep only the last week of it.
docker builder prune -f --filter until=168h >/dev/null 2>&1 || true

echo "== release ok, backup in $B"

# Release note to Telegram — only for a version tag (prod), never for main (dev). The bot token and chat id live
# in the server's .env only: TELEGRAM_BOT_TOKEN, TELEGRAM_RELEASE_CHAT_ID. The text is the tag's CHANGELOG.md section.
# A failed send never fails the release.
env_value() { grep "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//'; }
TG_TOKEN=$(env_value TELEGRAM_BOT_TOKEN)
TG_CHAT=$(env_value TELEGRAM_RELEASE_CHAT_ID)
if [ "$REF" != main ] && [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ]; then
  VERSION=${REF#v}
  NOTES=$(awk -v v="$VERSION" 'index($0, "## " v " ") == 1 { on = 1; next } /^## / { on = 0 } on' CHANGELOG.md \
    | sed 's/^- /• /' | sed '/^[[:space:]]*$/d')
  SITE=$(env_value APP_PUBLIC_BASE_URL)
  TEXT=$(printf '🚀 FitApp %s выложена на бой%s\n\n%s' "$VERSION" "${SITE:+ — $SITE}" "${NOTES:-Список изменений — в CHANGELOG.md}")
  if curl -s -m 15 -o /dev/null -w '%{http_code}' "https://api.telegram.org/bot$TG_TOKEN/sendMessage" \
      --data-urlencode "chat_id=$TG_CHAT" --data-urlencode "text=$TEXT" \
      --data-urlencode "disable_web_page_preview=true" | grep -q '^200$'; then
    echo "== release note sent to Telegram"
  else
    echo "WARNING: release note was not sent to Telegram (check TELEGRAM_BOT_TOKEN / TELEGRAM_RELEASE_CHAT_ID)"
  fi
fi
