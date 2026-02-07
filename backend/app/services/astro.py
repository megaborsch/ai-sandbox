from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

import httpx

SUNSET_ENDPOINT = "https://api.sunrise-sunset.org/json"
TIMEZONE_ENDPOINT = "https://api.open-meteo.com/v1/forecast"


@dataclass
class SunsetResult:
    sunset_local: datetime
    sunset_utc: datetime
    timezone: str


async def _resolve_timezone(latitude: float, longitude: float, client: httpx.AsyncClient) -> str:
    """Resolve timezone from coordinates using Open-Meteo API (no native deps)."""
    try:
        response = await client.get(
            TIMEZONE_ENDPOINT,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "forecast_days": 1,
                "timezone": "auto",
            },
            timeout=10.0,
        )
        response.raise_for_status()
        tz = response.json().get("timezone")
        if tz:
            return tz
    except (httpx.HTTPError, KeyError):
        pass
    return "UTC"


async def fetch_sunset(
    *,
    latitude: float,
    longitude: float,
    client: httpx.AsyncClient,
    timezone_override: Optional[str] = None,
) -> SunsetResult:
    response = await client.get(
        SUNSET_ENDPOINT,
        params={"lat": latitude, "lng": longitude, "formatted": 0},
        timeout=15.0,
    )
    response.raise_for_status()
    data = response.json()
    results = data.get("results")
    if results is None or "sunset" not in results:
        raise httpx.HTTPStatusError("Malformed response", request=response.request, response=response)

    sunset_utc = datetime.fromisoformat(results["sunset"]).astimezone(timezone.utc)
    timezone_name = timezone_override or await _resolve_timezone(latitude, longitude, client)
    try:
        sunset_local = sunset_utc.astimezone(ZoneInfo(timezone_name))
    except (KeyError, ValueError):
        timezone_name = "UTC"
        sunset_local = sunset_utc
    return SunsetResult(
        sunset_local=sunset_local,
        sunset_utc=sunset_utc,
        timezone=timezone_name,
    )
