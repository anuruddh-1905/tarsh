import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemePreferenceContext } from '@/context/ThemeContext';

export function useColorScheme() {
  const preference = useContext(ThemePreferenceContext);
  const systemScheme = useRNColorScheme();
  return (preference?.colorScheme ?? systemScheme ?? 'light') as 'light' | 'dark';
}
