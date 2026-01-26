import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  registerPushToken,
  setupPushTokenListener,
} from '../src/utils/pushNotifications';

export default function RootLayout() {
  useEffect(() => {
    // 앱 시작 시 푸시 토큰 등록 시도
    registerPushToken().catch(console.error);

    // 토큰 변경 리스너 설정
    const unsubscribe = setupPushTokenListener();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
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
            title: '명함 상세',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
