const weatherIcons = {
  'clear sky': '☀️', 'few clouds': '🌤️', 'scattered clouds': '⛅',
  'broken clouds': '🌥️', 'overcast clouds': '☁️',
  'shower rain': '🌦️', 'rain': '🌧️', 'light rain': '🌧️',
  'moderate rain': '🌧️', 'thunderstorm': '⛈️', 'snow': '❄️',
  'light snow': '🌨️', 'mist': '🌫️', 'fog': '🌫️', 'haze': '🌫️',
  'drizzle': '🌦️', 'tornado': '🌪️',
};

export const getWeatherEmoji = (description = '') => {
  const lower = description.toLowerCase();
  for (const [key, emoji] of Object.entries(weatherIcons)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌈';
};

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const emoji = getWeatherEmoji(weather.weather[0]?.description);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="glass-card weather-card">
      <div className="weather-card-header">
        <div className="weather-location">
          <h2>📍 {weather.name}</h2>
          <p>{weather.sys?.country} · {date}</p>
        </div>
        <div className="weather-icon-emoji">{emoji}</div>
      </div>

      <div className="weather-temp">
        {Math.round(weather.main.temp)}<sup>°C</sup>
      </div>
      <p className="weather-condition">{weather.weather[0]?.description}</p>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 4 }}>
        Feels like {Math.round(weather.main.feels_like)}°C
      </p>

      <div className="weather-stats">
        <div className="weather-stat">
          <div className="stat-label">💧 Humidity</div>
          <div className="stat-value">{weather.main.humidity}%</div>
        </div>
        <div className="weather-stat">
          <div className="stat-label">💨 Wind</div>
          <div className="stat-value">{weather.wind.speed} m/s</div>
        </div>
        <div className="weather-stat">
          <div className="stat-label">👁️ Visibility</div>
          <div className="stat-value">{((weather.visibility || 0) / 1000).toFixed(1)} km</div>
        </div>
        <div className="weather-stat">
          <div className="stat-label">📊 Pressure</div>
          <div className="stat-value">{weather.main.pressure} hPa</div>
        </div>
      </div>
    </div>
  );
}
