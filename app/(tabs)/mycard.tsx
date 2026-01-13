import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { cardApi, ReadMeCardResponse } from '../../src/api/card';
import { storage } from '../../src/utils/storage';

interface SocialLink {
  type: string;
  url: string;
}

interface CardInfo {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bio: string | null;
  portfolio: string | null;
  location: string | null;
  profileImage: string | null;
  socialLinks: SocialLink[];
}

export default function MyCardScreen() {
  const [card, setCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCard = useCallback(async () => {
    try {
      setIsLoading(true);
      const memberId = await storage.getMemberId();

      if (!memberId) {
        setCard(null);
        return;
      }

      const cardData = await cardApi.getMe(memberId);
      if (cardData) {
        setCard({
          name: cardData.name,
          title: cardData.title,
          company: cardData.company,
          phone: cardData.phone,
          email: cardData.email,
          bio: cardData.bio,
          portfolio: cardData.portfolioUrl,
          location: cardData.location,
          profileImage: cardData.profileImageUrl,
          socialLinks: cardData.socialLinks,
        });
      } else {
        setCard(null);
      }
    } catch (error) {
      console.error('Failed to fetch my card:', error);
      setCard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyCard();
    }, [fetchMyCard])
  );

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>내 명함</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State: 명함이 없는 경우
  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>내 명함</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="person-outline" size={64} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>등록된 명함이 없어요</Text>
          <Text style={styles.emptyDescription}>
            명함을 만들어 나를 소개해보세요{'\n'}연락처, 소셜 링크 등을 추가할 수 있어요
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/card/register')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.registerButtonText}>명함 만들기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 명함이 있는 경우
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
            {card.profileImage ? (
              <Image
                source={{ uri: card.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {card.name.charAt(0)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.titleText}>{card.title}</Text>
          <Text style={styles.company}>{card.company}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연락처</Text>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{card.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{card.email}</Text>
          </View>
        </View>

        {card.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개</Text>
            <Text style={styles.bioText}>{card.bio}</Text>
          </View>
        )}

        {card.socialLinks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소셜 링크</Text>
            {card.socialLinks.map((link, index) => (
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

        {(card.portfolio || card.location) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추가 정보</Text>

            {card.portfolio && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{card.portfolio}</Text>
              </View>
            )}

            {card.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{card.location}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/card/edit')}
        >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
