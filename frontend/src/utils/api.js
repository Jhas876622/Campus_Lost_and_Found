import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const collegeStr = localStorage.getItem('selectedCollege');
    if (collegeStr && config.method === 'get') {
      try {
        const college = JSON.parse(collegeStr);
        const collegeId = college._id || college.id || college.slug;
        if (collegeId) {
          config.params = { ...config.params, college: collegeId };
        }
      } catch (e) {}
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('college');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (
      error.response?.status === 400 && 
      (message.toLowerCase().includes('select a college') || message.toLowerCase().includes('college is required'))
    ) {
      if (window.location.pathname !== '/select-college' && window.location.pathname !== '/register-college') {
        window.location.href = '/select-college';
      }
    }
    
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Colleges API
export const collegesAPI = {
  getAll: (params) => api.get('/colleges', { params }),
  getOne: (slug) => api.get(`/colleges/${slug}`),
  register: (formData) => api.post('/colleges/register', formData),
  update: (id, formData) => api.put(`/colleges/${id}`, formData),
  getStats: (id) => api.get(`/colleges/${id}/stats`),
  // Super Admin
  getAllAdmin: (params) => api.get('/colleges/admin/all', { params }),
  verify: (id) => api.put(`/colleges/${id}/verify`),
  toggleStatus: (id) => api.put(`/colleges/${id}/toggle-status`),
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout'),
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (formData) => api.post('/items', formData),
  update: (id, formData) => api.put(`/items/${id}`, formData),
  delete: (id) => api.delete(`/items/${id}`),
  getMyItems: (params) => api.get('/items/user/my-items', { params }),
  report: (id, reason) => api.post(`/items/${id}/report`, { reason }),
  getStats: () => api.get('/items/stats'),
};

// Claims API
export const claimsAPI = {
  create: (formData) => api.post('/claims', formData),
  getMyClaims: (params) => api.get('/claims/my-claims', { params }),
  getItemClaims: (itemId) => api.get(`/claims/item/${itemId}`),
  getOne: (id) => api.get(`/claims/${id}`),
  updateStatus: (id, data) => api.put(`/claims/${id}/status`, data),
  cancel: (id) => api.put(`/claims/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getReportedItems: (params) => api.get('/admin/reported-items', { params }),
  handleReport: (id, action) => api.put(`/admin/items/${id}/handle-report`, { action }),
};

export default api;
