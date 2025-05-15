import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      Token: null,
      user: null,

      login: (UserData) => {
        localStorage.setItem('accessToken', UserData.token);
        set({ isLoggedIn: true, Token: UserData.token, user: UserData.user });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        set({ isLoggedIn: false, Token: null, user: null });
      },
    }),
    {
      name: 'userLoginStatus',
    }
  )
);

export default useAuthStore;
