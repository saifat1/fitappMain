#!/bin/sh
# Server resources: a sample every 15 minutes, an alert when something gets close to the limit,
# a weekly summary on Mondays. Mail goes through the backend (/api/analytics/report/email with the
# ANALYTICS_REPORT_TOKEN from .env) to ANALYTICS_REPORT_EMAIL — the server has no mail client of its own.
#
# Install on a server (prod; a copy outside the checkout — prod is on a release tag, not main):
#   cd /opt/fitappMain && git fetch -q origin && git show origin/main:deploy/monitor.sh > /usr/local/bin/fitapp-monitor.sh
#   printf 'PATH=/usr/sbin:/usr/bin:/sbin:/bin\n*/15 * * * * root sh /usr/local/bin/fitapp-monitor.sh collect >> /var/log/fitapp-monitor.log 2>&1\n30 9 * * 1 root sh /usr/local/bin/fitapp-monitor.sh report >> /var/log/fitapp-monitor.log 2>&1\n' > /etc/cron.d/fitapp-monitor
#
#   sh deploy/monitor.sh collect    — append a sample to $DATA, check the thresholds
#   sh deploy/monitor.sh report     — mail the summary of the last 7 days (DRY_RUN=1 — print instead)
set -eu

APP_DIR=${APP_DIR:-/opt/fitappMain}
DATA=${MONITOR_DATA:-/var/lib/fitapp-monitor/samples.csv}
STATE_DIR=$(dirname "$DATA")
COMPOSE="docker compose -f compose.yaml -f docker-compose.prod.yml"
# Thresholds: disk used %, memory available %, 15-min load per CPU (×100), DB size MB.
DISK_ALERT=${DISK_ALERT:-80}
MEM_ALERT=${MEM_ALERT:-15}
LOAD_ALERT=${LOAD_ALERT:-150}
cd "$APP_DIR"

env_value() { grep "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- | sed 's/^"//; s/"$//'; }

send_mail() {  # $1 subject, $2 text
  if [ "${DRY_RUN:-0}" = 1 ]; then printf '== %s\n%s\n' "$1" "$2"; return; fi
  TOKEN=$(env_value ANALYTICS_REPORT_TOKEN)
  SITE=$(env_value APP_PUBLIC_BASE_URL)
  [ -n "$TOKEN" ] && [ -n "$SITE" ] || { echo "$(date -Is) ERROR: ANALYTICS_REPORT_TOKEN / APP_PUBLIC_BASE_URL not set"; return 1; }
  BODY=$(SUBJECT="$1" TEXT="$2" python3 -c 'import json, os; print(json.dumps({"subject": os.environ["SUBJECT"], "text": os.environ["TEXT"]}))')
  CODE=$(curl -s -m 30 -o /dev/null -w '%{http_code}' -X POST "$SITE/api/analytics/report/email" \
    -H "X-Report-Token: $TOKEN" -H 'Content-Type: application/json' --data "$BODY")
  echo "$(date -Is) mail «$1» → HTTP $CODE"
}

collect() {
  mkdir -p "$STATE_DIR"
  [ -f "$DATA" ] || echo "ts,cpus,load1,load15,mem_total_mb,mem_avail_mb,disk_used_pct,disk_avail_mb,db_mb,backend_mb,trainers,clients" > "$DATA"

  CPUS=$(nproc)
  set -- $(cat /proc/loadavg)
  LOAD1=$1; LOAD15=$3
  MEM_TOTAL=$(awk '/^MemTotal:/ { print int($2 / 1024) }' /proc/meminfo)
  MEM_AVAIL=$(awk '/^MemAvailable:/ { print int($2 / 1024) }' /proc/meminfo)
  set -- $(df -Pm / | awk 'NR == 2 { sub("%", "", $5); print $5, $4 }')
  DISK_PCT=$1; DISK_AVAIL=$2

  DB=$($COMPOSE ps -q db 2>/dev/null || true)
  DB_MB=""; TRAINERS=""; CLIENTS=""
  if [ -n "$DB" ]; then
    set -- $(docker exec "$DB" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select pg_database_size(current_database()) / 1048576, (select count(*) from app_user where role = '"'"'TRAINER'"'"' and status <> '"'"'DELETED'"'"'), (select count(*) from app_user where role = '"'"'CLIENT'"'"' and status <> '"'"'DELETED'"'"')" -F " "' 2>/dev/null || echo "")
    DB_MB=${1:-}; TRAINERS=${2:-}; CLIENTS=${3:-}
  fi
  BACKEND_MB=$(docker stats --no-stream --format '{{.Name}} {{.MemUsage}}' 2>/dev/null \
    | awk '$1 == "fitapp-backend" { v = $2; u = v; gsub(/[0-9.]/, "", u); gsub(/[A-Za-z]/, "", v); if (u == "GiB") v *= 1024; print int(v) }')

  echo "$(date -Is),$CPUS,$LOAD1,$LOAD15,$MEM_TOTAL,$MEM_AVAIL,$DISK_PCT,$DISK_AVAIL,$DB_MB,${BACKEND_MB:-},$TRAINERS,$CLIENTS" >> "$DATA"
  # Keep ~120 days of samples.
  if [ "$(wc -l < "$DATA")" -gt 12000 ]; then
    { head -1 "$DATA"; tail -11500 "$DATA"; } > "$DATA.tmp" && mv "$DATA.tmp" "$DATA"
  fi

  MEM_PCT=$((MEM_AVAIL * 100 / MEM_TOTAL))
  LOAD_PER_CPU=$(awk -v l="$LOAD15" -v c="$CPUS" 'BEGIN { print int(l * 100 / c) }')
  [ "$DISK_PCT" -ge "$DISK_ALERT" ] && alert disk "Диск занят на ${DISK_PCT}% (свободно $((DISK_AVAIL / 1024)) ГБ)"
  [ "$MEM_PCT" -lt "$MEM_ALERT" ] && alert mem "Свободной памяти ${MEM_PCT}% (${MEM_AVAIL} из ${MEM_TOTAL} МБ)"
  [ "$LOAD_PER_CPU" -ge "$LOAD_ALERT" ] && alert load "Нагрузка на процессор за 15 минут — ${LOAD15} на ${CPUS} ядра (норма — до ${CPUS})"
  return 0
}

# One alert per kind per day.
alert() {
  STAMP="$STATE_DIR/alert-$1-$(date +%Y%m%d)"
  [ -f "$STAMP" ] && return 0
  touch "$STAMP"
  find "$STATE_DIR" -name 'alert-*' -mtime +7 -delete 2>/dev/null || true
  HOST=$(hostname)
  send_mail "FitApp: внимание — ресурсы сервера ($HOST)" "$2.

Сервер: $HOST, $(date '+%d.%m.%Y %H:%M').
Если так продолжится — пора увеличивать тариф сервера (VPS) или чистить место. Подробности — в еженедельной сводке."
}

report() {
  [ -f "$DATA" ] || { echo "no samples in $DATA yet"; exit 1; }
  SINCE=$(date -d '7 days ago' -Is)
  TEXT=$(awk -F, -v since="$SINCE" -v host="$(hostname)" -v disk_alert="$DISK_ALERT" '
    NR == 1 { next }
    { all_n++; all_ts[all_n] = $1; all_disk[all_n] = $7; all_db[all_n] = $9 }
    $1 < since { next }
    {
      n++; if (n == 1) { first_ts = $1; first_disk = $7; first_db = $9; first_tr = $11; first_cl = $12 }
      cpus = $2; load += $3; if ($3 > load_max) load_max = $3
      mt = $5; ma = $6; if (mem_min == "" || ma < mem_min) mem_min = ma; mem_sum += ma
      disk = $7; disk_avail = $8; db = $9; if ($10 > be_max) be_max = $10
      tr = $11; cl = $12; last_ts = $1
    }
    END {
      if (n == 0) { print "Нет данных за неделю."; exit }
      load_avg = load / n
      mem_used_max = 100 - int(mem_min * 100 / mt)
      disk_growth = disk - first_disk
      db_growth = db - first_db
      printf "Ресурсы сервера %s за неделю (%s — %s), замеров раз в 15 минут: %d.\n\n", host, substr(first_ts, 1, 10), substr(last_ts, 1, 10), n
      printf "Процессор: %d ядра, нагрузка в среднем %.2f, пик %.2f (норма — до %d).\n", cpus, load_avg, load_max, cpus
      printf "Память: всего %d МБ, занято до %d%% (минимум свободной — %d МБ); сервер приложения — до %d МБ.\n", mt, mem_used_max, mem_min, be_max
      printf "Диск: занят на %d%% (свободно %.1f ГБ), за неделю %+d%%.\n", disk, disk_avail / 1024, disk_growth
      printf "База данных: %d МБ, за неделю %+d МБ.\n", db, db_growth
      printf "Пользователи: тренеров %d (%+d за неделю), клиентов %d (%+d).\n\n", tr, tr - first_tr, cl, cl - first_cl
      advice = ""
      if (load_max >= cpus) advice = advice "- Пиковая нагрузка доходила до числа ядер — при росте понадобится больше процессоров.\n"
      if (load_avg >= cpus * 0.6) advice = advice "- Средняя нагрузка выше 60% — пора добавить процессоров.\n"
      if (mem_used_max >= 80) advice = advice "- Память занята больше чем на 80% — пора добавить оперативной памяти.\n"
      if (disk >= disk_alert - 10) advice = advice "- Диска осталось мало — увеличить диск или почистить старые бэкапы/образы.\n"
      if (disk_growth > 0) {
        weeks = (disk_alert - disk) / disk_growth
        if (weeks < 8) advice = advice sprintf("- При таком росте диск дойдёт до %d%% примерно через %d нед.\n", disk_alert, weeks < 1 ? 1 : int(weeks))
      }
      if (advice == "") print "Итог: запас есть, увеличивать ресурсы пока не нужно."
      else printf "Итог: стоит запланировать увеличение ресурсов.\n%s", advice
    }' "$DATA")
  send_mail "FitApp: ресурсы сервера за неделю" "$TEXT"
}

case "${1:-}" in
  collect) collect ;;
  report) report ;;
  *) echo "usage: sh deploy/monitor.sh collect|report"; exit 2 ;;
esac
