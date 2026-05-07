import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../hooks/useWeather';
import WeatherCard from '../components/WeatherCard';
import ForecastStrip from '../components/ForecastStrip';
import Footer from '../components/Footer';

export default function Home() {
  const { user } = useAuth();
  const { weather, forecast, loading, error, fetchByCity, fetchByLocation } = useWeather();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) fetchByCity(search.trim());
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-hero">
          <h1>
            {greeting}, <span>{user?.name?.split(' ')[0] || 'Friend'}</span>! 👋
          </h1>
          <p>Here's your weather update for today. Ask SkyBot anything about the weather!</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              id="city-search"
              className="form-input"
              type="text"
              placeholder="🔍 Search city (e.g. Paris, London...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button id="search-btn" className="btn btn-primary" type="submit">Search</button>
            <button id="location-btn" type="button" className="btn btn-secondary" onClick={fetchByLocation} title="Use my location">📍</button>
          </form>
        </div>

        {loading && (
          <div className="page-loader">
            <div className="spinner" />
            <p>Fetching weather data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-msg" style={{maxWidth:520,margin:'20px auto',textAlign:'center'}}>
            ⚠️ {error}
          </div>
        )}

        {!loading && weather && (
          <>
            <div className="weather-grid">
              <WeatherCard weather={weather} />
              <div className="glass-card" style={{padding:28}}>
                <h3 style={{fontFamily:'var(--font-display)',marginBottom:16}}>🌡️ Details</h3>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    { label:'🌅 Sunrise', value: new Date(weather.sys?.sunrise * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) },
                    { label:'🌇 Sunset', value: new Date(weather.sys?.sunset * 1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) },
                    { label:'🌡️ Min / Max', value: `${Math.round(weather.main.temp_min)}°C / ${Math.round(weather.main.temp_max)}°C` },
                    { label:'☁️ Cloudiness', value: `${weather.clouds?.all || 0}%` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--glass-border)'}}>
                      <span style={{color:'var(--muted)'}}>{label}</span>
                      <span style={{fontWeight:600}}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="forecast-section">
              <ForecastStrip forecast={forecast} />
            </div>
          </>
        )}
      </div>

      <Link to="/chat" className="float-chat-btn" title="Open SkyBot Chat">💬</Link>
      <Footer />
    </div>
  );
}
