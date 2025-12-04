from dataclasses import dataclass
from typing import Any

import httpx

GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search"


@dataclass
class GeocodingResult:
    latitude: float
    longitude: float
    label: str
    timezone: str


async def geocode_city(city: str, client: httpx.AsyncClient) -> GeocodingResult | None:
    response = await client.get(
        GEOCODING_ENDPOINT,
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=15.0,
    )
    response.raise_for_status()
    payload: dict[str, Any] = response.json()
    results = payload.get("results")
    if not results:
        return None

    entry = results[0]
    return GeocodingResult(
        latitude=float(entry["latitude"]),
        longitude=float(entry["longitude"]),
        label=f"{entry['name']}, {entry.get('country_code', '').upper()}",
        timezone=entry.get("timezone", "UTC"),
    )
