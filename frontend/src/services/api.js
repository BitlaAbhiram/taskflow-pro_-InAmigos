// frontend/src/services/api.js
// ──────────────────────────────────────────────────────────
// Central Axios instance. Attaches the JWT from localStorage
// to every request and auto-redirects to /login on 401.
// ──────────────────────────────────────────────────────────

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request interceptor: attach token ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tfp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tfp_token');
      localStorage.removeItem('tfp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
