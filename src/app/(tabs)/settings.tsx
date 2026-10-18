import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { config, isConfiguredUrl } from '../../config';
import type { ThemePreference } from '../../data/settings';
import { useServices } from '../../services';
import { useAppTheme } from '../../theme';
import { Action, Body, Card, ErrorMessage, Heading, Screen, errorMessage } from '../../ui';

export default function SettingsScreen() {
  const { preference, setPreference } = useAppTheme();
  const { tasks } = useServices();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(operation: () => Promise<void>) {
    setBusy(true); setError(null); setNotice(null);
    try { await operation(); }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }

  return (
    <Screen>
      <Heading>Settings</Heading>
      <Card>
        <Body>Appearance: {preference}</Body>
        {(['system', 'light', 'dark'] satisfies ThemePreference[]).map((value) => (
          <Action key={value} label={`Use ${value} theme`} disabled={busy || preference === value}
            onPress={() => { void run(() => setPreference(value)); }} />
        ))}
      </Card>
      <Card>
        <Heading>Your data</Heading>
        <Body>Tasks and appearance are stored only on this device. The sample has no analytics or tracking. Task storage is not encrypted: do not store secrets here.</Body>
        <Action label="Delete all tasks" destructive disabled={busy} onPress={() => {
          Alert.alert('Delete all tasks?', 'This cannot be undone. Your appearance setting will be kept.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
              void run(async () => { await tasks.clear(); setNotice('All tasks have been deleted.'); });
            } },
          ]);
        }} />
      </Card>
      <Card>
        <Body>Version {Constants.expoConfig?.version ?? 'development'}</Body>
        {[
          { title: 'Privacy policy', url: config.privacyUrl },
          { title: 'Support', url: config.supportUrl },
        ].map(({ title, url }) => (
          <Action key={title} label={isConfiguredUrl(url) ? title : `${title} (not configured)`}
            disabled={busy || !isConfiguredUrl(url)} onPress={() => { void run(() => Linking.openURL(url)); }} />
        ))}
        <Body>Replace the app identity, artwork, support URL, and privacy policy before publishing.</Body>
      </Card>
      <ErrorMessage message={error} />
      {notice && <Body>{notice}</Body>}
    </Screen>
  );
}
