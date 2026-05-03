import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (email, username, password) =>
    api.post('/auth/register', { email, username, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/me'),
};

export const habitService = {
  createHabit: (name, category, difficulty_weight, color) =>
    api.post('/habits', { name, category, difficulty_weight, color }),
  getHabits: () => api.get('/habits'),
  updateHabit: (id, data) => api.put(`/habits/${id}`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
};

export const logService = {
  logCompletion: (habitId, date, completed) =>
    api.post('/logs', { habitId, date, completed }),
  getLogs: (startDate, endDate) =>
    api.get(`/logs/user/:userId`, { params: { startDate, endDate } }),
  getHabitLogs: (habitId, startDate, endDate) =>
    api.get(`/logs/habit/${habitId}`, { params: { startDate, endDate } }),
  getDailyStats: (date) => api.get(`/logs/stats/daily/${date}`),
};

export const gamificationService = {
  getStats: () => api.get('/gamification/stats'),
  getLeaderboard: (limit = 10) =>
    api.get('/gamification/leaderboard', { params: { limit } }),
};

export default api;
