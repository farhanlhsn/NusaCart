import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      user: null,

      login: (userData) => {
        set({
          isLoggedIn: true,
          accessToken: userData.access_token, // Simpan accessToken
          refreshToken: userData.refresh_token, // Simpan refreshToken
          user: userData.user,
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
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
