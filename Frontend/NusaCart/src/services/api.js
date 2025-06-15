import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6060',
  withCredentials: true,  // Pastikan cookies dikirim
  timeout: 60000, // 60 detik timeout untuk upload file
  maxContentLength: 100 * 1024 * 1024, // 100MB max content length
  maxBodyLength: 100 * 1024 * 1024 // 100MB max body length
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

// Response interceptor - Improved untuk handle cookie-based refresh
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
    console.log('[Response Interceptor] Error message:', error.response?.data?.message);

    // Handle 401 Unauthorized errors (token expired or invalid)
    // Tambahkan juga handle 400 dengan pesan 'User not authenticated'
    const isAuthError = (
      error.response?.status === 401 ||
      (error.response?.status === 400 && error.response?.data?.message === 'User not authenticated')
    );
    if (isAuthError && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/api/auth/login') || 
          originalRequest.url?.includes('/api/auth/register') ||
          originalRequest.url?.includes('/api/auth/refresh')) {
        console.log('[Response Interceptor] Skipping refresh for auth endpoint');
        return Promise.reject(error);
      }

      // If already refreshing, queue the request
      if (isRefreshing) {
        console.log('[Response Interceptor] Already refreshing, queueing request');
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(() => {
          console.log('[Response Interceptor] Retrying queued request');
          return api(originalRequest);
        })
        .catch(err => {
          console.error('[Response Interceptor] Queued request failed:', err);
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[Response Interceptor] Attempting token refresh...');
        const refreshResponse = await axios.post('http://localhost:6060/api/auth/refresh', {}, { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        });
        
        console.log('[Response Interceptor] Token refresh successful:', refreshResponse.data);
        processQueue(null);
        
        // Retry the original request
        console.log('[Response Interceptor] Retrying original request');
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('[Response Interceptor] Token refresh failed:', refreshError.response?.data || refreshError.message);
        processQueue(refreshError);
        
        // Clear any auth state and redirect to login
        if (typeof window !== 'undefined') {
          // Clear any stored auth state
          localStorage.removeItem('userLoginStatus');
          sessionStorage.clear();
          
          // Show user-friendly message
          if (refreshError.response?.status === 401) {
            console.log('[Response Interceptor] Session expired, redirecting to login');
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
          } else {
            console.log('[Response Interceptor] Refresh failed, redirecting to login');
            alert('Terjadi masalah dengan autentikasi. Silakan login kembali.');
          }
          
          // Redirect to login
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.warn('[Response Interceptor] Access forbidden (403)');
      if (typeof window !== 'undefined') {
        alert('Anda tidak memiliki akses untuk melakukan tindakan ini.');
      }
    }

    return Promise.reject(error);
  }
);

// Function to proactively refresh token before it expires
export const proactiveTokenRefresh = async () => {
  if (isRefreshing) {
    console.log('[Proactive Refresh] Already refreshing, skipping');
    return;
  }

  try {
    console.log('[Proactive Refresh] Attempting proactive token refresh...');
    isRefreshing = true;
    
    const response = await axios.post('http://localhost:6060/api/auth/refresh', {}, { 
      withCredentials: true,
      timeout: 10000
    });
    
    console.log('[Proactive Refresh] Proactive refresh successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('[Proactive Refresh] Proactive refresh failed:', error.response?.data || error.message);
    
    // If proactive refresh fails, user will be logged out on next API call
    if (error.response?.status === 401) {
      console.log('[Proactive Refresh] Refresh token expired, user will be logged out on next request');
    }
    
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Set up proactive token refresh every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Only refresh if user seems to be active (check if any auth store exists)
    const authState = localStorage.getItem('userLoginStatus');
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        if (parsed.state?.isLoggedIn) {
          console.log('[Proactive Refresh] User is logged in, attempting proactive refresh');
          proactiveTokenRefresh().catch(err => {
            console.log('[Proactive Refresh] Proactive refresh failed, will handle on next API call');
          });
        }
      } catch (e) {
        console.log('[Proactive Refresh] Could not parse auth state');
      }
    }
  }, 10 * 60 * 1000); // 10 minutes
}

// ========================
// PHONE UTILITIES
// ========================

/**
 * Format nomor telepon untuk ditampilkan ke user
 * Mengubah format internasional kembali ke format Indonesia yang familiar
 * 
 * @param {string} phoneNumber - Nomor telepon dalam format internasional (628xxx)
 * @returns {string} - Nomor telepon dalam format yang user-friendly (08xxx)
 */
export const formatPhoneNumberForDisplay = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Jika nomor dimulai dengan 62, ubah ke 08
  if (phoneNumber.startsWith('62')) {
    return '0' + phoneNumber.substring(2);
  }
  
  // Jika sudah dalam format 08, return as is
  if (phoneNumber.startsWith('08')) {
    return phoneNumber;
  }
  
  // Jika format lain, return as is
  return phoneNumber;
};

/**
 * Mask nomor telepon untuk privacy
 * Contoh: 081234567890 -> 0812****7890
 * 
 * @param {string} phoneNumber - Nomor telepon
 * @returns {string} - Nomor telepon yang di-mask
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const formatted = formatPhoneNumberForDisplay(phoneNumber);
  
  if (formatted.length < 8) return formatted;
  
  // Tampilkan 4 digit pertama dan 4 digit terakhir
  const start = formatted.substring(0, 4);
  const end = formatted.substring(formatted.length - 4);
  const middle = '*'.repeat(formatted.length - 8);
  
  return start + middle + end;
};

// ========================
// AUTH API ENDPOINTS
// ========================
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  verifyRegistration: (data) => api.post('/api/auth/verify-registration', data),
  resendRegistrationOTP: (data) => api.post('/api/auth/resend-registration-otp', data),
  updatePhoneRegistration: (data) => api.post('/api/auth/update-phone-registration', data),
  updateEmailRegistration: (data) => api.post('/api/auth/update-email-registration', data),
  getRegistrationInfo: (data) => api.post('/api/auth/get-registration-info', data),
  logout: () => api.post('/api/auth/logout'),
  refresh: () => api.post('/api/auth/refresh'),
  forgotPassword: (data) => api.post('/api/auth/forget_password', data),
  confirmForgotPassword: (data) => api.post('/api/auth/confirm_forget_password', data),
};

// ========================
// USER API ENDPOINTS
// ========================
export const userAPI = {
  getById: (userId) => api.get(`/api/auth/users/${userId}`),
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
// GENERAL CATEGORY API ENDPOINTS
// ========================
export const generalCategoryAPI = {
  getAll: () => api.get('/api/general-categories'),
};

// ========================
// CATEGORY API ENDPOINTS
// ========================
export const categoryAPI = {
  getAll: (page = 0, size = 10) => api.get(`/api/categories?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/categories/${id}`),
  getByTokoId: (tokoId, page = 0, size = 10) => api.get(`/api/categories/toko/${tokoId}?page=${page}&size=${size}`),
  getMyCategories: (page = 0, size = 10) => api.get(`/api/categories/my-categories?page=${page}&size=${size}`),
  search: (name, page = 0, size = 10) => api.get(`/api/categories/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// ========================
// PRODUCT API ENDPOINTS
// ========================
export const productAPI = {
  getAll: (page = 0, size = 10) => api.get(`/api/products?page=${page}&size=${size}`),
  getAllWithFilters: (queryString) => api.get(`/api/products?${queryString}`),

  // Get all products with comprehensive filtering
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Basic pagination
    queryParams.append('page', params.page || 0);
    queryParams.append('size', params.size || 10);
    
    // Optional filters
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.tokoId) queryParams.append('tokoId', params.tokoId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.minStock) queryParams.append('minStock', params.minStock);
    if (params.productName) queryParams.append('productName', params.productName);
    if (params.generalCategory) queryParams.append('generalCategory', params.generalCategory);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly);
    
    return api.get(`/api/products?${queryParams.toString()}`);
  },
  
  getById: (id) => api.get(`/api/products/${id}`),
  getByTokoId: (tokoId, page = 0, size = 10) => api.get(`/api/products/toko/${tokoId}?page=${page}&size=${size}`),
  getByCategoryId: (categoryId) => api.get(`/api/products/category/${categoryId}`),
  search: (name) => api.get(`/api/products/search?name=${encodeURIComponent(name)}`),
  getActive: () => api.get('/api/products/active'),
  getBySellerId: (sellerId) => api.get(`/api/products/seller/${sellerId}`),
  
  // Create with JSON (for SellerDashboard) or multipart form data (for ProductCreator)
  create: (data) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify({
      productName: data.productName,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      idCategory: data.idCategory ? Number(data.idCategory) : undefined,
      isActive: data.isActive,
      generalCategory: data.generalCategory || undefined
    }));
    if (data.images) {
      data.images.forEach(img => formData.append('images', img));
    }
    return api.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  // Update with JSON (for SellerDashboard) or multipart form data (for ProductCreator)
  update: (id, data) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify({
      productName: data.productName,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      idCategory: data.idCategory ? Number(data.idCategory) : undefined,
      isActive: data.isActive,
      generalCategory: data.generalCategory || undefined
    }));
    if (data.images) {
      data.images.forEach(img => formData.append('images', img));
    }
    return api.put(`/api/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  // Update JSON only (no images) - for backward compatibility
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
  search: (name, page = 0, size = 10) => {
    if (name && name.trim()) {
      return api.get(`/api/toko/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
    } else {
      return api.get(`/api/toko/search?page=${page}&size=${size}`);
    }
  },
  // Note: POST endpoint tidak tersedia di backend
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
  updatePaymentStatus: (orderId, data) => api.put(`/api/payments/orders/${orderId}/payment-status`, data),
  updateOrderStatus: (orderId, data) => api.put(`/api/payments/orders/${orderId}/order-status`, data),
};

// ========================
// PAYMENT METHOD API ENDPOINTS
// ========================
export const paymentMethodAPI = {
  getAll: () => api.get('/api/payment-methods'),
  getActive: () => api.get('/api/payment-methods/active'),
  getByType: (type) => api.get(`/api/payment-methods/by-type?type=${encodeURIComponent(type)}`),
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
  getAll: () => api.get('/api/wishlist'), // Gets current user's wishlist
  create: (data) => api.post('/api/wishlist', data),
  getById: (id) => api.get(`/api/wishlist/${id}`),
  getByUserId: (userId) => api.get(`/api/wishlist/user/${userId}`),
  update: (id, data) => api.put(`/api/wishlist/${id}`, data),
  delete: (id) => api.delete(`/api/wishlist/${id}`),
  addProduct: (productId) => api.post(`/api/wishlist/${productId}`),
  removeProduct: (productId) => api.delete(`/api/wishlist/${productId}`),
};

// ========================
// DISCOUNT API ENDPOINTS
// ========================
export const discountAPI = {
  getByCode: (promoCode) => api.get(`/api/discounts/${encodeURIComponent(promoCode)}`),
  create: (data) => api.post('/api/discounts', data),
  update: (promoCode, data) => api.put(`/api/discounts/${encodeURIComponent(promoCode)}`, data),
};

// ========================
// REVIEW API ENDPOINTS
// ========================
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/api/reviews/product/${productId}`),
  create: (data) => api.post('/api/reviews', data),
  update: (reviewId, data) => api.put(`/api/reviews/${encodeURIComponent(reviewId)}`, data),
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
  // Profile image upload
  uploadProfile: (formData) => api.post('/api/images/upload/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Product image upload (single)
  uploadProduct: (formData) => api.post('/api/images/upload/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Store image upload
  uploadStore: (formData) => api.post('/api/images/upload/store', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Product multiple images upload
  uploadProductMultiple: (formData) => api.post('/api/images/upload/product/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // General upload
  upload: (formData) => api.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ========================
// CHAT API ENDPOINTS (Using real backend endpoints)
// ========================
export const chatAPI = {
  // Send a message (real backend endpoint)
  sendMessage: (data) => api.post('/api/chat/send', data),
  
  // Get chat history between users (real backend endpoint) 
  getChatHistory: (receiverId) => api.get(`/api/chat/history?receiverId=${receiverId}`),
  
  // Report chat (real backend endpoint)
  reportChat: (data) => api.post('/api/chat/report', data),
  
  // Get store info for chat
  getStoreInfo: (storeId) => api.get(`/api/toko/${storeId}`),
};

export default api;