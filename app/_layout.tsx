import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="card/[username]"
          options={{
            headerShown: true,
            title: '',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="cardbook/[id]"
          options={{
            headerShown: true,
            title: '',
          }}
        />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}
