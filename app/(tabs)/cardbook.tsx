import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../src/constants/colors';

// 수정/삭제 불가능한 기본 그룹 ID
const SYSTEM_GROUP_IDS = ['all', 'favorites', 'recent'];

// 더미 데이터
const mockGroups = [
  { id: 'all', name: '전체', count: 47, icon: 'folder-outline' },
  { id: 'favorites', name: '즐겨찾기', count: 12, icon: 'star-outline' },
  { id: 'recent', name: '최근', count: 5, icon: 'time-outline' },
  { id: '1', name: '거래처', count: 15, icon: 'folder-outline' },
  { id: '2', name: '스타트업', count: 8, icon: 'folder-outline' },
  { id: '3', name: '2024 컨퍼런스', count: 7, icon: 'folder-outline' },
];

const mockCards = [
  {
    id: '1',
    name: '김철수',
    title: 'CEO',
    company: 'XYZ Inc',
    tags: ['파트너', 'VIP'],
    profileImage: null,
  },
  {
    id: '2',
    name: '이영희',
    title: 'CTO',
    company: 'ABC Company',
    tags: ['잠재고객'],
    profileImage: null,
  },
  {
    id: '3',
    name: '박민수',
    title: 'Designer',
    company: 'Design Studio',
    tags: ['디자인'],
    profileImage: null,
  },
];

type GroupItem = (typeof mockGroups)[0];

export default function CardBookScreen() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const isSystemGroup = (groupId: string) => SYSTEM_GROUP_IDS.includes(groupId);

  const closeAllSwipeables = () => {
    swipeableRefs.current.forEach((ref) => ref?.close());
  };

  const handleOpenCreateGroupModal = () => {
    closeAllSwipeables();
    setNewGroupName('');
    setGroupNameError('');
    setShowCreateGroupModal(true);
  };

  const handleCloseCreateGroupModal = () => {
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setGroupNameError('');
  };

  const handleCreateGroup = () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupNameError('그룹명을 입력해주세요.');
      return;
    }

    if (trimmedName.length > 20) {
      setGroupNameError('그룹명은 20자 이내로 입력해주세요.');
      return;
    }

    // TODO: API 호출하여 그룹 생성
    console.log('Create group:', trimmedName);

    handleCloseCreateGroupModal();
  };

  const handleOpenEditGroupModal = (group: GroupItem) => {
    closeAllSwipeables();
    setEditingGroup(group);
    setNewGroupName(group.name);
    setGroupNameError('');
    setShowEditGroupModal(true);
  };

  const handleCloseEditGroupModal = () => {
    setShowEditGroupModal(false);
    setEditingGroup(null);
    setNewGroupName('');
    setGroupNameError('');
  };

  const handleEditGroup = () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupNameError('그룹명을 입력해주세요.');
      return;
    }

    if (trimmedName.length > 20) {
      setGroupNameError('그룹명은 20자 이내로 입력해주세요.');
      return;
    }

    // TODO: API 호출하여 그룹 수정
    console.log('Edit group:', editingGroup?.id, trimmedName);

    handleCloseEditGroupModal();
  };

  const handleDeleteGroup = (group: GroupItem) => {
    closeAllSwipeables();
    Alert.alert(
      '그룹 삭제',
      `"${group.name}" 그룹을 삭제하시겠습니까?\n그룹 내 명함은 삭제되지 않습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // TODO: API 호출하여 그룹 삭제
            console.log('Delete group:', group.id);
          },
        },
      ]
    );
  };

  const renderRightActions = (group: GroupItem) => {
    if (isSystemGroup(group.id)) return null;

    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => handleOpenEditGroupModal(group)}
        >
          <Ionicons name="pencil" size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteGroup(group)}
        >
          <Ionicons name="trash" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderGroupItem = ({ item }: { item: GroupItem }) => {
    const groupContent = (
      <TouchableOpacity
        style={[
          styles.groupItem,
          selectedGroup === item.id && styles.groupItemSelected,
        ]}
        onPress={() => setSelectedGroup(item.id)}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={selectedGroup === item.id ? Colors.primary : Colors.textSecondary}
        />
        <Text
          style={[
            styles.groupName,
            selectedGroup === item.id && styles.groupNameSelected,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.groupCount}>{item.count}</Text>
      </TouchableOpacity>
    );

    if (isSystemGroup(item.id)) {
      return groupContent;
    }

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(item.id, ref);
          } else {
            swipeableRefs.current.delete(item.id);
          }
        }}
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
        rightThreshold={40}
      >
        {groupContent}
      </Swipeable>
    );
  };

  const renderCardItem = ({ item }: { item: typeof mockCards[0] }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => router.push(`/cardbook/${item.id}`)}
    >
      <View style={styles.cardAvatar}>
        {item.profileImage ? (
          <Text>IMG</Text>
        ) : (
          <Text style={styles.cardAvatarText}>
            {item.name.charAt(0)}
          </Text>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardTitle}>
          {item.title} @ {item.company}
        </Text>
        {item.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 명함첩</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name="search-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="이름, 회사, 태그 검색"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.groupList}>
        <FlatList
          data={mockGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          horizontal={false}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.addGroupButton} onPress={handleOpenCreateGroupModal}>
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addGroupText}>새 그룹 만들기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={mockCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showCreateGroupModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCreateGroupModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseCreateGroupModal} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새 그룹 만들기</Text>
              <TouchableOpacity onPress={handleCloseCreateGroupModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>그룹명</Text>
              <TextInput
                style={[styles.modalInput, groupNameError && styles.modalInputError]}
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseCreateGroupModal}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !newGroupName.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.createButtonText}>만들기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showEditGroupModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditGroupModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseEditGroupModal} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>그룹 수정</Text>
              <TouchableOpacity onPress={handleCloseEditGroupModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>그룹명</Text>
              <TextInput
                style={[styles.modalInput, groupNameError && styles.modalInputError]}
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseEditGroupModal}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !newGroupName.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleEditGroup}
              >
                <Text style={styles.createButtonText}>저장</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: Colors.text,
  },
  groupList: {
    paddingHorizontal: 20,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  groupItemSelected: {
    backgroundColor: Colors.surface,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  groupNameSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  groupCount: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  addGroupText: {
    fontSize: 16,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  cardList: {
    paddingHorizontal: 20,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
});
