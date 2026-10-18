import { normalizeTitle } from './tasks';

export interface DemoApi {
  getTaskTitle(): Promise<string>;
}

export function createDemoApi(baseUrl: string, fetcher: typeof fetch = fetch): DemoApi {
  return {
    async getTaskTitle() {
      const url = new URL(baseUrl);
      if (url.protocol !== 'https:') {
        throw new Error('The demo API requires an HTTPS URL.');
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetcher(`${baseUrl.replace(/\/+$/, '')}/todos/1`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`The demo API returned HTTP ${response.status}.`);
        const data: unknown = await response.json();
        if (typeof data !== 'object' || data === null || !('title' in data) || typeof data.title !== 'string') {
          throw new Error('The demo API returned an invalid task.');
        }
        return normalizeTitle(data.title);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
