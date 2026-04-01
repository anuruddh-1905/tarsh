import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemePreferenceContext } from '@/context/ThemeContext';

/**
 * When the app ThemeProvider is present, use that preference immediately.
 * Otherwise keep client hydration behavior for system scheme only.
 */
export function useColorScheme() {
  const preference = useContext(ThemePreferenceContext);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemScheme = useRNColorScheme();
  const resolved = (preference?.colorScheme ?? systemScheme ?? 'light') as 'light' | 'dark';

  if (preference) {
    return resolved;
  }

  if (hasHydrated) {
    return resolved;
  }

  return 'light';
}
