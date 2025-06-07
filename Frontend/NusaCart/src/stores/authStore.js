import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,

      login: (userData) => {
        set({
          isLoggedIn: true,
          user: userData.user,
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
        });
      },
    }),
    {
      name: 'userLoginStatus',
    }
  )
);

export default useAuthStore;
