import axios from 'axios';

// Единый клиент: пути совпадают с nginx (см. infra/nginx/default.conf)
// Auth:  /auth/login, /auth/register, /auth/verify
// Topic: /topic/api/topic/...
// Admin: /api/admin/...
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
