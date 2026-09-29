// ============================================================
// SCoT ERP — API Client
// ============================================================
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
