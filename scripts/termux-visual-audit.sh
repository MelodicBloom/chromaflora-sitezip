#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
pkg update -y
pkg upgrade -y
pkg install -y nodejs-lts git python curl jq imagemagick
pkg install -y x11-repo chromium || true

PORT="${PORT:-4173}"
python -m http.server "$PORT" --directory public >/tmp/cf_server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID || true' EXIT
sleep 2

BASE="http://127.0.0.1:${PORT}/mandala-v2.html"
OUT="artifacts/visual-audit/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

for VP in \
  "360,740,mobile-small" \
  "390,844,mobile-reference" \
  "412,915,mobile-large" \
  "768,1024,tablet" \
  "1366,768,desktop"; do
  IFS=, read -r W H NAME <<< "$VP"
  chromium --headless --disable-gpu --hide-scrollbars \
    --window-size="${W},${H}" \
    --screenshot="${OUT}/mandala-v2-${NAME}.png" \
    "$BASE" || true
done

echo "Audit complete: $OUT"
echo "Manual mobile acceptance checks:"
echo "  - document body does not vertically scroll"
echo "  - live viewport remains visible and >= 220px tall"
echo "  - only the control-sheet interior scrolls vertically"
echo "  - action footer stays inside the sheet without covering controls"
echo "  - pattern rail remains inside the sheet"
