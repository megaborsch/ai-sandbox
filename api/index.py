"""Vercel serverless function entry point.

Exposes the FastAPI app via Mangum-style ASGI adapter.
Vercel's Python runtime automatically handles the ASGI interface
when it detects a FastAPI app exported as `app`.
"""

import sys
from pathlib import Path

# Add backend directory to the Python path so imports resolve correctly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import create_app  # noqa: E402

app = create_app()
