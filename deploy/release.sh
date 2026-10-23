#!/bin/sh
# Release of the current `main` on a server (dev or prod):  sh /opt/fitappMain/deploy/release.sh
#
# 1. backup: DB dump, .env, Caddyfile, local code changes and the previous commit → /root/fitapp-release-<ts>/
# 2. update: local code edits are stashed (Caddyfile and .env stay server-local), git pull --ff-only
# 3. rebuild and restart, wait for the backend, print the Liquibase changesets that ran
# 4. old Docker build cache (older than a week) is pruned so the disk does not fill up
#
# Rollback (migrations are forward-only, so the DB is restored too):
#   git checkout <previous-commit>; docker compose -f compose.yaml -f docker-compose.prod.yml up -d --build
#   docker exec -i <db> sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --no-owner' < db.dump
set -eu

APP_DIR=${APP_DIR:-/opt/fitappMain}
COMPOSE="docker compose -f compose.yaml -f docker-compose.prod.yml"
cd "$APP_DIR"

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
git pull -q --ff-only origin main
cp -p "$B/.env" .env
chmod 600 .env
echo "now at $(git log --oneline -1)"

echo "== rebuild and restart"
# FIT-74: build ids shown in the profile — the last commit that touched each part, so an unchanged backend
# keeps its container (and isn't restarted) when only the frontend changed.
export BACKEND_COMMIT=$(git log -1 --format=%h -- backend)
export FRONTEND_COMMIT=$(git log -1 --format=%h -- frontend)
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
