import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const ThemePreferenceContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [colorScheme, setColorSchemeState] = useState('dark');

  const setColorScheme = useCallback((scheme) => {
    setColorSchemeState(scheme === 'light' ? 'light' : 'dark');
  }, []);

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme, setColorScheme],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemePreferenceContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
