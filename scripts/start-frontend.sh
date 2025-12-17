#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT/.run"
LOG_DIR="$ROOT/logs"
mkdir -p "$RUN_DIR" "$LOG_DIR"

PID_FILE="$RUN_DIR/frontend.pid"
LOG_FILE="$LOG_DIR/vite.log"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Frontend already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

echo "Starting frontend (Vite)"
cd "$ROOT/frontend"
nohup npm run dev -- --host 127.0.0.1 > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Frontend started (PID $(cat "$PID_FILE")), logs: $LOG_FILE"
