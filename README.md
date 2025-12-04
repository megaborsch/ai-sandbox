# Sunset Explorer

A modular starter for a geo-aware web experience powered by a Python FastAPI backend and a React/Vite frontend. The site renders an animated particle background, asks for geolocation to show the upcoming sunset, and lets visitors search other cities to view their local sunset time.

## Architecture

- **Backend:** FastAPI with async `httpx` client. Provides a versioned `/api/v1` surface with health and sunset lookup endpoints. Timezone detection uses `timezonefinder`; geocoding and sun times rely on public APIs (Open-Meteo geocoding and Sunrise-Sunset).
- **Frontend:** React + Vite SPA that requests geolocation on load, renders a canvas-based particle field, and calls the backend to fetch sunset data. City search falls back when geolocation is unavailable.
- **Modularity:** Clearly separated `backend/` and `frontend/` folders for future authentication, database adapters, and deployment-specific settings.

## Local development

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` (Vite default) and ensure the backend is running on `http://localhost:8000`.

## Deployment

- **Container-friendly:** Add a simple `Dockerfile` per folder (e.g., `uvicorn backend.app.main:app` for the API, `npm run build` then serve `frontend/dist` with any static host).
- **Host flexibility:** The backend reads CORS origins from environment (`SUNSET_APP_CORS_ORIGINS`), and the frontend accepts `VITE_API_BASE_URL` to point to any deployed API (Heroku, Fly.io, Render, Vercel Functions, etc.).
- **Future data stores & auth:** The Python service is ready to grow with database clients (SQL/NoSQL) and authentication middleware without disrupting the API surface.

## API

- `POST /api/v1/sunset` — Body: `{ "query": "Paris" }` or `{ "latitude": 48.85, "longitude": 2.35 }`. Returns local and UTC sunset timestamps plus timezone and coordinates.
- `GET /api/v1/health` — simple status check.

## Testing and linting

- Backend: add tests under `backend/tests` and run with `pytest` after installing dev deps.
- Frontend: run `npm run build` to ensure the bundle compiles; `npm run lint` is available for React linting.

## Notes

- Geocoding: Open-Meteo free geocoding (no key) with timezone metadata.
- Sunset lookup: sunrise-sunset.org API (UTC times) converted to local timezone with `timezonefinder`.
- Browsers may prompt for geolocation permission; when declined, use the city search box.
