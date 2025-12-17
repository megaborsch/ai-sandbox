#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/stop-all.sh"
sleep 1
"$ROOT/scripts/start-all.sh"
