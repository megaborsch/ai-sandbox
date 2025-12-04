from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from ..core.config import Settings, get_settings
from ..services.astro import SunsetResult, fetch_sunset
from ..services.geocoding import GeocodingResult, geocode_city

router = APIRouter()


class SunsetResponse(BaseModel):
    location: str
    sunset_local: datetime
    sunset_utc: datetime
    timezone: str
    coordinates: tuple[float, float] = Field(..., description="(latitude, longitude)")


class SunsetQuery(BaseModel):
    query: Optional[str] = Field(None, description="City name to search")
    latitude: Optional[float] = Field(
        None, description="Latitude from browser geolocation", ge=-90, le=90
    )
    longitude: Optional[float] = Field(
        None, description="Longitude from browser geolocation", ge=-180, le=180
    )


@router.get("/health", tags=["health"])
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/sunset", response_model=SunsetResponse, tags=["sunset"])
async def get_sunset(
    request: Request,
    payload: SunsetQuery,
    settings: Annotated[Settings, Depends(get_settings)],
) -> SunsetResponse:
    query = payload.query.strip() if payload.query and payload.query.strip() else None

    if payload.latitude is not None and payload.longitude is not None:
        latitude, longitude, location_label, timezone_name = (
            payload.latitude,
            payload.longitude,
            "Your location",
            None,
        )
    elif query:
        geocode: Optional[GeocodingResult] = await geocode_city(
            query, request.app.state.http_client
        )
        if geocode is None:
            raise HTTPException(status_code=404, detail="City not found")
        latitude, longitude, location_label, timezone_name = (
            geocode.latitude,
            geocode.longitude,
            geocode.label,
            geocode.timezone,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either a city query or both latitude and longitude.",
        )

    sunset: SunsetResult = await fetch_sunset(
        latitude=latitude,
        longitude=longitude,
        client=request.app.state.http_client,
        timezone_override=timezone_name,
    )

    return SunsetResponse(
        location=location_label,
        sunset_local=sunset.sunset_local,
        sunset_utc=sunset.sunset_utc,
        timezone=sunset.timezone,
        coordinates=(latitude, longitude),
    )
