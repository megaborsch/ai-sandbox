"""Vercel serverless function entry point.

Exposes the FastAPI app via Mangum-style ASGI adapter.
Vercel's Python runtime automatically handles the ASGI interface
when it detects a FastAPI app exported as `app`.
"""

import sys
from pathlib import Path

# Ensure the backend package is importable whether Vercel keeps the api/ folder
# or flattens the function root.
api_dir = Path(__file__).resolve().parent
project_root = api_dir.parent if api_dir.name == "api" else api_dir
backend_path = project_root / "backend"
sys.path.insert(0, str(backend_path))

from app.main import create_app  # noqa: E402

app = create_app()
