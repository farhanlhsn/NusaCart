import { create } from 'zustand';
import api from '../services/api';

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: '',
  currentPage: 1,
  totalPages: 1,
  pageSize: 20,
  totalItems: 0,
  fetchProducts: async (page = 0, size = 20) => {
    set({ loading: true, error: '', currentPage: page + 1, pageSize: size });
    try {
      const res = await api.get(`/api/products?page=${page}&size=${size}`);
      const data = res.data.content || res.data.products || res.data;
      set({
        products: Array.isArray(data) ? data : [],
        loading: false,
        totalPages: res.data.totalPages || 1,
        totalItems: res.data.totalElements || (Array.isArray(data) ? data.length : 0)
      });
    } catch (err) {
      set({ error: 'Gagal memuat produk. Silakan coba lagi.', loading: false });
    }
  },
  clearError: () => set({ error: '' })
}));

export default useProductStore; 