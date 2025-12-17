#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT/.run"
PID_FILE="$RUN_DIR/frontend.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping frontend (PID $PID)"
    kill "$PID" || true
    sleep 1
    if kill -0 "$PID" 2>/dev/null; then
      echo "PID still alive, killing forcefully"
      kill -9 "$PID" || true
    fi
  else
    echo "PID $PID not running"
  fi
  rm -f "$PID_FILE"
else
  echo "No frontend PID file ($PID_FILE)"
  pids=$(lsof -tiTCP:5173 -sTCP:LISTEN -n -P 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Killing processes on port 5173: $pids"
    kill -9 $pids || true
  fi
fi
