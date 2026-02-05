 import React, { createContext, useContext, useEffect, useState } from 'react';
 
 type Theme = 'dark' | 'light';
 
 interface ThemeContextValue {
   theme: Theme;
   toggleTheme: () => void;
   setTheme: (theme: Theme) => void;
 }
 
 const ThemeContext = createContext<ThemeContextValue | null>(null);
 
 const STORAGE_KEY = 'fleet-theme-preference';
 
 export function ThemeProvider({ children }: { children: React.ReactNode }) {
   const [theme, setThemeState] = useState<Theme>(() => {
     // Check localStorage first
     const stored = localStorage.getItem(STORAGE_KEY);
     if (stored === 'light' || stored === 'dark') return stored;
     // Default to dark (cyberpunk theme)
     return 'dark';
   });
 
   useEffect(() => {
     // Apply theme class to document
     const root = document.documentElement;
     if (theme === 'light') {
       root.classList.add('light');
       root.classList.remove('dark');
     } else {
       root.classList.add('dark');
       root.classList.remove('light');
     }
     // Persist preference
     localStorage.setItem(STORAGE_KEY, theme);
   }, [theme]);
 
   const toggleTheme = () => {
     setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
   };
 
   const setTheme = (newTheme: Theme) => {
     setThemeState(newTheme);
   };
 
   return (
     <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
       {children}
     </ThemeContext.Provider>
   );
 }
 
 export function useTheme() {
   const ctx = useContext(ThemeContext);
   if (!ctx) {
     throw new Error('useTheme must be used within ThemeProvider');
   }
   return ctx;
 }