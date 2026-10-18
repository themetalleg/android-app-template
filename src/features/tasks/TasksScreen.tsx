import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Task } from '../../data/tasks';
import { useServices } from '../../services';
import { useAppTheme } from '../../theme';
import { Action, Body, Card, ErrorMessage, Heading, Screen, errorMessage } from '../../ui';

export default function TasksScreen() {
  const { tasks: repository, api } = useServices();
  const { colors } = useAppTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setTasks(await repository.list()); }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setLoading(false); }
  }, [repository]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function mutate(operation: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await operation();
      setTasks(await repository.list());
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Heading>Your tasks</Heading>
      <Body>Saved locally. No account or connection required.</Body>
      <Card>
        <TextInput accessibilityLabel="New task" placeholder="What would you like to build?"
          placeholderTextColor={colors.muted} value={title} onChangeText={setTitle}
          editable={!busy} maxLength={200} returnKeyType="done"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} />
        <Action label="Add task" disabled={busy || loading || !title.trim()} onPress={() => {
          void mutate(async () => { await repository.add(title); setTitle(''); });
        }} />
        <Action label="Import demo task" disabled={busy || loading} onPress={() => {
          void mutate(async () => { await repository.add(await api.getTaskTitle()); });
        }} />
        <Body>Import contacts jsonplaceholder.typicode.com by default. No task data is sent.</Body>
      </Card>
      <ErrorMessage message={error} />
      {error && <Action label="Reload tasks" disabled={busy} onPress={() => { void refresh(); }} />}
      {(loading || busy) && <ActivityIndicator accessibilityLabel="Updating tasks" color={colors.primary} />}
      {!loading && !error && tasks.length === 0 && <Body>No tasks yet. Add your first one above.</Body>}
      {tasks.map((task) => (
        <Card key={task.id}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={task.title}
            accessibilityState={{ checked: task.completed, disabled: busy || loading }} disabled={busy || loading}
            onPress={() => { void mutate(() => repository.setCompleted(task.id, !task.completed)); }}
            style={styles.task}>
            <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: task.completed ? colors.primary : 'transparent' }]} />
            <Text style={[styles.title, { color: colors.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>{task.title}</Text>
          </Pressable>
          <Action label={`Delete task ${task.id}`} destructive disabled={busy || loading}
            onPress={() => { void mutate(() => repository.remove(task.id)); }} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, minHeight: 50 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 48 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderRadius: 6 },
  title: { flex: 1, fontSize: 17, lineHeight: 25 },
});
