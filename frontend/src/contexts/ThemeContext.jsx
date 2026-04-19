import { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('kd-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('kd-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark((p) => !p) }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);