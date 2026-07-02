// frontend/src/services/apiServices.js
// ──────────────────────────────────────────────────────────
// Every API call in the app goes through here. Keeps
// components clean and makes mocking trivial for tests.
// ──────────────────────────────────────────────────────────

import api from './api';

// ─── AUTH ─────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  getMe:    ()     => api.get('/auth/me'),
};

// ─── USERS ────────────────────────────────────────────────
export const userService = {
  getAll:          ()       => api.get('/users'),
  updateProfile:   (data)   => api.put('/users/profile', data),
  changePassword:  (data)   => api.put('/users/change-password', data),
  // admin
  adminGetAll:     ()       => api.get('/users/admin/all'),
  adminUpdate:     (id, d)  => api.put(`/users/admin/${id}`, d),
  adminDelete:     (id)     => api.delete(`/users/admin/${id}`),
};

// ─── PROJECTS ─────────────────────────────────────────────
export const projectService = {
  create:       (data)         => api.post('/projects', data),
  getAll:       ()             => api.get('/projects'),
  getById:      (id)           => api.get(`/projects/${id}`),
  update:       (id, data)     => api.put(`/projects/${id}`, data),
  delete:       (id)           => api.delete(`/projects/${id}`),
  addMember:    (id, data)     => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId)   => api.delete(`/projects/${id}/members/${userId}`),
};

// ─── TASKS ────────────────────────────────────────────────
export const taskService = {
  create:       (data)         => api.post('/tasks', data),
  getAll:       (params)       => api.get('/tasks', { params }),
  getById:      (id)           => api.get(`/tasks/${id}`),
  update:       (id, data)     => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status)   => api.patch(`/tasks/${id}/status`, { status }),
  delete:       (id)           => api.delete(`/tasks/${id}`),
  addComment:   (id, text)     => api.post(`/tasks/${id}/comments`, { text }),
};

// ─── NOTIFICATIONS ────────────────────────────────────────
export const notificationService = {
  getAll:      ()    => api.get('/notifications'),
  markRead:    (id)  => api.patch(`/notifications/${id}/read`),
  markAllRead: ()    => api.patch('/notifications/read-all'),
  delete:      (id)  => api.delete(`/notifications/${id}`),
};

// ─── ANALYTICS ────────────────────────────────────────────
export const analyticsService = {
  dashboard:    ()       => api.get('/analytics/dashboard'),
  productivity: (days)   => api.get('/analytics/productivity', { params: { days } }),
  projects:     ()       => api.get('/analytics/projects'),
  adminReport:  ()       => api.get('/analytics/admin'),
};
