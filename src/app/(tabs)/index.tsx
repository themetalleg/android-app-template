import { useRouter } from 'expo-router';
import { Action, Body, Card, Heading, Screen } from '../../ui';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Heading>Your next app starts here.</Heading>
      <Body>A small, real foundation. Replace the sample feature with your idea, not the plumbing.</Body>
      <Card>
        <Heading>Works offline</Heading>
        <Body>Create and complete tasks stored on this device in SQLite. Import a demo task to try the optional HTTPS client.</Body>
        <Action label="Open sample feature" onPress={() => router.push('/tasks')} />
      </Card>
      <Card>
        <Heading>Built to make your own</Heading>
        <Body>TypeScript, file-based navigation, injected services, light and dark themes, tests, CI, and Android/iOS release profiles.</Body>
        <Body>No accounts, ads, analytics, or background network requests are included.</Body>
      </Card>
    </Screen>
  );
}
