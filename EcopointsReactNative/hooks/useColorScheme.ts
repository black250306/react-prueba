import { useTheme } from '../context/ThemeContext';

// This hook now gets the effective color scheme (light or dark)
// from our global ThemeProvider, which respects user preference.
export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}