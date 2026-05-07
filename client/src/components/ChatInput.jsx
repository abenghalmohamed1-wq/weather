import { useState, useRef } from 'react'
import { PLACEHOLDERS } from '../constants'

export default function ChatInput({ onSend, onGeolocate, language, disabled, isRTL }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  function handleSubmit(e) {
    e?.preventDefault()
    const msg = value.trim()
    if (!msg || disabled) return
    onSend(msg)
    setValue('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 bg-surface-card border-t border-surface-border/60"
    >
      {/* Geolocation button */}
      <button
        type="button"
        onClick={onGeolocate}
        disabled={disabled}
        title="Use my location"
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                   bg-surface border border-surface-border text-slate-400
                   hover:text-primary-400 hover:border-primary-500/50
                   transition-all duration-200 active:scale-95 disabled:opacity-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
        </svg>
      </button>

      {/* Text area */}
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.en}
          className="w-full bg-surface border border-surface-border rounded-xl
                     px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500
                     focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                     transition-all duration-200 resize-none leading-relaxed
                     disabled:opacity-50 max-h-32 overflow-y-auto"
          style={{ minHeight: '42px' }}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
          }}
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                   bg-primary-600 hover:bg-primary-500 text-white
                   transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-primary-600/30
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
      >
        {disabled ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        )}
      </button>
    </form>
  )
}
