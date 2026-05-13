import axios from 'axios';
import { supabase } from '../lib/supabase';

const apiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE = apiUrl
  ? apiUrl.replace(/\/$/, '').endsWith('/api')
    ? apiUrl.replace(/\/$/, '')
    : `${apiUrl.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Supabase token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Remove old auth service endpoints since we use Supabase Auth now
export const habitService = {
  createHabit: async (name, category, difficulty_weight, color) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ name, category, difficulty_weight, color }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(payload.error || 'Request failed');
      error.response = { status: response.status, data: payload };
      throw error;
    }

    return { data: payload, status: response.status };
  },
  getHabits: () => api.get('/habits'),
  updateHabit: (id, data) => api.put(`/habits/${id}`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  reorderHabits: (orderedIds) => api.put('/habits/reorder', { orderedIds }),
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
