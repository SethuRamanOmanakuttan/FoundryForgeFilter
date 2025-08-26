import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Define our theme colors
const themeColors = {
  'luxury': {
    primary: '#3A2618', // Dark brown
    secondary: '#D4AF37', // Gold
    accent: '#8B5A2B', // Medium brown
    text: '#F8F0E3', // Light cream
    background: '#1E1209', // Very dark brown
    surface: '#2C1A0A', // Dark brown surface
    border: '#D4AF37', // Gold border
    hover: '#E5C158', // Lighter gold for hover states
  }
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('luxury');
  
  // Apply theme colors to CSS variables
  useEffect(() => {
    const colors = themeColors[theme];
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [theme]);
  


  return (
    <ThemeContext.Provider value={{ theme, themeColors: themeColors[theme] }}>
      <div className={`theme-${theme}`}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap');
          
          :root {
            --font-primary: 'Poppins', sans-serif;
            --border-radius: 8px;
            --transition-speed: 0.3s;
          }
          body {
            background-color: var(--color-background);
            color: var(--color-text);
            font-family: var(--font-primary);
            margin: 0;
            padding: 0;
            transition: all var(--transition-speed) ease;
          }
          button {
            font-family: var(--font-primary);
          }
        `}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
} 