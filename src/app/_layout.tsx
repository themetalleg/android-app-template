import { Suspense } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDatabase } from '../data/database';
import { ServicesProvider } from '../services';
import { AppThemeProvider } from '../theme';
import { StartupState } from '../ui';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <Suspense fallback={<StartupState />}>
      <SQLiteProvider databaseName="app-starter.db" onInit={migrateDatabase} useSuspense>
        <ServicesProvider>
          <AppThemeProvider>
            <Stack><Stack.Screen name="(tabs)" options={{ headerShown: false }} /></Stack>
          </AppThemeProvider>
        </ServicesProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
