#!/bin/sh
# Daily FitApp database dump (pg_dump custom format), kept 14 days.
# Install on a server (cron at 03:20):
#   printf 'PATH=/usr/sbin:/usr/bin:/sbin:/bin\n20 3 * * * root sh /opt/fitappMain/deploy/backup.sh >> /var/log/fitapp-backup.log 2>&1\n' > /etc/cron.d/fitapp-backup
# Restore: docker exec -i <db container> sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --no-owner' < file.dump
set -eu

APP_DIR=${APP_DIR:-/opt/fitappMain}
DIR=${BACKUP_DIR:-/var/backups/fitapp}
KEEP_DAYS=${KEEP_DAYS:-14}

cd "$APP_DIR"
DB=$(docker compose -f compose.yaml -f docker-compose.prod.yml ps -q db)
[ -n "$DB" ] || { echo "$(date -Is) ERROR: db container not running"; exit 1; }

mkdir -p "$DIR"
OUT="$DIR/fitapp-$(date +%Y%m%d-%H%M).dump"
docker exec "$DB" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$OUT.part"
mv "$OUT.part" "$OUT"
chmod 600 "$OUT"
find "$DIR" -name 'fitapp-*.dump' -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) ok $OUT $(stat -c %s "$OUT") bytes"
