import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skybot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// Weather
export const getCurrentWeather = (params) => api.get('/weather/current', { params });
export const getForecast = (params) => api.get('/weather/forecast', { params });

// Chat
export const sendMessage = (data) => api.post('/chat/message', data);
export const getChatHistory = () => api.get('/chat/history');
export const getChatSession = (sessionId) => api.get(`/chat/history/${sessionId}`);
export const deleteChatSession = (sessionId) => api.delete(`/chat/history/${sessionId}`);

export default api;
