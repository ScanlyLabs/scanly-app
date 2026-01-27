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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { cardApi, ReadMeCardResponse } from '../../src/api/card';
import { cardBookApi } from '../../src/api/cardbook';
import { groupApi, GroupListResponse, DefaultGroupResponse, GroupWithCountResponse } from '../../src/api/group';

interface GroupItem {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function CardDetailScreen() {
  const { loginId, fromNotification } = useLocalSearchParams<{ loginId: string; fromNotification?: string }>();
  const isFromNotification = fromNotification === 'true';
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [card, setCard] = useState<ReadMeCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

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

  const fetchGroups = async () => {
    try {
      const response = await groupApi.getAll();
      const customGroups: GroupItem[] = response.customGroups.map(g => ({
        id: g.id,
        name: g.name,
        isDefault: false,
      }));
      setGroups(customGroups);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const handleSavePress = async () => {
    await fetchGroups();
    setSelectedGroupId(null);
    setShowGroupModal(true);
  };

  const handleGroupSelect = (groupId: string | null) => {
    setSelectedGroupId(groupId);
  };

  const handleGroupConfirm = async () => {
    if (!card) return;

    try {
      setSaving(true);
      setShowGroupModal(false);

      await cardBookApi.save({
        cardId: card.id,
        groupId: selectedGroupId || undefined,
      });

      if (isFromNotification) {
        Alert.alert('완료', '명함이 저장되었습니다.');
        router.replace('/(tabs)/cardbook');
      } else {
        setShowExchangeModal(true);
      }
    } catch (err) {
      Alert.alert('오류', '명함 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreateGroup = () => {
    setShowGroupModal(false);
    setNewGroupName('');
    setGroupNameError('');
    setTimeout(() => {
      setShowCreateGroupModal(true);
    }, 300);
  };

  const handleCloseCreateGroup = () => {
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setGroupNameError('');
    setTimeout(() => {
      setShowGroupModal(true);
    }, 300);
  };

  const handleCreateGroup = async () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupNameError('그룹명을 입력해주세요.');
      return;
    }

    if (trimmedName.length > 20) {
      setGroupNameError('그룹명은 20자 이내로 입력해주세요.');
      return;
    }

    try {
      setCreatingGroup(true);
      const newGroup = await groupApi.create({ name: trimmedName });
      setGroups(prev => [...prev, { id: newGroup.id, name: newGroup.name, isDefault: false }]);
      setSelectedGroupId(newGroup.id);
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setGroupNameError('');
      setTimeout(() => {
        setShowGroupModal(true);
      }, 300);
    } catch (err) {
      setGroupNameError('그룹 생성에 실패했습니다.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleExchange = async (sendMyCard: boolean) => {
    setShowExchangeModal(false);

    if (sendMyCard && card) {
      try {
        await cardBookApi.exchange({ cardId: card.id });
        Alert.alert('완료', '명함이 저장되었고, 내 명함도 전송되었습니다.');
      } catch (err) {
        Alert.alert('완료', '명함이 저장되었습니다.\n(내 명함 전송에 실패했습니다)');
      }
    } else {
      Alert.alert('완료', '명함이 저장되었습니다.');
    }

    router.replace('/(tabs)/cardbook');
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
          <TouchableOpacity style={styles.headerBackButton} onPress={() => isFromNotification ? router.back() : router.replace('/(tabs)/scan')}>
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
          <TouchableOpacity style={styles.headerBackButton} onPress={() => isFromNotification ? router.back() : router.replace('/(tabs)/scan')}>
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
        <TouchableOpacity style={styles.headerBackButton} onPress={() => isFromNotification ? router.back() : router.replace('/(tabs)/scan')}>
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePress} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? '저장 중...' : '저장'}</Text>
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

      {/* 그룹 선택 모달 */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.groupModalContent}>
            <View style={styles.groupModalHeader}>
              <Text style={styles.groupModalTitle}>저장할 그룹 선택</Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.groupList}>
              <TouchableOpacity
                style={[
                  styles.groupItem,
                  selectedGroupId === null && styles.groupItemSelected,
                ]}
                onPress={() => handleGroupSelect(null)}
              >
                <Ionicons
                  name="folder-outline"
                  size={20}
                  color={selectedGroupId === null ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.groupItemText,
                    selectedGroupId === null && styles.groupItemTextSelected,
                  ]}
                >
                  전체
                </Text>
                {selectedGroupId === null && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>

              {groups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    selectedGroupId === group.id && styles.groupItemSelected,
                  ]}
                  onPress={() => handleGroupSelect(group.id)}
                >
                  <Ionicons
                    name="folder-outline"
                    size={20}
                    color={selectedGroupId === group.id ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.groupItemText,
                      selectedGroupId === group.id && styles.groupItemTextSelected,
                    ]}
                  >
                    {group.name}
                  </Text>
                  {selectedGroupId === group.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={handleOpenCreateGroup}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text style={styles.createGroupButtonText}>새 그룹 만들기</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.groupModalFooter}>
              <TouchableOpacity
                style={styles.groupConfirmButton}
                onPress={handleGroupConfirm}
              >
                <Text style={styles.groupConfirmButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 새 그룹 만들기 모달 */}
      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCreateGroup}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.createGroupBackdrop} onPress={handleCloseCreateGroup} />
          <View style={styles.createGroupModalContent}>
            <View style={styles.groupModalHeader}>
              <Text style={styles.groupModalTitle}>새 그룹 만들기</Text>
              <TouchableOpacity onPress={handleCloseCreateGroup}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.createGroupBody}>
              <Text style={styles.inputLabel}>그룹명</Text>
              <TextInput
                style={[styles.groupInput, groupNameError && styles.groupInputError]}
                placeholder="그룹명을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={newGroupName}
                onChangeText={(text) => {
                  setNewGroupName(text);
                  if (groupNameError) setGroupNameError('');
                }}
                maxLength={20}
                autoFocus
              />
              {groupNameError ? (
                <Text style={styles.errorText}>{groupNameError}</Text>
              ) : (
                <Text style={styles.charCount}>{newGroupName.length}/20</Text>
              )}
            </View>

            <View style={styles.createGroupFooter}>
              <TouchableOpacity
                style={styles.createGroupCancelButton}
                onPress={handleCloseCreateGroup}
              >
                <Text style={styles.createGroupCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createGroupConfirmButton,
                  (!newGroupName.trim() || creatingGroup) && styles.createGroupConfirmButtonDisabled,
                ]}
                onPress={handleCreateGroup}
                disabled={!newGroupName.trim() || creatingGroup}
              >
                <Text style={styles.createGroupConfirmButtonText}>
                  {creatingGroup ? '생성 중...' : '만들기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  // 그룹 선택 모달 스타일
  groupModalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  groupModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  groupList: {
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4,
  },
  groupItemSelected: {
    backgroundColor: Colors.primary + '15',
  },
  groupItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  groupItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  createGroupButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  groupModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  groupConfirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  groupConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // 새 그룹 만들기 모달 스타일
  createGroupBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  createGroupModalContent: {
    width: '85%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createGroupBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  groupInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  groupInputError: {
    borderColor: Colors.error,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  createGroupFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  createGroupCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  createGroupCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  createGroupConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  createGroupConfirmButtonDisabled: {
    opacity: 0.5,
  },
  createGroupConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
