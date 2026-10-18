import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRelease } from './check-release.mjs';

const app = {
  name: 'My Product', slug: 'my-product', scheme: 'myproduct',
  android: { package: 'dev.myproduct.mobile' },
  ios: { bundleIdentifier: 'dev.myproduct.mobile' },
};
const env = {
  EXPO_PUBLIC_API_URL: 'https://api.myproduct.dev',
  EXPO_PUBLIC_PRIVACY_URL: 'https://myproduct.dev/privacy',
  EXPO_PUBLIC_SUPPORT_URL: 'https://myproduct.dev/support',
  EAS_PROJECT_ID: '12345678-1234-1234-1234-123456789abc',
};

test('accepts personalized production configuration', () => {
  assert.deepEqual(validateRelease(app, env), []);
});
test('rejects placeholders and incomplete environment', () => {
  assert.equal(validateRelease({ name: 'App Starter' }, {}).length, 9);
});
test('rejects insecure and placeholder URLs', () => {
  assert.equal(validateRelease(app, { ...env, EXPO_PUBLIC_API_URL: 'http://api.myproduct.dev', EXPO_PUBLIC_PRIVACY_URL: 'https://example.com/privacy' }).length, 2);
});
test('accepts an EAS project ID written by eas init', () => {
  assert.deepEqual(validateRelease({ ...app, extra: { eas: { projectId: env.EAS_PROJECT_ID } } }, { ...env, EAS_PROJECT_ID: '' }), []);
});
