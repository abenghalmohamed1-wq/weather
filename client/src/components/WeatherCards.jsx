import { tempLabel } from '../utils'

/**
 * Renders a weather data card inline in the assistant bubble.
 * Parses the AI response text for JSON data blocks (not shown in UI).
 * Used independently as a pure presentational component.
 */

export function CurrentWeatherCard({ data }) {
  if (!data) return null
  const { location, current } = data
  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-br from-primary-600/20 to-primary-800/20 border border-primary-500/30 p-4 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary-300 font-medium uppercase tracking-wider">Current Weather</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{location}</p>
        </div>
        <span className="text-4xl">{tempLabel(current.temp)}</span>
      </div>

      {/* Temp row */}
      <div className="flex items-end gap-2">
        <span className="text-5xl font-bold text-white">{Math.round(current.temp)}°</span>
        <span className="text-slate-400 pb-2 capitalize">{current.description}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        {[
          { label: 'Feels like', value: `${Math.round(current.feels_like)}°C` },
          { label: 'Humidity',   value: `${current.humidity}%` },
          { label: 'Wind',       value: `${current.wind_speed} m/s` },
          { label: 'Clouds',     value: `${current.cloudiness}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-card/50 rounded-xl py-2 px-1">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-100 mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ForecastCard({ forecast }) {
  if (!forecast?.length) return null
  // Show daily slots (every 8 = 1 day at 3h intervals)
  const days = forecast.filter((_, i) => i % 2 === 0).slice(0, 4)

  return (
    <div className="mt-3 animate-fade-in">
      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-medium">48h Forecast</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {days.map((slot) => (
          <div key={slot.time}
               className="bg-surface-card/60 border border-surface-border/40 rounded-2xl p-3 text-center">
            <p className="text-xs text-slate-400 truncate">{slot.time.split(',')[0]}</p>
            <p className="text-2xl my-1">{tempLabel(slot.temp)}</p>
            <p className="text-sm font-bold text-slate-100">{Math.round(slot.temp)}°C</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize truncate">{slot.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HistoricalWeatherCard({ data }) {
  if (!data?.historical) return null
  const { location, date, historical: h } = data
  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/40 p-4 space-y-3 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Historical Weather</p>
        <p className="text-sm font-semibold text-slate-200 mt-0.5">{location} — {date}</p>
      </div>

      {/* Temp bar */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{Math.round(h.temp_max)}°</p>
          <p className="text-xs text-slate-400">High</p>
        </div>
        <div className="flex-1 h-2 bg-gradient-to-r from-blue-400 to-red-400 rounded-full opacity-60" />
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400">{Math.round(h.temp_min)}°</p>
          <p className="text-xs text-slate-400">Low</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Average',       value: `${Math.round(h.temp_avg)}°C` },
          { label: 'Precipitation', value: `${h.precipitation} mm` },
          { label: 'Condition',     value: h.weather_description },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-card/50 rounded-xl py-2 px-1">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xs font-semibold text-slate-100 mt-0.5 leading-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
