/**
 * ThemeContext.jsx
 * -----------------------------------------------------------------------------
 * Global Theme Management Context for DocuMend.
 * 
 * Purpose:
 * 1. Global State: Stores the dark mode preference in a single shared state across all 8+ pages.
 * 2. Persistence: Saves the user's choice in browser localStorage so it survives page reloads.
 * 3. DOM Sync: Automatically applies or removes the `.dash-dark` CSS class on <html> and <body>.
 * -----------------------------------------------------------------------------
 */

import { createContext, useContext, useEffect, useState } from 'react';

// Step 1: Create the Theme Context object
const ThemeContext = createContext();

/**
 * ThemeProvider Component
 * Wrap your entire app (or Router) with this provider in App.jsx.
 */
export function ThemeProvider({ children }) {
  // Step 2: Initialize state from localStorage (defaults to true / Dark Forest if not set)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('documend_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Step 3: Whenever `darkMode` state changes, sync to localStorage & DOM root elements
  useEffect(() => {
    // Save to localStorage so state persists across page refreshes
    localStorage.setItem('documend_dark_mode', JSON.stringify(darkMode));

    // Add or remove .dash-dark class to root tags for global CSS styling
    if (darkMode) {
      document.documentElement.classList.add('dash-dark');
      document.body.classList.add('dash-dark');
    } else {
      document.documentElement.classList.remove('dash-dark');
      document.body.classList.remove('dash-dark');
    }
  }, [darkMode]);

  // Step 4: Toggle function to switch between Light Mode and Dark Forest Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    // Step 5: Expose state and functions to all child components
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom Hook: useTheme
 * Call this hook inside any page or component to access or toggle the theme.
 * Example: const { darkMode, toggleDarkMode } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}