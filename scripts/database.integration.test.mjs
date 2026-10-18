import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrateDatabase } from '../src/data/database.ts';
import { createTaskRepository } from '../src/data/tasks.ts';
import { createSettingsRepository } from '../src/data/settings.ts';

function adapter(sqlite) {
  return {
    async execAsync(sql) { sqlite.exec(sql); },
    async getFirstAsync(sql, ...params) { return sqlite.prepare(sql).get(...params) ?? null; },
    async getAllAsync(sql, ...params) { return sqlite.prepare(sql).all(...params); },
    async runAsync(sql, ...params) { return sqlite.prepare(sql).run(...params); },
    async withTransactionAsync(operation) {
      sqlite.exec('BEGIN');
      try {
        await operation();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

test('real SQLite: migrations, task CRUD, settings and data deletion', async () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    const db = adapter(sqlite);
    await migrateDatabase(db);
    const tasks = createTaskRepository(db);
    const settings = createSettingsRepository(db);
    assert.deepEqual(await tasks.list(), []);
    assert.equal(await settings.getTheme(), 'system');

    await tasks.add("  Robert's app  ");
    await tasks.add("'); DROP TABLE tasks; --");
    const rows = await tasks.list();
    assert.equal(rows.length, 2);
    assert.equal(rows[1].title, "Robert's app");
    assert.equal(rows[1].completed, false);
    await tasks.setCompleted(rows[1].id, true);
    assert.equal((await tasks.list())[1].completed, true);
    await tasks.remove(rows[0].id);
    assert.equal((await tasks.list()).length, 1);

    await settings.setTheme('dark');
    await settings.setTheme('light');
    assert.equal(await settings.getTheme(), 'light');
    await migrateDatabase(db);
    assert.equal((await tasks.list()).length, 1, 'repeat migration must preserve data');
    await tasks.clear();
    assert.deepEqual(await tasks.list(), []);
    assert.equal(await settings.getTheme(), 'light', 'task deletion must preserve settings');
    await assert.rejects(tasks.add(' '), /between 1 and 200/);
  } finally {
    sqlite.close();
  }
});

test('real SQLite: rejects newer schemas without changing them', async () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    sqlite.exec('PRAGMA user_version = 99;');
    await assert.rejects(migrateDatabase(adapter(sqlite)), /newer app/);
    assert.equal(sqlite.prepare('PRAGMA user_version;').get().user_version, 99);
  } finally {
    sqlite.close();
  }
});
