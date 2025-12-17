#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/stop-frontend.sh"
sleep 1
"$ROOT/scripts/stop-backend.sh"
