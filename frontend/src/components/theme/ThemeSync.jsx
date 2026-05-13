import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

export function ThemeSync() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const apply = () => {
      const m = useThemeStore.getState().mode;
      const dark =
        m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (useThemeStore.getState().mode !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);

  return null;
}
