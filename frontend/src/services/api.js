import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skybot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 errors (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('skybot_token');
      localStorage.removeItem('skybot_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
