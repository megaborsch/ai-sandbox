import { Component, useEffect, useMemo, useState } from 'react';
import ParticleField from './components/ParticleField';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const formatTime = (value, timezone = undefined) => {
  try {
    const options = { hour: '2-digit', minute: '2-digit' };
    if (timezone) {
      options.timeZone = timezone;
    }
    return new Date(value).toLocaleTimeString([], options);
  } catch {
    return String(value);
  }
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="panel">
            <h1 className="heading">Something went wrong</h1>
            <p className="subtitle">Please refresh the page to try again.</p>
            <button className="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SunsetApp() {
  const [city, setCity] = useState('');
  const [sunset, setSunset] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locationSupported = useMemo(
    () => typeof window !== 'undefined' && 'geolocation' in navigator,
    [],
  );

  useEffect(() => {
    if (!locationSupported) {
      setStatus('Geolocation unavailable in this browser. Search for a city.');
      return;
    }
    setStatus('Ready for sunset lookup. Search for a city or use your location.');
  }, [locationSupported]);

  const querySunset = async ({ latitude, longitude, query }) => {
    setError('');
    setStatus('Looking up sunset time…');
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE}/sunset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, query }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let detail = 'Unable to fetch sunset time';
        try {
          const body = await response.json();
          if (body.detail) detail = body.detail;
        } catch {
          // response wasn't JSON
        }
        throw new Error(detail);
      }
      const data = await response.json();
      setSunset(data);
      setStatus(`Sunset for ${data.location}`);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message);
      }
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (loading) return;
    if (!city.trim()) {
      setError('Enter a city to search.');
      return;
    }
    querySunset({ query: city.trim() });
  };

  const handleGetLocation = () => {
    if (loading) return;
    if (!locationSupported) {
      setError('Geolocation not supported.');
      return;
    }
    setStatus('Requesting your location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('Fetching sunset for your location…');
        querySunset({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      (posError) => {
        const messages = {
          1: 'Location permission denied.',
          2: 'Location unavailable. Try searching for a city instead.',
          3: 'Location request timed out. Try again.',
        };
        setError(messages[posError.code] || 'Could not determine location.');
        setStatus('');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
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
            autoComplete="off"
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'Search'}
          </button>
          {locationSupported && (
            <button className="button" type="button" onClick={handleGetLocation} disabled={loading}>
              Use Location
            </button>
          )}
        </form>

        {status && <div className="status">{status}</div>}
        {error && <div className="status error-text">{error}</div>}

        {sunset && (
          <div className="result">
            <h3>Sunset in {sunset.location}</h3>
            <div className="timestamp">Local: {formatTime(sunset.sunset_local, sunset.timezone)}</div>
            <div className="timestamp">UTC: {formatTime(sunset.sunset_utc, 'UTC')}</div>
            <div className="result-meta">
              Timezone: {sunset.timezone} · Coordinates: {sunset.coordinates[0].toFixed(4)},
              {' '}{sunset.coordinates[1].toFixed(4)}
            </div>
            <div className="result-note">
              Calculated by solar geometry model (±2–3 min accuracy)
            </div>
          </div>
        )}

        <div className="footer">
          <span>Backend: Python FastAPI · Frontend: React/Vite</span>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SunsetApp />
    </ErrorBoundary>
  );
}
