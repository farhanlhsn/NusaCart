import { create } from 'zustand';
import api from '../services/api';

const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  error: '',
  isModalOpen: false,
  editingAddress: null,

  fetchAddresses: async () => {
    set({ loading: true, error: '' });
    try {
      const response = await api.get('/api/address');
      set({ addresses: response.data || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal memuat daftar alamat.' });
    } finally {
      set({ loading: false });
    }
  },

  setMainAddress: async (addressId) => {
    set({ loading: true, error: '' });
    try {
      await api.put(`/api/address/set_main/${addressId}`);
      await get().fetchAddresses();
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menjadikan alamat utama.' });
    } finally {
      set({ loading: false });
    }
  },

  addAddress: async (payload) => {
    set({ loading: true, error: '' });
    try {
      await api.post('/api/address/new_address', payload);
      await get().fetchAddresses();
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menambah alamat.' });
    } finally {
      set({ loading: false });
    }
  },

  updateAddress: async (addressId, payload) => {
    set({ loading: true, error: '' });
    try {
      await api.put(`/api/address/update_address/${addressId}`, payload);
      await get().fetchAddresses();
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal mengubah alamat.' });
    } finally {
      set({ loading: false });
    }
  },

  deleteAddress: async (addressId) => {
    set({ loading: true, error: '' });
    try {
      await api.delete(`/api/address/${addressId}`);
      await get().fetchAddresses();
    } catch (err) {
      set({ error: err.response?.data?.message || 'Gagal menghapus alamat.' });
    } finally {
      set({ loading: false });
    }
  },

  setEditingAddress: (address) => set({ editingAddress: address }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));

export default useAddressStore; 