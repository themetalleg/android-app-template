import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from './theme';

export function StartupState({ message, retry }: { message?: string; retry?: () => void }) {
  return (
    <View style={styles.startup}>
      {message ? <Text accessibilityRole="alert">{message}</Text> : <ActivityIndicator accessibilityLabel="Loading app" />}
      {retry && <Pressable accessibilityRole="button" onPress={retry} style={styles.button}><Text>Try again</Text></Pressable>}
    </View>
  );
}

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.screen}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return <Text style={[styles.body, { color: colors.muted }]}>{children}</Text>;
}

export function Card({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

export function Action({ label, onPress, disabled = false, destructive = false }: {
  label: string; onPress(): void; disabled?: boolean; destructive?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
      onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: destructive ? colors.danger : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}>
      <Text style={[styles.buttonText, { color: destructive ? colors.background : colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function ErrorMessage({ message }: { message: string | null }) {
  const { colors } = useAppTheme();
  return message ? <Text accessibilityRole="alert" style={[styles.body, { color: colors.danger }]}>{message}</Text> : null;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const styles = StyleSheet.create({
  startup: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24, backgroundColor: '#F4F7FB' },
  screen: { flexGrow: 1, padding: 24, gap: 20, width: '100%', maxWidth: 760, alignSelf: 'center' },
  heading: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 25 },
  card: { padding: 20, borderWidth: 1, borderRadius: 18, gap: 14 },
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
