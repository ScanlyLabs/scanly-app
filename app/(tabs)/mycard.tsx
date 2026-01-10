import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

// 더미 데이터
const mockCard = {
  name: '홍길동',
  title: 'Product Manager',
  company: 'ABC Company',
  phone: '010-1234-5678',
  email: 'hong@abc.com',
  bio: '10년차 PM으로 B2B SaaS 제품을 만들고 있습니다.',
  portfolio: 'https://portfolio.com/hong',
  location: '서울시 강남구',
  profileImage: null,
  socialLinks: [
    { type: 'LINKEDIN', url: 'linkedin.com/in/hong' },
    { type: 'GITHUB', url: 'github.com/hong' },
  ],
};

export default function MyCardScreen() {
  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'LINKEDIN':
        return 'logo-linkedin';
      case 'GITHUB':
        return 'logo-github';
      case 'INSTAGRAM':
        return 'logo-instagram';
      case 'TWITTER':
        return 'logo-twitter';
      default:
        return 'link-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 명함</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {mockCard.profileImage ? (
              <Image
                source={{ uri: mockCard.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {mockCard.name.charAt(0)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{mockCard.name}</Text>
          <Text style={styles.titleText}>{mockCard.title}</Text>
          <Text style={styles.company}>{mockCard.company}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연락처</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{mockCard.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{mockCard.email}</Text>
          </View>
        </View>

        {mockCard.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개</Text>
            <Text style={styles.bioText}>{mockCard.bio}</Text>
          </View>
        )}

        {mockCard.socialLinks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소셜 링크</Text>
            {mockCard.socialLinks.map((link, index) => (
              <View key={index} style={styles.infoRow}>
                <Ionicons
                  name={getSocialIcon(link.type) as any}
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoText}>{link.url}</Text>
              </View>
            ))}
          </View>
        )}

        {(mockCard.portfolio || mockCard.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추가 정보</Text>

            {mockCard.portfolio && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{mockCard.portfolio}</Text>
              </View>
            )}

            {mockCard.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{mockCard.location}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={Colors.white} />
          <Text style={styles.editButtonText}>명함 수정</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  titleText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  company: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  bioText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
