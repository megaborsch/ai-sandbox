from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as api_router
from .core.config import Settings, get_settings


@asynccontextmanager
def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        app.state.http_client = client
        yield


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    app = FastAPI(title="Sunset Explorer", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.dependency_overrides[Settings] = lambda: app_settings

    app.include_router(api_router, prefix=app_settings.api_v1_prefix)

    return app


def get_app(settings: Annotated[Settings, Depends(get_settings)]) -> FastAPI:
    return create_app(settings)


app = create_app()
