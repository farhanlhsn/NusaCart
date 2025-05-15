import { create } from 'zustand';

const useRegisterStore = create((set) => ({
  isSuccess: false,
  setSuccess: (val) => set({ isSuccess: val }),
  reset: () => set({ isSuccess: false }),
}));

export default useRegisterStore;