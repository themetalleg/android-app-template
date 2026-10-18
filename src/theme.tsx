import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import type { ThemePreference } from './data/settings';
import { useServices } from './services';
import { StartupState } from './ui';

const light = {
  background: '#F4F7FB', surface: '#FFFFFF', text: '#172033', muted: '#526078',
  primary: '#2458C4', onPrimary: '#FFFFFF', border: '#CAD3E2', danger: '#B42318',
};
const dark: typeof light = {
  background: '#111827', surface: '#1F2937', text: '#F3F4F6', muted: '#B9C4D5',
  primary: '#A3C3FF', onPrimary: '#122A55', border: '#526078', danger: '#FFB4AB',
};

interface AppTheme {
  colors: typeof light;
  preference: ThemePreference;
  setPreference(value: ThemePreference): Promise<void>;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const { settings } = useServices();
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    settings.getTheme().then((value) => {
      if (active) { setPreference(value); setReady(true); }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
    });
    return () => { active = false; };
  }, [settings, attempt]);

  if (error) return <StartupState message={error.message} retry={() => { setError(null); setAttempt(attempt + 1); }} />;
  if (!ready) return <StartupState />;

  const isDark = preference === 'dark' || (preference === 'system' && system === 'dark');
  const colors = isDark ? dark : light;
  return (
    <ThemeContext.Provider value={{
      colors, preference,
      async setPreference(value) {
        await settings.setTheme(value);
        setPreference(value);
      },
    }}>
      <NavigationThemeProvider value={{
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), background: colors.background, card: colors.surface, text: colors.text, primary: colors.primary, border: colors.border },
      }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('AppThemeProvider is missing.');
  return theme;
}
