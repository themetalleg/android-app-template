import type { SQLiteDatabase } from 'expo-sqlite';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface SettingsRepository {
  getTheme(): Promise<ThemePreference>;
  setTheme(theme: ThemePreference): Promise<void>;
}

export function createSettingsRepository(db: Pick<SQLiteDatabase, 'getFirstAsync' | 'runAsync'>): SettingsRepository {
  return {
    async getTheme() {
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?;',
        'theme',
      );
      if (!row) return 'system';
      if (row.value !== 'system' && row.value !== 'light' && row.value !== 'dark') {
        throw new Error('The saved appearance setting is invalid.');
      }
      return row.value;
    },
    async setTheme(theme) {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
        'theme',
        theme,
      );
    },
  };
}
