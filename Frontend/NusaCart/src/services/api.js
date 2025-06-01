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

// Response interceptor - Update untuk handle cookie-based refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      console.error('[Response Interceptor] Original request config is missing.');
      return Promise.reject(error);
    }

    console.log('[Response Interceptor] Error status:', error.response?.status);
    console.log('[Response Interceptor] Original request URL:', originalRequest.url);

    // Untuk 401 errors, coba refresh token via cookies
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[Response Interceptor] Attempting token refresh via cookies...');

      try {
        const refreshResponse = await axios.post('http://localhost:6060/api/auth/refresh', {}, {
          withCredentials: true  // Gunakan cookies untuk refresh
        });

        console.log('[Response Interceptor] Refresh successful via cookies');
        
        // Retry original request dengan cookies yang sudah diupdate
        console.log('[Response Interceptor] Retrying original request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[Response Interceptor] Failed to refresh token:', refreshError.response?.data || refreshError.message);
        // Redirect ke login jika refresh gagal
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;