import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { config } from './config';
import { createDemoApi, type DemoApi } from './data/api';
import { createSettingsRepository, type SettingsRepository } from './data/settings';
import { createTaskRepository, type TaskRepository } from './data/tasks';

export interface Services {
  tasks: TaskRepository;
  settings: SettingsRepository;
  api: DemoApi;
}

export const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const services = useMemo<Services>(() => ({
    tasks: createTaskRepository(db),
    settings: createSettingsRepository(db),
    api: createDemoApi(config.apiUrl),
  }), [db]);
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('ServicesProvider is missing.');
  return services;
}
