export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com',
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL ?? '',
};

export function isConfiguredUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !/(^|\.)example\.(com|org|net)$/.test(url.hostname);
  } catch {
    return false;
  }
}
