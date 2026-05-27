import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getMonthlySummary: (empId, month) => api.get(`/attendance/${empId}/monthly`, { params: { month } }),
};

export const payrollService = {
  generate: (month) => api.post('/payroll/generate', { month }),
  getRecords: (empId, month) => api.get(`/payroll/${empId}`, { params: { month } }),
};

export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  createTransaction: (data) => api.post('/inventory/transaction', data),
};

export const riskService = {
  getScores: (params) => api.get('/risk/scores', { params }),
  predict: (empId, month) => api.get(`/risk/predict/${empId}`, { params: { month } }),
  retrain: (stage) => api.post('/risk/retrain', { stage }),
  getMlStatus: () => api.get('/risk/ml-status'),
};

export const decisionService = {
  submit: (data) => api.post('/decisions', data),
  getHistory: (empId) => api.get(`/decisions/${empId}`),
};

export const dashboardService = {
  getSummary: (month) => api.get('/dashboard/summary', { params: { month } }),
};

export default api;
