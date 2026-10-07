import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'cyberpunk', name: '🌌 Neon Cyberpunk', primary: '#6366f1' },
  { id: 'synthwave', name: '🌆 Sunset Synthwave', primary: '#f97316' },
  { id: 'emerald', name: '🌿 Emerald Matrix', primary: '#10b981' },
  { id: 'oled', name: '🖤 OLED Midnight', primary: '#3b82f6' },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('mindfresh-theme') || 'cyberpunk');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mindfresh-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
