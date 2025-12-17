#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT/.run"
LOG_DIR="$ROOT/logs"
mkdir -p "$RUN_DIR" "$LOG_DIR"

PID_FILE="$RUN_DIR/backend.pid"
LOG_FILE="$LOG_DIR/backend.log"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Backend already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

PY="$ROOT/.venv/bin/python"
if [ ! -x "$PY" ]; then
  PY="$(command -v python3 || command -v python)"
fi

echo "Starting backend with Python: $PY"
cd "$ROOT/backend"
nohup "$PY" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Backend started (PID $(cat "$PID_FILE")), logs: $LOG_FILE"
