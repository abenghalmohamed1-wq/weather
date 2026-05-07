// Weather API client — proxied to backend at /api
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

let sessionId = localStorage.getItem('weatherSessionId') || null

export async function sendChatMessage(message, conversationHistory, language) {
  const { data } = await api.post('/chat/message', {
    message,
    conversationHistory,
    language,
    sessionId,
  })
  if (data.sessionId) {
    sessionId = data.sessionId
    localStorage.setItem('weatherSessionId', sessionId)
  }
  return data
}

export async function getHistory() {
  if (!sessionId) return []
  const { data } = await api.get(`/history/${sessionId}`)
  return data
}

export async function getSavedLocations() {
  if (!sessionId) return []
  const { data } = await api.get(`/locations?sessionId=${sessionId}`)
  return data
}

export async function saveLocation(name) {
  const { data } = await api.post('/locations', { sessionId, name })
  return data
}

// Reverse-geocode coords via backend health + openweather
export async function reverseGeocode(lat, lon) {
  const { data } = await api.get('/geo/reverse', { params: { lat, lon } })
  return data
}
