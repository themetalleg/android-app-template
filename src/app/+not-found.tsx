import { useRouter } from 'expo-router';
import { Action, Body, Heading, Screen } from '../ui';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Heading>Page not found</Heading>
      <Body>This link does not point to a screen in the app.</Body>
      <Action label="Go home" onPress={() => router.replace('/')} />
    </Screen>
  );
}
