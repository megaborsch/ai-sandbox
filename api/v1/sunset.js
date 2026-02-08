const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const SUNSET_ENDPOINT = 'https://api.sunrise-sunset.org/json';
const TIMEZONE_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

async function geocodeCity(query) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set('name', query);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Geocoding service is temporarily unavailable.');
  }
  const payload = await response.json();
  const results = payload.results;
  if (!results || results.length === 0) {
    return null;
  }
  const entry = results[0];
  return {
    latitude: Number(entry.latitude),
    longitude: Number(entry.longitude),
    label: `${entry.name}, ${(entry.country_code || '').toUpperCase()}`,
    timezone: entry.timezone || 'UTC',
  };
}

async function resolveTimezone(latitude, longitude) {
  const url = new URL(TIMEZONE_ENDPOINT);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    return 'UTC';
  }
  const payload = await response.json();
  return payload.timezone || 'UTC';
}

async function fetchSunset(latitude, longitude) {
  const url = new URL(SUNSET_ENDPOINT);
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lng', String(longitude));
  url.searchParams.set('formatted', '0');
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Sunset calculation service is temporarily unavailable.');
  }
  const payload = await response.json();
  if (!payload.results || !payload.results.sunset) {
    throw new Error('Sunset calculation service is temporarily unavailable.');
  }
  return payload.results.sunset;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const latitude = body.latitude;
  const longitude = body.longitude;

  let coords;
  let locationLabel;
  let timezoneName;

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    coords = { latitude, longitude };
    locationLabel = 'Your location';
    timezoneName = await resolveTimezone(latitude, longitude);
  } else if (query) {
    const geocode = await geocodeCity(query);
    if (!geocode) {
      res.status(404).json({ detail: 'City not found' });
      return;
    }
    coords = { latitude: geocode.latitude, longitude: geocode.longitude };
    locationLabel = geocode.label;
    timezoneName = geocode.timezone || (await resolveTimezone(geocode.latitude, geocode.longitude));
  } else {
    res.status(400).json({
      detail: 'Provide either a city query or both latitude and longitude.',
    });
    return;
  }

  try {
    const sunsetUtc = await fetchSunset(coords.latitude, coords.longitude);
    res.status(200).json({
      location: locationLabel,
      sunset_local: sunsetUtc,
      sunset_utc: sunsetUtc,
      timezone: timezoneName,
      coordinates: [coords.latitude, coords.longitude],
    });
  } catch (error) {
    res.status(502).json({
      detail: error instanceof Error ? error.message : 'Sunset calculation service is temporarily unavailable.',
    });
  }
}
