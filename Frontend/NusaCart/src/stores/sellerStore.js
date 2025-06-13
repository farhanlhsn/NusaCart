import { create } from 'zustand';
import api from '../services/api';

const itemsPerPage = 8;

const useSellerStore = create((set, get) => ({
  store: null,
  products: [],
  loading: false,
  error: '',
  currentPage: 1,
  searchTerm: '',
  categories: [],
  showProductModal: false,
  editProduct: null,
  showStoreModal: false,
  storeImage: '',
  showCategoryModal: false,
  newCategoryId: null,
  totalPages: 1,

  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setShowProductModal: (show) => set({ showProductModal: show }),
  setEditProduct: (prod) => set({ editProduct: prod }),
  setShowStoreModal: (show) => set({ showStoreModal: show }),
  setStoreImage: (img) => set({ storeImage: img }),
  setShowCategoryModal: (show) => set({ showCategoryModal: show }),
  setNewCategoryId: (id) => set({ newCategoryId: id }),
  setCategories: (cats) => set({ categories: cats }),

  fetchStoreAndProducts: async (user, page, searchTerm) => {
    set({ loading: true, error: '' });
    try {
      // 1. Ambil toko milik seller
      const tokoRes = await api.get('/api/toko/my-stores');
      const toko = tokoRes.data[0];
      if (!toko) {
        set({ error: 'Anda belum memiliki toko. Silakan buat toko terlebih dahulu di halaman profil.', loading: false });
        return;
      }
      set({ store: toko, storeImage: toko?.profilePictureToko || '' });
      // 2. Ambil produk toko
      let prodUrl = `/api/products/toko/${toko.idToko}?page=${(page||1)-1}&size=${itemsPerPage}`;
      if (searchTerm) {
        prodUrl = `/api/products/search?name=${encodeURIComponent(searchTerm)}`;
      }
      const prodRes = await api.get(prodUrl);
      let prods = prodRes.data.content || prodRes.data || [];
      set({ products: prods, totalPages: prodRes.data.totalPages || 1 });
      // 3. Ambil kategori
      const catRes = await api.get(`/api/categories/toko/${toko.idToko}?page=0&size=100`);
      set({ categories: catRes.data.content || [] });
    } catch (err) {
      set({ error: 'Gagal memuat data seller.', loading: false });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: '' })
}));

export default useSellerStore; 