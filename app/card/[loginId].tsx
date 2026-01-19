import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { cardApi, ReadMeCardResponse } from '../../src/api/card';

export default function CardDetailScreen() {
  const { loginId } = useLocalSearchParams<{ loginId: string }>();
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [card, setCard] = useState<ReadMeCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!loginId) return;

      try {
        setLoading(true);
        const response = await cardApi.getByLoginId(loginId);
        setCard(response);
      } catch (err) {
        setError('명함을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [loginId]);

  const handleSave = () => {
    // TODO: 명함 저장 API 호출
    setShowExchangeModal(true);
  };

  const handleExchange = (sendMyCard: boolean) => {
    setShowExchangeModal(false);
    if (sendMyCard) {
      // TODO: 상호 교환 API 호출
      Alert.alert('완료', '명함이 저장되었고, 내 명함도 전송되었습니다.');
    } else {
      Alert.alert('완료', '명함이 저장되었습니다.');
    }
    router.back();
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'LINKEDIN':
        return 'logo-linkedin';
      case 'GITHUB':
        return 'logo-github';
      case 'INSTAGRAM':
        return 'logo-instagram';
      default:
        return 'link-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error || '명함을 찾을 수 없습니다.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {card.name.charAt(0)}
            </Text>
          </View>

          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.company}>{card.company}</Text>
        </View>

        <View style={styles.contactSection}>
          {card.phone && (
            <TouchableOpacity style={styles.contactRow}>
              <Ionicons name="call-outline" size={24} color={Colors.primary} />
              <Text style={styles.contactText}>{card.phone}</Text>
            </TouchableOpacity>
          )}

          {card.email && (
            <TouchableOpacity style={styles.contactRow}>
              <Ionicons name="mail-outline" size={24} color={Colors.primary} />
              <Text style={styles.contactText}>{card.email}</Text>
            </TouchableOpacity>
          )}

          {card.socialLinks?.map((link, index) => (
            <TouchableOpacity key={index} style={styles.contactRow}>
              <Ionicons
                name={getSocialIcon(link.type) as any}
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.contactText}>{link.url}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {card.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{card.bio}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showExchangeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExchangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>명함이 저장되었습니다!</Text>
            <Text style={styles.modalMessage}>
              내 명함도 전송하시겠습니까?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => handleExchange(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>아니오</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => handleExchange(true)}
              >
                <Text style={styles.modalButtonPrimaryText}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerBackButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.white,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  title: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  company: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  bioSection: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  bioText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
