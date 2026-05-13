import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
