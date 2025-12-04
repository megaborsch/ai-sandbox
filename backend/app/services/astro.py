from dataclasses import dataclass
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import httpx
from timezonefinder import TimezoneFinder

SUNSET_ENDPOINT = "https://api.sunrise-sunset.org/json"
_timezone_finder = TimezoneFinder()


@dataclass
class SunsetResult:
    sunset_local: datetime
    sunset_utc: datetime
    timezone: str


def _resolve_timezone(latitude: float, longitude: float) -> str:
    timezone = _timezone_finder.timezone_at(lng=longitude, lat=latitude)
    return timezone or "UTC"


async def fetch_sunset(
    *,
    latitude: float,
    longitude: float,
    client: httpx.AsyncClient,
    timezone_override: str | None = None,
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
    timezone_name = timezone_override or _resolve_timezone(latitude, longitude)
    sunset_local = sunset_utc.astimezone(ZoneInfo(timezone_name))
    return SunsetResult(
        sunset_local=sunset_local,
        sunset_utc=sunset_utc,
        timezone=timezone_name,
    )
