import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

// 더미 데이터
const mockCard = {
  name: '김철수',
  title: 'CEO',
  company: 'XYZ Inc',
  phone: '010-9876-5432',
  email: 'kim@xyz.com',
  bio: '스타트업 창업자, 10년차 기업가',
  socialLinks: [
    { type: 'LINKEDIN', url: 'linkedin.com/in/kim' },
  ],
};

export default function CardDetailScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [showExchangeModal, setShowExchangeModal] = useState(false);

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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockCard.name.charAt(0)}
            </Text>
          </View>

          <Text style={styles.name}>{mockCard.name}</Text>
          <Text style={styles.title}>{mockCard.title}</Text>
          <Text style={styles.company}>{mockCard.company}</Text>
        </View>

        <View style={styles.contactSection}>
          {mockCard.phone && (
            <TouchableOpacity style={styles.contactRow}>
              <Ionicons name="call-outline" size={24} color={Colors.primary} />
              <Text style={styles.contactText}>{mockCard.phone}</Text>
            </TouchableOpacity>
          )}

          {mockCard.email && (
            <TouchableOpacity style={styles.contactRow}>
              <Ionicons name="mail-outline" size={24} color={Colors.primary} />
              <Text style={styles.contactText}>{mockCard.email}</Text>
            </TouchableOpacity>
          )}

          {mockCard.socialLinks.map((link, index) => (
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

        {mockCard.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{mockCard.bio}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
