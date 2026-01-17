import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { authApi } from '../../src/api/auth';
import { tokenStorage } from '../../src/utils/tokenStorage';
import { storage } from '../../src/utils/storage';

const menuItems = [
  {
    section: '계정',
    items: [
      { icon: 'person-outline', title: '계정 정보', route: '/settings/account' },
      { icon: 'lock-closed-outline', title: '비밀번호 변경', route: '/settings/password' },
    ],
  },
  {
    section: '알림',
    items: [
      { icon: 'notifications-outline', title: '알림 설정', route: '/settings/notifications' },
    ],
  },
  {
    section: '활동',
    items: [
      { icon: 'time-outline', title: '스캔 기록', route: '/settings/scan-history' },
    ],
  },
  {
    section: '기타',
    items: [
      { icon: 'help-circle-outline', title: '도움말', route: '/settings/help' },
      { icon: 'document-text-outline', title: '이용약관', route: '/settings/terms' },
      { icon: 'shield-outline', title: '개인정보처리방침', route: '/settings/privacy' },
    ],
  },
];

export default function SettingsScreen() {
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.logout();
            } catch {
              // 서버 로그아웃 실패해도 로컬 토큰은 삭제
            }
            await tokenStorage.clearTokens();
            await storage.clear();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말 계정을 삭제하시겠습니까?\n삭제 후 30일 이내에 로그인하면 복구할 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // TODO: 계정 삭제 처리
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    // TODO: 각 설정 페이지로 이동
                    console.log('Navigate to:', item.route);
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>버전 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  dangerSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 32,
  },
});
