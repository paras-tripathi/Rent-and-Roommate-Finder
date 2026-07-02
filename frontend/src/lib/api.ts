import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Listings
export const listingsAPI = {
  getAll: (params?: any) => api.get('/listings', { params }),
  getOne: (id: string) => api.get(`/listings/${id}`),
  getMy: () => api.get('/listings/my'),
  create: (data: any) => api.post('/listings', data),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  markFilled: (id: string) => api.patch(`/listings/${id}/fill`),
};

// Profiles
export const profilesAPI = {
  getTenant: () => api.get('/profiles/tenant'),
  saveTenant: (data: any) => api.post('/profiles/tenant', data),
  saveOwner: (data: any) => api.post('/profiles/owner', data),
};

// Compatibility
export const compatibilityAPI = {
  get: (listingId: string) => api.get(`/compatibility/${listingId}`),
};

// Interests
export const interestsAPI = {
  send: (data: any) => api.post('/interests', data),
  getMy: () => api.get('/interests/mine'),
  respond: (id: string, status: string) => api.patch(`/interests/${id}/respond`, { status }),
};

// Chat
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getRoom: (id: string) => api.get(`/chat/rooms/${id}`),
  getMessages: (id: string, page?: number) => api.get(`/chat/rooms/${id}/messages`, { params: { page } }),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.patch('/notifications/read'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUser: (id: string) => api.patch(`/admin/users/${id}/toggle`),
  getListings: (params?: any) => api.get('/admin/listings', { params }),
};
