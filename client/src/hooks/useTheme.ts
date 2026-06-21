import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

let globalTheme: Theme = (localStorage.getItem('cw-theme') as Theme) || 'dark';
const listeners: Array<(theme: Theme) => void> = [];

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', globalTheme);
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(globalTheme);

  useEffect(() => {
    const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
    };
    listeners.push(handleThemeChange);
    
    // Sync local state if globalTheme changed prior to mount
    if (theme !== globalTheme) {
      setTheme(globalTheme);
    }

    return () => {
      const idx = listeners.indexOf(handleThemeChange);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = globalTheme === 'dark' ? 'light' : 'dark';
    globalTheme = nextTheme;
    localStorage.setItem('cw-theme', nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    listeners.forEach(listener => listener(nextTheme));
  };

  return { theme, toggleTheme };
};
