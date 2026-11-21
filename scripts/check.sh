#!/usr/bin/env bash
# Pings every site in sites.json and appends the result to data/history.json.
# Runs on GitHub Actions, needs curl and jq (both come with ubuntu-latest).

set -euo pipefail

HISTORY="data/history.json"
KEEP=300 # about 3 days with a 15 minute schedule

mkdir -p data
[ -f "$HISTORY" ] || echo "[]" > "$HISTORY"

now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
results="{}"

while read -r site; do
  name=$(jq -r '.name' <<< "$site")
  url=$(jq -r '.url' <<< "$site")

  out=$(curl -s -o /dev/null -L --max-time 15 \
    -A "uptime-monitor (github.com/muhammedfidann06/uptime-monitor)" \
    -w "%{http_code} %{time_total}" "$url" || true)
  out=${out:-"000 0"}

  code=$((10#${out%% *}))
  ms=$(awk -v t="${out##* }" 'BEGIN { printf "%d", t * 1000 }')

  up=false
  if [ "$code" -ge 200 ] && [ "$code" -lt 400 ]; then
    up=true
  fi

  echo "$name: $code in ${ms}ms"

  results=$(jq --arg n "$name" --argjson c "$code" --argjson ms "$ms" --argjson up "$up" \
    '. + { ($n): { code: $c, ms: $ms, up: $up } }' <<< "$results")
done < <(jq -c '.[]' sites.json)

jq --arg t "$now" --argjson r "$results" --argjson keep "$KEEP" \
  '. + [{ time: $t, sites: $r }] | .[-$keep:]' "$HISTORY" > "$HISTORY.tmp"
mv "$HISTORY.tmp" "$HISTORY"
