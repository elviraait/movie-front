// src/components/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Читаем тему из localStorage и синхронизируем classList
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        // Явно синхронизируем класс на <html> на случай рассинхрона с inline-скриптом
        document.documentElement.classList.toggle('dark', saved === 'dark');
      }
    } catch {}
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    // Применяем класс к <html>
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
