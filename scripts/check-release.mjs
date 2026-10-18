import { readFileSync } from 'node:fs';

export function validateRelease(app, env) {
  const errors = [];
  for (const [label, value] of [
    ['App name', app.name],
    ['Expo slug', app.slug],
    ['Deep-link scheme', app.scheme],
    ['Android package', app.android?.package],
    ['iOS bundle identifier', app.ios?.bundleIdentifier],
  ]) {
    if (!value || /example|starter|placeholder|changeme/i.test(value)) {
      errors.push(`${label}: replace the template placeholder.`);
    }
  }
  for (const key of ['EXPO_PUBLIC_PRIVACY_URL', 'EXPO_PUBLIC_SUPPORT_URL', 'EXPO_PUBLIC_API_URL']) {
    try {
      const url = new URL(env[key]);
      if (url.protocol !== 'https:' || /(^|\.)example\.(com|org|net)$/.test(url.hostname)) throw new Error('placeholder');
    } catch {
      errors.push(`${key}: set a real HTTPS URL in the production EAS environment.`);
    }
  }
  const projectId = env.EAS_PROJECT_ID || app.extra?.eas?.projectId;
  if (!projectId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    errors.push('EAS project ID: run npx eas init and configure your own project.');
  }
  return errors;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const conditional = process.argv.includes('--if-production');
  if (!conditional || process.env.EAS_BUILD_PROFILE === 'production') {
    const { expo } = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
    const errors = validateRelease(expo, process.env);
    if (errors.length) {
      console.error(`Production configuration is incomplete:\n${errors.map((error) => `- ${error}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      console.log('Production configuration passed. Complete docs/PUBLISHING.md before submission.');
    }
  }
}
