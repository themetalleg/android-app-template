import { useEffect as mockUseEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import TasksScreen from '../features/tasks/TasksScreen';
import { ServicesContext, type Services } from '../services';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => mockUseEffect(callback, [callback]),
}));
jest.mock('../theme', () => ({
  useAppTheme: () => ({
    colors: { background: '#fff', surface: '#fff', text: '#111', muted: '#555', primary: '#2458C4', onPrimary: '#fff', border: '#ccc', danger: '#b00' },
  }),
}));

function services(): Services {
  return {
    tasks: {
      list: jest.fn().mockResolvedValue([]), add: jest.fn().mockResolvedValue(undefined),
      setCompleted: jest.fn().mockResolvedValue(undefined), remove: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    settings: { getTheme: jest.fn().mockResolvedValue('system'), setTheme: jest.fn().mockResolvedValue(undefined) },
    api: { getTaskTitle: jest.fn().mockResolvedValue('Imported') },
  };
}

async function mount(value: Services) {
  await render(<ServicesContext.Provider value={value}><TasksScreen /></ServicesContext.Provider>);
  await screen.findByText('No tasks yet. Add your first one above.');
}

it('loads tasks, adds a task, and clears the input', async () => {
  const value = services();
  await mount(value);
  await fireEvent.changeText(screen.getByLabelText('New task'), 'My task');
  await fireEvent.press(screen.getByRole('button', { name: 'Add task' }));
  await waitFor(() => expect(value.tasks.add).toHaveBeenCalledWith('My task'));
  expect(screen.getByLabelText('New task').props.value).toBe('');
});

it('shows storage errors and allows retry', async () => {
  const value = services();
  jest.mocked(value.tasks.list).mockRejectedValueOnce(new Error('Storage failed'));
  await render(<ServicesContext.Provider value={value}><TasksScreen /></ServicesContext.Provider>);
  await screen.findByText('Storage failed');
  await fireEvent.press(screen.getByRole('button', { name: 'Reload tasks' }));
  await screen.findByText('No tasks yet. Add your first one above.');
});

it('imports a demo task and shows network failures', async () => {
  const value = services();
  await mount(value);
  await fireEvent.press(screen.getByRole('button', { name: 'Import demo task' }));
  await waitFor(() => expect(value.tasks.add).toHaveBeenCalledWith('Imported'));
  jest.mocked(value.api.getTaskTitle).mockRejectedValueOnce(new Error('Offline'));
  await fireEvent.press(screen.getByRole('button', { name: 'Import demo task' }));
  await screen.findByText('Offline');
});

it('shows write failures without losing the input', async () => {
  const value = services();
  jest.mocked(value.tasks.add).mockRejectedValueOnce(new Error('Disk full'));
  await mount(value);
  await fireEvent.changeText(screen.getByLabelText('New task'), 'Keep me');
  await fireEvent.press(screen.getByRole('button', { name: 'Add task' }));
  await screen.findByText('Disk full');
  expect(screen.getByLabelText('New task').props.value).toBe('Keep me');
});

it('toggles and deletes a stored task', async () => {
  const value = services();
  jest.mocked(value.tasks.list).mockResolvedValue([{ id: 1, title: 'Stored task', completed: false }]);
  await render(<ServicesContext.Provider value={value}><TasksScreen /></ServicesContext.Provider>);
  await screen.findByText('Stored task');
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Stored task' }));
  await waitFor(() => expect(value.tasks.setCompleted).toHaveBeenCalledWith(1, true));
  await fireEvent.press(screen.getByRole('button', { name: 'Delete task 1' }));
  await waitFor(() => expect(value.tasks.remove).toHaveBeenCalledWith(1));
});
