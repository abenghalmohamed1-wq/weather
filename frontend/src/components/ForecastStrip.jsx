import { getWeatherEmoji } from './WeatherCard';

export default function ForecastStrip({ forecast }) {
  if (!forecast?.list?.length) return null;

  const days = forecast.list.slice(0, 5);

  return (
    <div className="glass-card forecast-strip">
      <h3>5-Day Forecast</h3>
      <div className="forecast-list">
        {days.map((item, i) => {
          const date = new Date(item.dt * 1000);
          const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div className="forecast-item" key={item.dt}>
              <div className="forecast-day">{dayName}</div>
              <div className="forecast-emoji">{getWeatherEmoji(item.weather[0]?.description)}</div>
              <div className="forecast-temp">{Math.round(item.main.temp)}°C</div>
              <div className="forecast-desc">{item.weather[0]?.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
