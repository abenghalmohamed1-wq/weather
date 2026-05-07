import { LANGUAGES } from '../constants'

export default function LanguageSelector({ value, onChange }) {
  const active = LANGUAGES.find(l => l.code === value)

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-sm
                   hover:border-primary-500/60 transition-all duration-200"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{active?.flag}</span>
        <span className="text-slate-300 hidden sm:inline">{active?.label}</span>
        <svg className="w-3 h-3 text-slate-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-40 glass rounded-2xl shadow-xl
                      opacity-0 pointer-events-none group-focus-within:opacity-100
                      group-focus-within:pointer-events-auto transition-all duration-200
                      z-50 overflow-hidden">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                        hover:bg-primary-600/20 transition-colors duration-150
                        ${value === lang.code ? 'text-primary-400 bg-primary-600/10' : 'text-slate-300'}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {value === lang.code && (
              <svg className="w-3 h-3 ml-auto text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
