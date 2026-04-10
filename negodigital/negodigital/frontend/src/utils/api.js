import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor: Attach JWT ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('negodigital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: Handle errors ───
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.message ||
      'Error de conexión. Intenta de nuevo.';

    // Token expired → logout
    if (error.response?.status === 401) {
      localStorage.removeItem('negodigital_token');
      localStorage.removeItem('negodigital_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth endpoints ───
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ─── Business endpoints ───
export const businessAPI = {
  getAll: (params) => api.get('/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  verify: (id, data) => api.post(`/businesses/${id}/verify`, data),
  assign: (id, data) => api.post(`/businesses/${id}/assign`, data),
  deliver: (id, data) => api.post(`/businesses/${id}/deliver`, data),
  approve: (id, data) => api.post(`/businesses/${id}/approve`, data),
  publish: (id) => api.post(`/businesses/${id}/publish`),
  addReview: (id, data) => api.post(`/businesses/${id}/reviews`, data),
  getMetrics: (id) => api.get(`/businesses/${id}/metrics`),
  delete: (id) => api.delete(`/businesses/${id}`),
};

// ─── User endpoints ───
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getCreators: () => api.get('/users/creators'),
  getScoutLeaderboard: () => api.get('/users/scouts/leaderboard'),
  toggleBlacklist: (id, data) => api.put(`/users/${id}/blacklist`, data),
  deleteAccount: (id) => api.delete(`/users/${id}`),
};

// ─── Notification endpoints ───
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
