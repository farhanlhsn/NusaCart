import axios from 'axios';
import useAuthStore from '../stores/authStore';
// import { useNavigate } from 'react-router-dom'; // Tidak digunakan di sini

const api = axios.create({
  baseURL: 'http://localhost:6060',
  withCredentials: true  // Pastikan cookies dikirim
});

// Request interceptor - HAPUS Authorization header logic
api.interceptors.request.use(
  (config) => {
    // Jangan set Authorization header, biarkan cookies yang handle
    console.log('[Request Interceptor] Using cookies for authentication');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor - Update untuk handle cookie-based refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      console.error('[Response Interceptor] Original request config is missing.');
      return Promise.reject(error);
    }

    console.log('[Response Interceptor] Error status:', error.response?.status);
    console.log('[Response Interceptor] Original request URL:', originalRequest.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(() => api(originalRequest))
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('http://localhost:6060/api/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;