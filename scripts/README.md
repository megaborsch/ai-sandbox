# Development run scripts

Located in `scripts/` — small helpers to start/stop/restart backend and frontend.

Files created:

- `start-backend.sh`, `stop-backend.sh`, `restart-backend.sh`
- `start-frontend.sh`, `stop-frontend.sh`, `restart-frontend.sh`
- `start-all.sh`, `stop-all.sh`, `restart-all.sh`
- `Makefile` targets that call these scripts (e.g. `make start-all`).

Behavior:

- PIDs are written to `.run/backend.pid` and `.run/frontend.pid`.
- Logs are written to `logs/backend.log` and `logs/vite.log`.
- Scripts attempt safe shutdown by PID, then fallback to killing processes listening on the usual ports (8000 for backend, 5173 for frontend).

Usage examples:

Start both:
```bash
make start-all
```

Start frontend only:
```bash
make start-frontend
```

Stop backend:
```bash
make stop-backend
```

Restart everything:
```bash
make restart-all
```

If you prefer direct script invocation:
```bash
bash scripts/start-all.sh
bash scripts/stop-frontend.sh
```

Notes:
- Scripts assume a Python virtualenv at `./.venv`. If not present, they will fall back to the system `python3`/`python` in PATH.
- Frontend scripts call `npm run dev` and require `npm`/`node` available in PATH.
