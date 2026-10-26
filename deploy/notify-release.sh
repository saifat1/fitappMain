#!/bin/sh
# Release note to Telegram after a prod release:  sh deploy/notify-release.sh v1.1.0
#
# Runs on the machine that does the release, not on the server: the VPS can't reach api.telegram.org
# (connections time out, checked 26.10.2026). The bot token and the chat id are read from the prod
# server's .env over ssh (TELEGRAM_BOT_TOKEN, TELEGRAM_RELEASE_CHAT_ID) and are never printed or stored here.
# The text is the version's section of CHANGELOG.md at that tag.
set -eu

TAG=${1:?usage: sh deploy/notify-release.sh vX.Y.Z}
VERSION=${TAG#v}
SERVER=${FITAPP_PROD_SSH:-root@80.93.63.169}
KEY=${FITAPP_SSH_KEY:-$HOME/.ssh/fitapp_dev}

prod_env() {
  ssh -i "$KEY" -o BatchMode=yes "$SERVER" \
    "grep '^$1=' /opt/fitappMain/.env | tail -1 | cut -d= -f2- | sed 's/^\"//; s/\"\$//' | tr -d '\r'"
}

TG_TOKEN=$(prod_env TELEGRAM_BOT_TOKEN)
TG_CHAT=$(prod_env TELEGRAM_RELEASE_CHAT_ID)
SITE=$(prod_env APP_PUBLIC_BASE_URL)
[ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ] || { echo "ERROR: TELEGRAM_BOT_TOKEN / TELEGRAM_RELEASE_CHAT_ID not set in prod .env"; exit 1; }

NOTES=$(git show "$TAG:CHANGELOG.md" \
  | awk -v v="$VERSION" 'index($0, "## " v " ") == 1 { on = 1; next } /^## / { on = 0 } on' \
  | sed 's/^- /• /' | sed '/^[[:space:]]*$/d')
# The text goes through a file: on Windows curl gets non-ASCII command-line arguments in the ANSI code page
# and Telegram rejects them ("strings must be encoded in UTF-8").
TEXT_FILE=$(mktemp)
trap 'rm -f "$TEXT_FILE"' EXIT
printf '🚀 FitApp %s выложена на бой%s\n\n%s' "$VERSION" "${SITE:+ — $SITE}" "${NOTES:-Список изменений — в CHANGELOG.md}" > "$TEXT_FILE"

# Windows curl.exe needs a Windows path (Git Bash gives /tmp/…).
CURL_FILE=$(command -v cygpath >/dev/null 2>&1 && cygpath -w "$TEXT_FILE" || echo "$TEXT_FILE")

CODE=$(curl -s -m 20 -o /dev/null -w '%{http_code}' "https://api.telegram.org/bot$TG_TOKEN/sendMessage" \
  --data-urlencode "chat_id=$TG_CHAT" --data-urlencode "text@$CURL_FILE" --data-urlencode "disable_web_page_preview=true")
[ "$CODE" = 200 ] && echo "release note for $TAG sent to Telegram" || { echo "ERROR: Telegram answered HTTP $CODE"; exit 1; }
