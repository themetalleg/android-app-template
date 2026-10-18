import { migrateDatabase } from '../data/database';
import { createSettingsRepository } from '../data/settings';
import { createTaskRepository, normalizeTitle } from '../data/tasks';

function database() {
  return {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (operation: () => Promise<void>) => operation()),
  };
}

describe('database migration', () => {
  it('creates schema in a transaction on first launch', async () => {
    const db = database();
    db.getFirstAsync.mockResolvedValue({ user_version: 0 });
    await migrateDatabase(db);
    expect(db.execAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');
    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(db.execAsync).toHaveBeenLastCalledWith(expect.stringContaining('PRAGMA user_version = 1;'));
  });
  it('does not recreate an up-to-date schema', async () => {
    const db = database();
    db.getFirstAsync.mockResolvedValue({ user_version: 1 });
    await migrateDatabase(db);
    expect(db.withTransactionAsync).not.toHaveBeenCalled();
  });
  it('rejects a database from a newer version', async () => {
    const db = database();
    db.getFirstAsync.mockResolvedValue({ user_version: 2 });
    await expect(migrateDatabase(db)).rejects.toThrow('newer app');
  });
  it('surfaces database failures', async () => {
    const db = database();
    db.execAsync.mockRejectedValue(new Error('Storage unavailable'));
    await expect(migrateDatabase(db)).rejects.toThrow('Storage unavailable');
  });
});

describe('task repository', () => {
  it('normalizes and validates titles', () => {
    expect(normalizeTitle('  Build an app  ')).toBe('Build an app');
    expect(normalizeTitle('a'.repeat(200))).toHaveLength(200);
    expect(() => normalizeTitle(' ')).toThrow('between 1 and 200');
    expect(() => normalizeTitle('a'.repeat(201))).toThrow('between 1 and 200');
  });
  it('maps database rows to domain models', async () => {
    const db = database();
    db.getAllAsync.mockResolvedValue([
      { id: 2, title: 'Second', completed: 1 },
      { id: 1, title: 'First', completed: 0 },
    ]);
    expect(await createTaskRepository(db).list()).toEqual([
      { id: 2, title: 'Second', completed: true },
      { id: 1, title: 'First', completed: false },
    ]);
  });
  it('parameterizes writes and supports deletion', async () => {
    const db = database();
    const repo = createTaskRepository(db);
    await repo.add("  Robert's task  ");
    expect(db.runAsync).toHaveBeenLastCalledWith('INSERT INTO tasks (title) VALUES (?);', "Robert's task");
    await repo.setCompleted(3, true);
    expect(db.runAsync).toHaveBeenLastCalledWith('UPDATE tasks SET completed = ? WHERE id = ?;', 1, 3);
    await repo.setCompleted(3, false);
    expect(db.runAsync).toHaveBeenLastCalledWith('UPDATE tasks SET completed = ? WHERE id = ?;', 0, 3);
    await repo.remove(3);
    expect(db.runAsync).toHaveBeenLastCalledWith('DELETE FROM tasks WHERE id = ?;', 3);
    await repo.clear();
    expect(db.runAsync).toHaveBeenLastCalledWith('DELETE FROM tasks;');
    await expect(repo.add('')).rejects.toThrow();
  });
});

describe('settings repository', () => {
  it('defaults to system and reads saved preferences', async () => {
    const db = database();
    const repo = createSettingsRepository(db);
    db.getFirstAsync.mockResolvedValue(null);
    expect(await repo.getTheme()).toBe('system');
    for (const value of ['light', 'dark', 'system']) {
      db.getFirstAsync.mockResolvedValue({ value });
      expect(await repo.getTheme()).toBe(value);
    }
    db.getFirstAsync.mockResolvedValue({ value: 'invalid' });
    await expect(repo.getTheme()).rejects.toThrow('invalid');
  });
  it('persists preferences using an upsert', async () => {
    const db = database();
    await createSettingsRepository(db).setTheme('dark');
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT'), 'theme', 'dark');
  });
});
