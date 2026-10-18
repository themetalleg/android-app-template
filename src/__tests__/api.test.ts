import { createDemoApi } from '../data/api';
import { isConfiguredUrl } from '../config';

describe('demo API', () => {
  it('requests a task over HTTPS and validates the response', async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ title: '  Imported task ' }) });
    expect(await createDemoApi('https://api.test/', fetcher).getTaskTitle()).toBe('Imported task');
    expect(fetcher).toHaveBeenCalledWith('https://api.test/todos/1', expect.objectContaining({
      headers: { Accept: 'application/json' },
      signal: expect.any(AbortSignal),
    }));
  });
  it('rejects insecure URLs before making a request', async () => {
    const fetcher = jest.fn();
    await expect(createDemoApi('http://api.test', fetcher).getTaskTitle()).rejects.toThrow('HTTPS');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('surfaces HTTP errors and network failures', async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(createDemoApi('https://api.test', fetcher).getTaskTitle()).rejects.toThrow('503');
    fetcher.mockRejectedValue(new Error('Offline'));
    await expect(createDemoApi('https://api.test', fetcher).getTaskTitle()).rejects.toThrow('Offline');
  });
  it.each([null, {}, { title: 5 }, { title: '' }, { title: 'a'.repeat(201) }])('rejects malformed response %p', async (data) => {
    const fetcher = jest.fn().mockResolvedValue({ ok: true, json: async () => data });
    await expect(createDemoApi('https://api.test', fetcher).getTaskTitle()).rejects.toThrow();
  });
  it('aborts slow requests after ten seconds', async () => {
    jest.useFakeTimers();
    try {
      const fetcher = jest.fn((_url: RequestInfo | URL, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      }));
      const promise = createDemoApi('https://api.test', fetcher).getTaskTitle();
      const assertion = expect(promise).rejects.toThrow('Aborted');
      await jest.advanceTimersByTimeAsync(10_000);
      await assertion;
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('external URL configuration', () => {
  it.each(['', 'not a url', 'http://site.dev', 'https://example.com/privacy', 'https://sub.example.org'])('rejects %s', (url) => {
    expect(isConfiguredUrl(url)).toBe(false);
  });
  it('accepts real HTTPS URLs', () => {
    expect(isConfiguredUrl('https://myproduct.dev/privacy')).toBe(true);
  });
});
