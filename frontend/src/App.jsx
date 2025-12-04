import { useEffect, useMemo, useState } from 'react';
import ParticleField from './components/ParticleField';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function App() {
  const [city, setCity] = useState('');
  const [sunset, setSunset] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const locationSupported = useMemo(
    () => typeof window !== 'undefined' && 'geolocation' in navigator,
    [],
  );

  useEffect(() => {
    if (!locationSupported) {
      setStatus('Geolocation unavailable in this browser. Try searching for a city.');
      return;
    }
    setStatus('Requesting your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('Fetching sunset for your location…');
        querySunset({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => {
        setStatus('Location permission declined. Search for a city instead.');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
    );
  }, [locationSupported]);

  const querySunset = async ({ latitude, longitude, query }) => {
    setError('');
    setStatus('Looking up sunset time…');
    try {
      const response = await fetch(`${API_BASE}/sunset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, query }),
      });
      if (!response.ok) {
        const { detail } = await response.json();
        throw new Error(detail || 'Unable to fetch sunset time');
      }
      const data = await response.json();
      setSunset(data);
      setStatus(`Sunset for ${data.location}`);
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!city.trim()) {
      setError('Enter a city to search.');
      return;
    }
    querySunset({ query: city.trim() });
  };

  return (
    <div className="app-shell">
      <ParticleField />
      <section className="panel" aria-live="polite">
        <h1 className="heading">Sunset Explorer</h1>
        <p className="subtitle">
          Discover the next sunset wherever you are. Allow location access or search for any city.
        </p>

        <form className="controls" onSubmit={handleSearch}>
          <input
            className="input"
            placeholder="Search for a city (e.g., Tokyo)"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            aria-label="City search"
          />
          <button className="button" type="submit">
            Search
          </button>
        </form>

        {status && <div className="status">{status}</div>}
        {error && <div className="status" style={{ color: '#ff9fa3' }}>{error}</div>}

        {sunset && (
          <div className="result">
            <h3>Sunset in {sunset.location}</h3>
            <div className="timestamp">Local: {formatTime(sunset.sunset_local)}</div>
            <div className="timestamp">UTC: {formatTime(sunset.sunset_utc)}</div>
            <div style={{ marginTop: '0.35rem', color: '#cdd5f1' }}>
              Timezone: {sunset.timezone} · Coordinates: {sunset.coordinates[0].toFixed(4)},
              {sunset.coordinates[1].toFixed(4)}
            </div>
          </div>
        )}

        <div className="footer">
          <span>Backend: Python FastAPI · Frontend: React/Vite</span>
          <span>Ready for future auth, databases, and deployment targets.</span>
        </div>
      </section>
    </div>
  );
}
