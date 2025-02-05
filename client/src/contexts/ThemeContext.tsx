import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Theme = 'theme-current' | 'theme-snowman' | 'theme-dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themes: Theme[] = ['theme-current', 'theme-snowman', 'theme-dark'];
  const [theme, setTheme] = useState<Theme>(() => {
    // Retrieve theme from localStorage or default to 'theme-current'
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    return savedTheme || 'theme-current';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('app-theme', theme);

    // Apply theme-specific classes to document
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};