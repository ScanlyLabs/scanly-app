import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { pushTokenApi } from '../api/pushToken';
import { tokenStorage } from './tokenStorage';

// 알림 핸들러 설정 (실제 디바이스에서만)
if (Device.isDevice) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// 마지막으로 등록한 토큰 (중복 등록 방지)
let lastRegisteredToken: string | null = null;

/**
 * 실제 디바이스인지 확인
 */
export function isRealDevice(): boolean {
  return Device.isDevice;
}

/**
 * 푸시 알림 권한 요청
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('푸시 알림 권한이 거부되었습니다.');
    return false;
  }

  // Android 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  return true;
}

/**
 * Expo 푸시 토큰 가져오기
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  // projectId 가져오기 (EAS 빌드 또는 환경변수에서)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    process.env.EXPO_PUBLIC_PROJECT_ID;

  if (!projectId) {
    console.log('projectId가 설정되지 않았습니다. EAS 빌드에서만 푸시 토큰을 가져올 수 있습니다.');
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return token;
  } catch (error) {
    console.error('푸시 토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * 푸시 토큰을 서버에 등록
 */
export async function registerPushToken(): Promise<boolean> {
  // 로그인 상태 확인
  const accessToken = await tokenStorage.getAccessToken();
  if (!accessToken) {
    console.log('로그인 상태가 아니므로 푸시 토큰을 등록하지 않습니다.');
    return false;
  }

  // 권한 확인/요청
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return false;
  }

  // 토큰 가져오기
  const token = await getExpoPushToken();
  if (!token) {
    return false;
  }

  // 이미 등록된 토큰이면 스킵
  if (lastRegisteredToken === token) {
    console.log('이미 등록된 푸시 토큰입니다.');
    return true;
  }

  try {
    await pushTokenApi.register({
      token,
      platform: Platform.OS as 'ios' | 'android',
    });
    lastRegisteredToken = token;
    console.log('푸시 토큰 등록 성공:', token);
    return true;
  } catch (error: any) {
    // 중복 키 에러는 이미 등록된 것이므로 성공으로 처리
    if (error?.code === 'DUPLICATE_KEY' || error?.message?.includes('duplicate')) {
      lastRegisteredToken = token;
      console.log('푸시 토큰이 이미 서버에 등록되어 있습니다.');
      return true;
    }
    console.error('푸시 토큰 등록 실패:', error);
    return false;
  }
}

/**
 * 푸시 토큰 변경 리스너 설정
 * 앱 시작 시 한 번 호출 (실제 디바이스에서만 동작)
 */
export function setupPushTokenListener(): () => void {
  // 시뮬레이터에서는 리스너 설정하지 않음
  if (!Device.isDevice) {
    return () => {};
  }

  const subscription = Notifications.addPushTokenListener(async (tokenData) => {
    const newToken = tokenData.data;

    // 실제로 토큰이 변경된 경우에만 재등록
    if (lastRegisteredToken && lastRegisteredToken === newToken) {
      console.log('토큰이 동일하여 재등록 스킵');
      return;
    }

    console.log('푸시 토큰이 변경되었습니다. 재등록 시도...');
    lastRegisteredToken = null; // 캐시 무효화
    await registerPushToken();
  });

  return () => subscription.remove();
}

/**
 * 캐시된 토큰 초기화 (로그아웃 시 호출)
 */
export function clearPushTokenCache(): void {
  lastRegisteredToken = null;
}
