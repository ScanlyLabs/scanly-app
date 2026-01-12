import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

interface SocialLinkInput {
  type: string;
  url: string;
}

export default function RegisterCardScreen() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [location, setLocation] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { type: 'LINKEDIN', url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'type' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API 연동
      console.log('Register card:', {
        name,
        title,
        company,
        phone,
        email,
        bio,
        portfolio,
        location,
        socialLinks: socialLinks.filter(link => link.url.trim()),
      });

      Alert.alert('완료', '명함이 등록되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('오류', '명함 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const socialTypes = [
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'GITHUB', label: 'GitHub' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'TWITTER', label: 'Twitter' },
    { value: 'OTHER', label: '기타' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>명함 등록</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          <Text style={[styles.submitText, isLoading && styles.submitTextDisabled]}>
            {isLoading ? '등록 중...' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름 *</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>직책</Text>
              <TextInput
                style={styles.input}
                placeholder="직책을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>회사</Text>
              <TextInput
                style={styles.input}
                placeholder="회사명을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={company}
                onChangeText={setCompany}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>연락처</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                placeholder="010-0000-0000"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개</Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="자기소개를 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>소셜 링크</Text>
              <TouchableOpacity onPress={addSocialLink} style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>추가</Text>
              </TouchableOpacity>
            </View>

            {socialLinks.map((link, index) => (
              <View key={index} style={styles.socialLinkRow}>
                <View style={styles.socialTypeContainer}>
                  <TouchableOpacity
                    style={styles.socialTypeButton}
                    onPress={() => {
                      const currentIndex = socialTypes.findIndex(t => t.value === link.type);
                      const nextIndex = (currentIndex + 1) % socialTypes.length;
                      updateSocialLink(index, 'type', socialTypes[nextIndex].value);
                    }}
                  >
                    <Text style={styles.socialTypeText}>
                      {socialTypes.find(t => t.value === link.type)?.label}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.input, styles.socialUrlInput]}
                  placeholder="URL 입력"
                  placeholderTextColor={Colors.textTertiary}
                  value={link.url}
                  onChangeText={(value) => updateSocialLink(index, 'url', value)}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => removeSocialLink(index)}>
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추가 정보</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>포트폴리오</Text>
              <TextInput
                style={styles.input}
                placeholder="https://portfolio.com"
                placeholderTextColor={Colors.textTertiary}
                value={portfolio}
                onChangeText={setPortfolio}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>위치</Text>
              <TextInput
                style={styles.input}
                placeholder="서울시 강남구"
                placeholderTextColor={Colors.textTertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  submitTextDisabled: {
    color: Colors.textTertiary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  socialLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  socialTypeContainer: {
    width: 100,
  },
  socialTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  socialTypeText: {
    fontSize: 14,
    color: Colors.text,
  },
  socialUrlInput: {
    flex: 1,
    marginBottom: 0,
  },
});
