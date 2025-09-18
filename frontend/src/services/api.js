import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor - Token from localStorage:', token);
    console.log('API Interceptor - Request URL:', config.url);
    console.log('API Interceptor - Full URL:', config.baseURL + config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor - Authorization header set:', config.headers.Authorization);
    } else {
      console.log('API Interceptor - No token found in localStorage');
    }
    console.log('API Interceptor - Request config:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductsByCategory: (category, limit) => 
    api.get(`/products/category/${category}`, { params: { limit } }),
  getProductsByBrand: (brand, limit) => 
    api.get(`/products/brand/${brand}`, { params: { limit } }),
  getFeaturedProducts: (limit) => 
    api.get('/products/featured', { params: { limit } }),
  getSearchSuggestions: (query) => 
    api.get('/products/search/suggestions', { params: { q: query } }),
  getBrands: () => api.get('/products/brands/list'),
  addReview: (productId, rating, comment) => 
    api.post(`/products/${productId}/review`, { rating, comment }),
};

// Admin Products API
export const adminProductsAPI = {
  getAllProducts: (params) => api.get('/products/admin/all', { params }),
  createProduct: (productData) => api.post('/products/admin', productData),
  updateProduct: (id, productData) => api.put(`/products/admin/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/admin/${id}`),
  toggleProductStatus: (id) => api.put(`/products/admin/${id}/toggle-status`),
};

// AI API
export const aiAPI = {
  getRecommendations: (data) => api.post('/ai/recommendations', data),
  chatBot: (message, conversationId) => 
    api.post('/ai/chatbot', { message, conversationId }),
  imageSearch: (imageUrl, description) => 
    api.post('/ai/image-search', { imageUrl, description }),
  smartFilters: (query) => api.post('/ai/smart-filters', { query }),
  getTrending: () => api.get('/ai/trending'),
};

// Users API
export const usersAPI = {
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  getOrders: (params) => api.get('/users/orders', { params }),
  getRecommendations: () => api.get('/users/recommendations'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  trackOrder: (orderNumber) => api.get(`/orders/tracking/${orderNumber}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadImages: (formData) => api.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteImage: (filename) => api.delete(`/upload/image/${filename}`)
};

// Payments API
export const paymentsAPI = {
  initiateMpesaStkPush: ({ amount, phone, accountReference, description }) =>
    api.post('/payments/mpesa/stkpush', { amount, phone, accountReference, description }),
};

export default api;
