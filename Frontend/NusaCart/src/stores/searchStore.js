import { create } from 'zustand';
import api from '../services/api';

const useSearchStore = create((set) => ({
  results: [],
  stores: [],
  loading: false,
  error: '',
  fetchSearchResults: async (searchName) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.get(`/api/products/search?name=${encodeURIComponent(searchName)}`);
      set({
        results: Array.isArray(res.data) ? res.data : (res.data.content || res.data.products || res.data || []),
        stores: [],
        loading: false
      });
    } catch (err) {
      set({ error: 'Gagal mencari produk. Silakan coba lagi.', loading: false });
    }
  },
  setDummy: (searchName) => {
    // Dummy data untuk development
    if (searchName.toLowerCase() === 'baju') {
      set({
        results: [
          { id: 1, name: 'Baju Batik Pria', price: 120000, image: 'https://images.unsplash.com/photo-1513708927688-890a1c7b6b5a?auto=format&fit=crop&w=400&q=80' },
          { id: 2, name: 'Baju Muslim Wanita', price: 95000, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
        ],
        stores: [
          { id: 1, name: 'Toko Batik Nusantara', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        ],
        loading: false,
        error: ''
      });
    } else {
      set({ results: [], stores: [], loading: false, error: '' });
    }
  },
  clearError: () => set({ error: '' })
}));

export default useSearchStore;