import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: 실제 인증 상태 체크 로직 추가
  const isAuthenticated = false;
  const hasCard = false;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasCard) {
    return <Redirect href="/(auth)/create-card" />;
  }

  return <Redirect href="/(tabs)" />;
}
