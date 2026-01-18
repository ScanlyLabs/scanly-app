import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

// 태그 색상 옵션
const TAG_COLORS = [
  '#4F46E5', // primary
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
];

// 더미 그룹 데이터
const mockGroups = [
  { id: '1', name: '거래처' },
  { id: '2', name: '스타트업' },
  { id: '3', name: '2024 컨퍼런스' },
];

// 더미 데이터
const mockSavedCard = {
  id: '1',
  card: {
    name: '김철수',
    title: 'CEO',
    company: 'XYZ Inc',
    phone: '010-9876-5432',
    email: 'kim@xyz.com',
    bio: '스타트업 창업자',
  },
  isFavorite: true,
  memo: '다음 주 미팅 제안',
  tags: [
    { id: '1', name: '파트너', color: '#4F46E5' },
    { id: '2', name: 'VIP', color: '#EF4444' },
  ],
  group: { id: '1', name: '거래처' },
  savedAt: '2024.01.15',
};

type Tag = { id: string; name: string; color: string };

export default function SavedCardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(mockSavedCard.isFavorite);
  const [memo, setMemo] = useState(mockSavedCard.memo);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tags, setTags] = useState<Tag[]>(mockSavedCard.tags);
  const [currentGroup, setCurrentGroup] = useState(mockSavedCard.group);

  // 태그 모달 상태
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  const [tagError, setTagError] = useState('');

  // 그룹 이동 모달 상태
  const [showGroupModal, setShowGroupModal] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: API 호출
  };

  const saveMemo = () => {
    setIsEditingMemo(false);
    // TODO: API 호출
  };

  // 태그 모달 핸들러
  const handleOpenAddTag = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor(TAG_COLORS[0]);
    setTagError('');
    setShowTagModal(true);
  };

  const handleOpenEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setTagError('');
    setShowTagModal(true);
  };

  const handleCloseTagModal = () => {
    setShowTagModal(false);
    setEditingTag(null);
    setTagName('');
    setTagError('');
  };

  const handleSaveTag = () => {
    const trimmedName = tagName.trim();
    if (!trimmedName) {
      setTagError('태그명을 입력해주세요.');
      return;
    }
    if (trimmedName.length > 10) {
      setTagError('태그명은 10자 이내로 입력해주세요.');
      return;
    }

    if (editingTag) {
      // 수정
      setTags(tags.map((t) => (t.id === editingTag.id ? { ...t, name: trimmedName, color: tagColor } : t)));
      // TODO: API 호출
    } else {
      // 추가
      const newTag: Tag = {
        id: Date.now().toString(),
        name: trimmedName,
        color: tagColor,
      };
      setTags([...tags, newTag]);
      // TODO: API 호출
    }
    handleCloseTagModal();
  };

  const handleDeleteTag = (tag: Tag) => {
    Alert.alert('태그 삭제', `"${tag.name}" 태그를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setTags(tags.filter((t) => t.id !== tag.id));
          // TODO: API 호출
        },
      },
    ]);
  };

  // 그룹 이동 핸들러
  const handleMoveToGroup = (group: { id: string; name: string }) => {
    setCurrentGroup(group);
    setShowGroupModal(false);
    // TODO: API 호출
  };

  const handleCall = () => {
    // TODO: 전화 앱 열기
    console.log('Call:', mockSavedCard.card.phone);
  };

  const handleEmail = () => {
    // TODO: 이메일 앱 열기
    console.log('Email:', mockSavedCard.card.email);
  };

  const handleSaveToContacts = () => {
    // TODO: 기기 연락처에 저장
    Alert.alert('완료', '연락처에 저장되었습니다.');
  };

  const handleDelete = () => {
    Alert.alert(
      '명함 삭제',
      '이 명함을 명함첩에서 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // TODO: 삭제 API 호출
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleFavorite}>
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={24}
                  color={isFavorite ? Colors.warning : Colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {mockSavedCard.card.name.charAt(0)}
            </Text>
          </View>

          <Text style={styles.name}>{mockSavedCard.card.name}</Text>
          <Text style={styles.title}>{mockSavedCard.card.title}</Text>
          <Text style={styles.company}>{mockSavedCard.card.company}</Text>
        </View>

        <View style={styles.contactSection}>
          {mockSavedCard.card.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <View style={styles.contactInfo}>
                <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{mockSavedCard.card.phone}</Text>
              </View>
              <View style={styles.contactAction}>
                <Ionicons name="call" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {mockSavedCard.card.email && (
            <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
              <View style={styles.contactInfo}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{mockSavedCard.card.email}</Text>
              </View>
              <View style={styles.contactAction}>
                <Ionicons name="mail" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <View style={styles.tagContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color + '20' }]}
                onPress={() => handleOpenEditTag(tag)}
                onLongPress={() => handleDeleteTag(tag)}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>
                  #{tag.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addTagButton} onPress={handleOpenAddTag}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addTagText}>추가</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tagHint}>태그를 눌러 수정, 길게 눌러 삭제</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>그룹</Text>
          <TouchableOpacity style={styles.groupSelector} onPress={() => setShowGroupModal(true)}>
            <Ionicons name="folder-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.groupName}>{currentGroup.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>메모</Text>
            {!isEditingMemo && (
              <TouchableOpacity onPress={() => setIsEditingMemo(true)}>
                <Text style={styles.editText}>수정</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingMemo ? (
            <View style={styles.memoEdit}>
              <TextInput
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                multiline
                placeholder="메모를 입력하세요"
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity style={styles.memoSaveButton} onPress={saveMemo}>
                <Text style={styles.memoSaveText}>저장</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.memoText}>
              {memo || '메모가 없습니다'}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSaveToContacts}
        >
          <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
          <Text style={styles.syncButtonText}>연락처에 저장</Text>
        </TouchableOpacity>

        <Text style={styles.savedAt}>
          저장일: {mockSavedCard.savedAt}
        </Text>
      </ScrollView>

      {/* 태그 추가/수정 모달 */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseTagModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseTagModal} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTag ? '태그 수정' : '태그 추가'}
              </Text>
              <TouchableOpacity onPress={handleCloseTagModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>태그명</Text>
              <TextInput
                style={[styles.modalInput, tagError && styles.modalInputError]}
                placeholder="태그명을 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={tagName}
                onChangeText={(text) => {
                  setTagName(text);
                  if (tagError) setTagError('');
                }}
                maxLength={10}
                autoFocus
              />
              {tagError ? (
                <Text style={styles.errorText}>{tagError}</Text>
              ) : (
                <Text style={styles.charCount}>{tagName.length}/10</Text>
              )}

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>색상</Text>
              <View style={styles.colorPicker}>
                {TAG_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      tagColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setTagColor(color)}
                  >
                    {tagColor === color && (
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseTagModal}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !tagName.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveTag}
              >
                <Text style={styles.saveButtonText}>
                  {editingTag ? '저장' : '추가'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 그룹 이동 모달 */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGroupModal(false)}>
          <View style={styles.groupModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>그룹 이동</Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.groupList}>
              {mockGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupOption,
                    currentGroup.id === group.id && styles.groupOptionSelected,
                  ]}
                  onPress={() => handleMoveToGroup(group)}
                >
                  <Ionicons
                    name="folder-outline"
                    size={20}
                    color={currentGroup.id === group.id ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.groupOptionText,
                      currentGroup.id === group.id && styles.groupOptionTextSelected,
                    ]}
                  >
                    {group.name}
                  </Text>
                  {currentGroup.id === group.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  title: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  company: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
  },
  contactAction: {
    padding: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  editText: {
    fontSize: 14,
    color: Colors.primary,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: 14,
    color: Colors.primary,
  },
  memoText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  memoEdit: {
    gap: 12,
  },
  memoInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  memoSaveButton: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  memoSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  savedAt: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 24,
  },
  tagHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
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
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  groupModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  groupList: {
    paddingHorizontal: 20,
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  groupOptionSelected: {
    backgroundColor: Colors.surface,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  groupOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  groupOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
