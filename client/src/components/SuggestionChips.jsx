import { SUGGESTION_CHIPS } from '../constants'

export default function SuggestionChips({ language, onSelect, visible }) {
  const chips = SUGGESTION_CHIPS[language] || SUGGESTION_CHIPS.en

  if (!visible) return null

  return (
    <div className="px-4 pb-3 flex flex-wrap gap-2 animate-slide-up">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="text-xs px-3 py-1.5 rounded-full
                     bg-surface-card border border-surface-border hover:border-primary-500/60
                     text-slate-300 hover:text-primary-300
                     transition-all duration-200 hover:shadow-md hover:shadow-primary-600/10
                     active:scale-95"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
