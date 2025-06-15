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
      // Fetch both products and stores in parallel
      const [productsResponse, storesResponse] = await Promise.all([
        api.get(`/api/products/search?name=${encodeURIComponent(searchName)}`),
        api.get(`/api/toko/search?name=${encodeURIComponent(searchName)}&size=20`)
      ]);
      
      // Extract products data
      const products = Array.isArray(productsResponse.data) 
        ? productsResponse.data 
        : (productsResponse.data.content || productsResponse.data.products || productsResponse.data || []);
      
      // Extract stores data
      const stores = Array.isArray(storesResponse.data) 
        ? storesResponse.data 
        : (storesResponse.data.content || storesResponse.data.data || storesResponse.data || []);
      
      set({
        results: products,
        stores: stores,
        loading: false
      });
    } catch (err) {
      console.error('Search error:', err);
      set({ 
        error: 'Gagal mencari produk dan toko. Silakan coba lagi.', 
        loading: false,
        results: [],
        stores: []
      });
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