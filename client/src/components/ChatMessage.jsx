/**
 * Individual chat message bubble.
 * Supports user and assistant roles, RTL text, and optional weather card.
 */
export default function ChatMessage({ role, content, isRTL, weatherCard }) {
  const isUser = role === 'user'

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center text-sm shadow-lg shadow-primary-700/30 mt-0.5">
          🌦️
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Bubble */}
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm shadow-md shadow-primary-700/20'
              : 'glass text-slate-100 rounded-tl-sm'
            }`}
        >
          {content}
        </div>

        {/* Optional weather data card (shown below assistant bubble) */}
        {!isUser && weatherCard}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700
                        flex items-center justify-center text-sm mt-0.5 border border-surface-border">
          👤
        </div>
      )}
    </div>
  )
}
