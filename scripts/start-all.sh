#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/start-backend.sh"
sleep 1
"$ROOT/scripts/start-frontend.sh"
