import { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { cardApi, SocialLinkType, UpdateCardRequest } from '../../src/api/card';
import { ApiError } from '../../src/api/client';
import { storage } from '../../src/utils/storage';

interface SocialLinkInput {
  type: SocialLinkType;
  url: string;
}

interface FormErrors {
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  bio?: string;
  location?: string;
  socialLinks?: string;
}

export default function EditCardScreen() {
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadCardData();
  }, []);

  const loadCardData = async () => {
    try {
      const memberId = await storage.getMemberId();
      if (!memberId) {
        Alert.alert('오류', '로그인이 필요합니다.', [
          { text: '확인', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }

      const cardData = await cardApi.getMe(memberId);
      if (cardData) {
        setName(cardData.name);
        setTitle(cardData.title);
        setCompany(cardData.company);
        setPhone(cardData.phone);
        setEmail(cardData.email);
        setBio(cardData.bio || '');
        setPortfolio(cardData.portfolioUrl || '');
        setLocation(cardData.location || '');
        setSocialLinks(
          cardData.socialLinks.map((link) => ({
            type: link.type,
            url: link.url,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load card data:', error);
      Alert.alert('오류', '명함 정보를 불러오는데 실패했습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return '이름은 필수입니다.';
    }
    if (value.length < 2 || value.length > 30) {
      return '이름은 2-30자여야 합니다.';
    }
    return undefined;
  };

  const validateTitle = (value: string): string | undefined => {
    if (!value.trim()) {
      return '직함은 필수입니다.';
    }
    if (value.length < 2 || value.length > 50) {
      return '직함은 2-50자여야 합니다.';
    }
    return undefined;
  };

  const validateCompany = (value: string): string | undefined => {
    if (!value.trim()) {
      return '회사명은 필수입니다.';
    }
    if (value.length < 2 || value.length > 50) {
      return '회사명은 2-50자여야 합니다.';
    }
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return '전화번호는 필수입니다.';
    }
    const digitsOnly = value.replace(/\D/g, '');
    if (!/^\d{11}$/.test(digitsOnly)) {
      return '전화번호는 숫자 11자리여야 합니다.';
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return '이메일은 필수입니다.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    if (value.length > 50) {
      return '이메일은 50자를 초과할 수 없습니다.';
    }
    return undefined;
  };

  const validateBio = (value: string): string | undefined => {
    if (value.length > 300) {
      return '자기소개는 300자를 초과할 수 없습니다.';
    }
    return undefined;
  };

  const validateLocation = (value: string): string | undefined => {
    if (value.length > 100) {
      return '위치는 100자를 초과할 수 없습니다.';
    }
    return undefined;
  };

  const validateSocialLinks = (): string | undefined => {
    if (socialLinks.length > 10) {
      return '소셜 링크는 최대 10개까지 추가할 수 있습니다.';
    }
    for (const link of socialLinks) {
      if (link.url.trim() && link.url.length > 500) {
        return 'URL은 500자를 초과할 수 없습니다.';
      }
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(name),
      title: validateTitle(title),
      company: validateCompany(company),
      phone: validatePhone(phone),
      email: validateEmail(email),
      bio: validateBio(bio),
      location: validateLocation(location),
      socialLinks: validateSocialLinks(),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addSocialLink = () => {
    if (socialLinks.length >= 10) {
      Alert.alert('알림', '소셜 링크는 최대 10개까지 추가할 수 있습니다.');
      return;
    }
    setSocialLinks([...socialLinks, { type: 'LINKEDIN', url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'type' | 'url', value: string) => {
    const updated = [...socialLinks];
    if (field === 'type') {
      updated[index].type = value as SocialLinkType;
    } else {
      updated[index].url = value;
    }
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const memberId = await storage.getMemberId();
    if (!memberId) {
      Alert.alert('오류', '로그인이 필요합니다.', [
        { text: '확인', onPress: () => router.replace('/(auth)/login') },
      ]);
      return;
    }

    Alert.alert(
      '명함 수정',
      '명함을 수정하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '수정', onPress: () => submitCard(memberId) },
      ]
    );
  };

  const submitCard = async (memberId: string) => {
    setIsLoading(true);
    try {
      const requestData: UpdateCardRequest = {
        name: name.trim(),
        title: title.trim(),
        company: company.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        bio: bio.trim() || undefined,
        portfolioUrl: portfolio.trim() || undefined,
        location: location.trim() || undefined,
        socialLinks: socialLinks
          .filter((link) => link.url.trim())
          .map((link) => ({ type: link.type, url: link.url.trim() })),
      };

      await cardApi.update(memberId, requestData);

      Alert.alert('완료', '명함이 수정되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('오류', error.message);
      } else {
        Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialTypes: { value: SocialLinkType; label: string; icon: string }[] = [
    { value: 'LINKEDIN', label: 'LinkedIn', icon: 'logo-linkedin' },
    { value: 'GITHUB', label: 'GitHub', icon: 'logo-github' },
    { value: 'INSTAGRAM', label: 'Instagram', icon: 'logo-instagram' },
    { value: 'TWITTER', label: 'Twitter', icon: 'logo-twitter' },
    { value: 'FACEBOOK', label: 'Facebook', icon: 'logo-facebook' },
    { value: 'OTHER', label: '기타', icon: 'link-outline' },
  ];

  const [socialTypeModalVisible, setSocialTypeModalVisible] = useState(false);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);

  const openSocialTypeModal = (index: number) => {
    setSelectedLinkIndex(index);
    setSocialTypeModalVisible(true);
  };

  const selectSocialType = (type: SocialLinkType) => {
    if (selectedLinkIndex !== null) {
      updateSocialLink(selectedLinkIndex, 'type', type);
    }
    setSocialTypeModalVisible(false);
    setSelectedLinkIndex(null);
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>명함 수정</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>명함 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>명함 수정</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.submitText}>완료</Text>
          )}
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
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="이름을 입력하세요 (2-30자)"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  clearFieldError('name');
                }}
                maxLength={30}
                editable={!isLoading}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>직책 *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="직책을 입력하세요 (2-50자)"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  clearFieldError('title');
                }}
                maxLength={50}
                editable={!isLoading}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>회사 *</Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                placeholder="회사명을 입력하세요 (2-50자)"
                placeholderTextColor={Colors.textTertiary}
                value={company}
                onChangeText={(value) => {
                  setCompany(value);
                  clearFieldError('company');
                }}
                maxLength={50}
                editable={!isLoading}
              />
              {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>연락처</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호 *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="01012345678 (숫자 11자리)"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  clearFieldError('phone');
                }}
                keyboardType="phone-pad"
                maxLength={13}
                editable={!isLoading}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="example@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearFieldError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={50}
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개</Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
                placeholder="자기소개를 입력하세요 (최대 300자)"
                placeholderTextColor={Colors.textTertiary}
                value={bio}
                onChangeText={(value) => {
                  setBio(value);
                  clearFieldError('bio');
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
                editable={!isLoading}
              />
              <Text style={styles.charCount}>{bio.length}/300</Text>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>소셜 링크</Text>
              <TouchableOpacity
                onPress={addSocialLink}
                style={styles.addButton}
                disabled={isLoading}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>추가</Text>
              </TouchableOpacity>
            </View>
            {errors.socialLinks && (
              <Text style={styles.errorText}>{errors.socialLinks}</Text>
            )}

            {socialLinks.map((link, index) => {
              const currentType = socialTypes.find((t) => t.value === link.type);
              return (
                <View key={index} style={styles.socialLinkRow}>
                  <View style={styles.socialTypeContainer}>
                    <TouchableOpacity
                      style={styles.socialTypeButton}
                      onPress={() => openSocialTypeModal(index)}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={currentType?.icon as any}
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.socialTypeText}>
                        {currentType?.label}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, styles.socialUrlInput]}
                    placeholder="URL 입력 (최대 500자)"
                    placeholderTextColor={Colors.textTertiary}
                    value={link.url}
                    onChangeText={(value) => updateSocialLink(index, 'url', value)}
                    autoCapitalize="none"
                    maxLength={500}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => removeSocialLink(index)}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
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
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>위치</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                placeholder="서울시 강남구 (최대 100자)"
                placeholderTextColor={Colors.textTertiary}
                value={location}
                onChangeText={(value) => {
                  setLocation(value);
                  clearFieldError('location');
                }}
                maxLength={100}
                editable={!isLoading}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={socialTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSocialTypeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSocialTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>소셜 링크 유형 선택</Text>
              <TouchableOpacity onPress={() => setSocialTypeModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalOptions}>
              {socialTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.modalOption}
                  onPress={() => selectSocialType(type.value)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.modalOptionText}>{type.label}</Text>
                  {selectedLinkIndex !== null &&
                    socialLinks[selectedLinkIndex]?.type === type.value && (
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={Colors.primary}
                        style={styles.modalCheckIcon}
                      />
                    )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
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
    width: 130,
  },
  socialTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  socialTypeText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  socialUrlInput: {
    flex: 1,
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOptions: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  modalCheckIcon: {
    marginLeft: 'auto',
  },
});
