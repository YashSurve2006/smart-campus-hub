import { create } from 'zustand';

const TOKEN_KEY = 'sch_token';

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  hydrated: false,

  setHydrated: (value) => set({ hydrated: value }),

  setAuth: (user, token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    set({ user, token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
