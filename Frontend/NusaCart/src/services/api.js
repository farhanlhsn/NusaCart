import axios from 'axios';
import useAuthStore from '../stores/authStore';
// import { useNavigate } from 'react-router-dom'; // Tidak digunakan di sini

const api = axios.create({
  baseURL: 'http://localhost:6060', 
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    console.log('[Request Interceptor] Token from store:', accessToken); // LOG 1
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('[Request Interceptor] Authorization header set with token from store.'); // LOG 2
    }
    // Jika header sudah diatur manual oleh response interceptor untuk retry, jangan timpa jika store belum update
    // Namun, untuk sekarang kita biarkan logika ini untuk melihat perilakunya.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
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

    console.log('[Response Interceptor] Error status:', error.response?.status); // LOG 3
    console.log('[Response Interceptor] Original request URL:', originalRequest.url); // LOG 4
    console.log('[Response Interceptor] Original request _retry flag:', originalRequest._retry); // LOG 5

    const { refreshToken, login, logout, user: currentUser } = useAuthStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[Response Interceptor] Attempting token refresh. Current refreshToken:', refreshToken); // LOG 6

      if (refreshToken) {
        try {
          console.log('[Response Interceptor] Calling /api/auth/refresh...');
          const refreshResponse = await axios.post('http://localhost:6060/api/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse.data;
          console.log('[Response Interceptor] Refresh successful. New accessToken:', newAccessToken); // LOG 7
          
          login({ 
            accessToken: newAccessToken,  
            refreshToken: newRefreshToken, 
            user: currentUser 
          });
          console.log('[Response Interceptor] Called authStore.login(). State after login call:', useAuthStore.getState().accessToken); // LOG 8
          
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log('[Response Interceptor] Original request header updated for retry.'); // LOG 9
          
          console.log('[Response Interceptor] Retrying original request...');
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[Response Interceptor] Failed to refresh token:', refreshError.response?.data || refreshError.message); // LOG 10
          logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        console.log('[Response Interceptor] No refresh token available. Logging out.'); // LOG 11
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;