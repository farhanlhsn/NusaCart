import axios from 'axios';

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

// ========================
// AUTH API ENDPOINTS
// ========================
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post('/api/auth/refresh'),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// ========================
// USER API ENDPOINTS
// ========================
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/update_profile', data),
};

// ========================
// SELLER API ENDPOINTS
// ========================
export const sellerAPI = {
  register: (data) => api.post('/api/seller/register', data),
};

// ========================
// CATEGORY API ENDPOINTS
// ========================
export const categoryAPI = {
  getAll: (page = 0, size = 10) => api.get(`/api/categories?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/categories/${id}`),
  getByTokoId: (tokoId, page = 0, size = 10) => api.get(`/api/categories/toko/${tokoId}?page=${page}&size=${size}`),
  getMyCategories: (page = 0, size = 10) => api.get(`/api/categories/my-categories?page=${page}&size=${size}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// ========================
// PRODUCT API ENDPOINTS
// ========================
export const productAPI = {
  getAll: (page = 0, size = 10) => api.get(`/api/products?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/products/${id}`),
  getByTokoId: (tokoId, page = 0, size = 10) => api.get(`/api/products/toko/${tokoId}?page=${page}&size=${size}`),
  getActive: () => api.get('/api/products/active'),
  getBySellerId: (sellerId) => api.get(`/api/products/seller/${sellerId}`),
  create: (formData) => api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateJson: (id, data) => api.put(`/api/products/${id}/json`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// ========================
// TOKO API ENDPOINTS
// ========================
export const tokoAPI = {
  getAll: (page = 0, size = 10) => api.get(`/api/toko?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/toko/${id}`),
  getMyStores: () => api.get('/api/toko/my-stores'),
  search: (name, page = 0, size = 10) => api.get(`/api/toko/search?name=${name}&page=${page}&size=${size}`),
  create: (data) => api.post('/api/toko', data),
  update: (id, data) => api.put(`/api/toko/${id}`, data),
  delete: (id) => api.delete(`/api/toko/${id}`),
};

// ========================
// CART API ENDPOINTS
// ========================
export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (data) => api.post('/api/cart', data),
  updateQuantity: (id, quantity) => api.put(`/api/cart/${id}?quantity=${quantity}`),
  remove: (id) => api.delete(`/api/cart/${id}`),
};

// ========================
// ORDER API ENDPOINTS
// ========================
export const orderAPI = {
  place: (data) => api.post('/api/orders', data),
  getAll: () => api.get('/api/orders'),
};

// ========================
// PAYMENT API ENDPOINTS
// ========================
export const paymentAPI = {
  updateStatus: (paymentId, data) => api.put(`/api/payments/${paymentId}/status`, data),
  updateOrderStatus: (orderId, data) => api.put(`/api/payments/${orderId}/order-status`, data),
};

// ========================
// PAYMENT METHOD API ENDPOINTS
// ========================
export const paymentMethodAPI = {
  getAll: () => api.get('/api/payment-methods'),
  getActive: () => api.get('/api/payment-methods/active'),
  getByType: (type) => api.get(`/api/payment-methods/by-type?type=${type}`),
};

// ========================
// ADDRESS API ENDPOINTS
// ========================
export const addressAPI = {
  getAll: () => api.get('/api/address'),
  create: (data) => api.post('/api/address/new_address', data),
  update: (id, data) => api.put(`/api/address/update_address/${id}`, data),
  delete: (id) => api.delete(`/api/address/remove_address/${id}`),
  setMain: (id) => api.put(`/api/address/set_main/${id}`),
};

// ========================
// WISHLIST API ENDPOINTS
// ========================
export const wishlistAPI = {
  getAll: () => api.get('/api/wishlist'),
  create: (data) => api.post('/api/wishlist', data),
  getById: (id) => api.get(`/api/wishlist/${id}`),
  update: (id, data) => api.put(`/api/wishlist/${id}`, data),
  delete: (id) => api.delete(`/api/wishlist/${id}`),
  addProduct: (wishlistId, productId) => api.post(`/api/wishlist/${wishlistId}/add/${productId}`),
  removeProduct: (wishlistId, productId) => api.delete(`/api/wishlist/${wishlistId}/remove/${productId}`),
};

// ========================
// DISCOUNT API ENDPOINTS
// ========================
export const discountAPI = {
  getByCode: (promoCode) => api.get(`/api/discounts/${promoCode}`),
  create: (data) => api.post('/api/discounts', data),
  update: (promoCode, data) => api.put(`/api/discounts/${promoCode}`, data),
};

// ========================
// REVIEW API ENDPOINTS
// ========================
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/api/reviews/product/${productId}`),
  create: (data) => api.post('/api/reviews', data),
  update: (reviewId, data) => api.put(`/api/reviews/${reviewId}`, data),
};

// ========================
// TRACKING API ENDPOINTS
// ========================
export const trackingAPI = {
  add: (orderId, data) => api.post(`/api/tracking/${orderId}`, data),
  getByOrder: (orderId) => api.get(`/api/tracking/${orderId}`),
};

// ========================
// IMAGE UPLOAD API ENDPOINTS
// ========================
export const imageAPI = {
  upload: (formData) => api.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/api/images/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;