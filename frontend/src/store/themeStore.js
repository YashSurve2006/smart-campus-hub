import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      /** Resolved light | dark for Tailwind `class` strategy */
      getResolved: () => {
        const { mode } = get();
        if (mode === 'dark') return 'dark';
        if (mode === 'light') return 'light';
        return getSystemDark() ? 'dark' : 'light';
      },
    }),
    { name: 'sch_theme_v1' }
  )
);
