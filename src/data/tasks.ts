import type { SQLiteDatabase } from 'expo-sqlite';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface TaskRepository {
  list(): Promise<Task[]>;
  add(title: string): Promise<void>;
  setCompleted(id: number, completed: boolean): Promise<void>;
  remove(id: number): Promise<void>;
  clear(): Promise<void>;
}

export function normalizeTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized || normalized.length > 200) {
    throw new Error('Enter a task between 1 and 200 characters.');
  }
  return normalized;
}

export function createTaskRepository(db: Pick<SQLiteDatabase, 'getAllAsync' | 'runAsync'>): TaskRepository {
  return {
    async list() {
      const rows = await db.getAllAsync<{ id: number; title: string; completed: number }>(
        'SELECT id, title, completed FROM tasks ORDER BY id DESC;',
      );
      return rows.map((row) => ({ ...row, completed: row.completed === 1 }));
    },
    async add(title) {
      await db.runAsync('INSERT INTO tasks (title) VALUES (?);', normalizeTitle(title));
    },
    async setCompleted(id, completed) {
      await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?;', completed ? 1 : 0, id);
    },
    async remove(id) {
      await db.runAsync('DELETE FROM tasks WHERE id = ?;', id);
    },
    async clear() {
      await db.runAsync('DELETE FROM tasks;');
    },
  };
}
