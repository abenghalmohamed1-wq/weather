import LanguageSelector from './LanguageSelector'

export default function Header({ language, onLanguageChange, onClearChat }) {
  return (
    <header className="flex-shrink-0 glass border-b border-surface-border/60 px-4 py-3
                       flex items-center justify-between gap-3 relative z-10">
      {/* Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center text-lg shadow-lg shadow-primary-700/30 flex-shrink-0">
          🌦️
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-white leading-none truncate">WeatherAI</h1>
          <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">
            Current • Forecast • Historical
          </p>
        </div>
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
        <span className="text-xs text-slate-400 hidden sm:inline">Live</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <LanguageSelector value={language} onChange={onLanguageChange} />

        {/* Clear chat */}
        <button
          onClick={onClearChat}
          title="Clear chat"
          className="btn-ghost text-slate-400 hover:text-red-400 p-2 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
