import { useState, useRef, useEffect, useCallback } from 'react'
import Header from './components/Header'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import ChatInput from './components/ChatInput'
import SuggestionChips from './components/SuggestionChips'
import { CurrentWeatherCard, ForecastCard, HistoricalWeatherCard } from './components/WeatherCards'
import { GREETINGS, LANGUAGES } from './constants'
import { sendChatMessage } from './api'

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2)
}

/**
 * Try to extract a weather-data JSON object embedded in the backend
 * conversationHistory tool result, and decide which card to render.
 */
function extractWeatherCard(conversationHistory) {
  if (!conversationHistory?.length) return null
  // Walk backwards from end to find last tool result
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i]
    if (msg.role === 'user' && msg.name?.startsWith('get_')) {
      try {
        const parsed = JSON.parse(msg.content)
        if (parsed?.data) {
          const d = parsed.data
          if (msg.name === 'get_current_and_forecast_weather') {
            return (
              <>
                <CurrentWeatherCard data={d} />
                <ForecastCard forecast={d.forecast} />
              </>
            )
          }
          if (msg.name === 'get_historical_weather') {
            return <HistoricalWeatherCard data={d} />
          }
        }
      } catch (_) { /* ignore */ }
      break
    }
  }
  return null
}

// ────────────────────────────────────────────────────
// Main App
// ────────────────────────────────────────────────────

export default function App() {
  const [language, setLanguage]               = useState('en')
  const [messages, setMessages]               = useState([])        // { id, role, content, weatherCard? }
  const [conversationHistory, setHistory]     = useState([])        // raw API history
  const [loading, setLoading]                 = useState(false)
  const [showChips, setShowChips]             = useState(true)
  const bottomRef                             = useRef(null)

  const isRTL = ['ar', 'darija'].includes(language)

  // ── Initialise greeting ──────────────────────────
  useEffect(() => {
    setMessages([
      { id: makeId(), role: 'assistant', content: GREETINGS[language] }
    ])
    setShowChips(true)
    setHistory([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // only once on mount

  // ── Scroll to bottom ─────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Language change ───────────────────────────────
  function handleLanguageChange(lang) {
    setLanguage(lang)
  }

  // ── Clear chat ────────────────────────────────────
  function handleClearChat() {
    setMessages([{ id: makeId(), role: 'assistant', content: GREETINGS[language] }])
    setHistory([])
    setShowChips(true)
  }

  // ── Send message ──────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!text.trim() || loading) return
    setShowChips(false)

    // Add user bubble
    const userMsg = { id: makeId(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const result = await sendChatMessage(text, conversationHistory, language)

      if (result.success) {
        const card = extractWeatherCard(result.conversationHistory)
        const botMsg = {
          id: makeId(),
          role: 'assistant',
          content: result.message,
          weatherCard: card,
        }
        setMessages(prev => [...prev, botMsg])
        setHistory(result.conversationHistory)
      } else {
        setMessages(prev => [...prev, {
          id: makeId(),
          role: 'assistant',
          content: `⚠️ ${result.error || 'Something went wrong. Please try again.'}`,
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: makeId(),
        role: 'assistant',
        content: `⚠️ Network error: ${err.message}. Is the backend running on port 3000?`,
      }])
    } finally {
      setLoading(false)
    }
  }, [loading, conversationHistory, language])

  // ── Geolocation ───────────────────────────────────
  function handleGeolocate() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        handleSend(`What's the weather at coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)}?`)
      },
      () => alert('Unable to get location. Please allow location access.')
    )
  }

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                        bg-primary-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                        bg-indigo-600/10 blur-3xl" />
      </div>

      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onClearChat={handleClearChat}
      />

      {/* ── Chat messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-0">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isRTL={isRTL}
            weatherCard={msg.weatherCard}
          />
        ))}

        {loading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </main>

      {/* ── Suggestion chips (shown on fresh chat) ── */}
      <SuggestionChips
        language={language}
        onSelect={handleSend}
        visible={showChips && !loading}
      />

      {/* ── Input area ── */}
      <ChatInput
        onSend={handleSend}
        onGeolocate={handleGeolocate}
        language={language}
        disabled={loading}
        isRTL={isRTL}
      />
    </div>
  )
}
