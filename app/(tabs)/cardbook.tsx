import { useState, useRef, useEffect } from 'react';
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../src/constants/colors';
import { groupApi, GroupListResponse, GroupWithCountResponse, DefaultGroupResponse } from '../../src/api/group';
import { cardBookApi, CardBookResponse, ProfileSnapshot } from '../../src/api/cardbook';

// 기본 그룹 아이콘 매핑
const DEFAULT_GROUP_ICONS: Record<string, string> = {
  all: 'folder-outline',
  favorites: 'star-outline',
  recent: 'time-outline',
};

interface GroupItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
}

// 기본 그룹을 GroupItem으로 변환
const toDefaultGroupItem = (response: DefaultGroupResponse, index: number): GroupItem => ({
  id: response.id,
  name: response.name,
  count: response.cardBookCount,
  icon: DEFAULT_GROUP_ICONS[response.id] || 'folder-outline',
  sortOrder: -100 + index,
  isDefault: true,
});

// 커스텀 그룹을 GroupItem으로 변환
const toCustomGroupItem = (response: GroupWithCountResponse): GroupItem => ({
  id: response.id,
  name: response.name,
  count: response.cardBookCount,
  icon: 'folder-outline',
  sortOrder: response.sortOrder,
  isDefault: false,
});

export default function CardBookScreen() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [defaultGroups, setDefaultGroups] = useState<GroupItem[]>([]);
  const [customGroups, setCustomGroups] = useState<GroupItem[]>([]);
  const [cardBooks, setCardBooks] = useState<CardBookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardBooksLoading, setCardBooksLoading] = useState(false);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const isDefaultGroup = (groupId: string) => defaultGroups.some(g => g.id === groupId);

  // 기본 그룹 + 커스텀 그룹 합치기
  const groups = [...defaultGroups, ...customGroups.sort((a, b) => a.sortOrder - b.sortOrder)];

  // 그룹 목록 조회
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupApi.getAll();
      setDefaultGroups(response.defaultGroups.map(toDefaultGroupItem));
      setCustomGroups(response.customGroups.map(toCustomGroupItem));
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // 명함첩 목록 조회
  const fetchCardBooks = async (groupId?: string) => {
    try {
      setCardBooksLoading(true);
      const params: { groupId?: string } = {};

      // 'all'이 아닌 경우에만 groupId 전달
      if (groupId && groupId !== 'all') {
        params.groupId = groupId;
      }

      const response = await cardBookApi.getAll(params);
      setCardBooks(response.content);
    } catch (error) {
      console.error('Failed to fetch cardbooks:', error);
    } finally {
      setCardBooksLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchCardBooks();
  }, []);

  // 그룹 선택 시 명함첩 다시 조회
  useEffect(() => {
    fetchCardBooks(selectedGroup);
  }, [selectedGroup]);

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
      await groupApi.create({ name: trimmedName });
      await fetchGroups();
      handleCloseCreateGroupModal();
    } catch (error) {
      console.error('Failed to create group:', error);
      setGroupNameError('그룹 생성에 실패했습니다.');
    }
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

  const handleEditGroup = async () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setGroupNameError('그룹명을 입력해주세요.');
      return;
    }

    if (trimmedName.length > 20) {
      setGroupNameError('그룹명은 20자 이내로 입력해주세요.');
      return;
    }

    if (!editingGroup) return;

    try {
      await groupApi.rename(editingGroup.id, { name: trimmedName });
      await fetchGroups();
      handleCloseEditGroupModal();
    } catch (error) {
      console.error('Failed to rename group:', error);
      setGroupNameError('그룹 수정에 실패했습니다.');
    }
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
          onPress: async () => {
            try {
              await groupApi.delete(group.id);
              await fetchGroups();
            } catch (error) {
              console.error('Failed to delete group:', error);
              Alert.alert('오류', '그룹 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleOpenReorderModal = () => {
    closeAllSwipeables();
    setShowReorderModal(true);
  };

  const handleCloseReorderModal = () => {
    setShowReorderModal(false);
  };

  const handleMoveGroup = (index: number, direction: 'up' | 'down') => {
    const sortedCustomGroups = [...customGroups].sort((a, b) => a.sortOrder - b.sortOrder);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sortedCustomGroups.length) return;

    // 스왑
    [sortedCustomGroups[index], sortedCustomGroups[newIndex]] = [sortedCustomGroups[newIndex], sortedCustomGroups[index]];

    // sortOrder 재할당
    const reorderedGroups = sortedCustomGroups.map((group, idx) => ({
      ...group,
      sortOrder: idx,
    }));

    setCustomGroups(reorderedGroups);
  };

  const handleSaveReorder = async () => {
    try {
      const sortedCustomGroups = [...customGroups].sort((a, b) => a.sortOrder - b.sortOrder);
      await groupApi.reorder({
        groups: sortedCustomGroups.map((g, idx) => ({
          id: g.id,
          sortOrder: idx,
        })),
      });
      await fetchGroups();
      handleCloseReorderModal();
    } catch (error) {
      console.error('Failed to reorder groups:', error);
      Alert.alert('오류', '그룹 순서 변경에 실패했습니다.');
    }
  };

  const renderRightActions = (group: GroupItem) => {
    if (group.isDefault) return null;

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

    if (item.isDefault) {
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

  const renderCardItem = ({ item }: { item: CardBookResponse }) => {
    const profile = item.profileSnapshot;
    const name = profile?.name || '이름 없음';
    const title = profile?.title || '';
    const company = profile?.company || '';

    return (
      <TouchableOpacity
        style={styles.cardItem}
        onPress={() => router.push(`/cardbook/${item.id}`)}
      >
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>
            {name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{name}</Text>
            {item.isFavorite && (
              <Ionicons name="star" size={16} color={Colors.warning || '#F59E0B'} />
            )}
          </View>
          {(title || company) && (
            <Text style={styles.cardTitle}>
              {title}{title && company ? ' @ ' : ''}{company}
            </Text>
          )}
          {item.memo && (
            <Text style={styles.cardMemo} numberOfLines={1}>{item.memo}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 명함첩</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleOpenReorderModal} style={styles.headerButton}>
            <Ionicons name="swap-vertical-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
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
          data={groups}
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

      {cardBooksLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : cardBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>명함이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={cardBooks}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardList}
          showsVerticalScrollIndicator={false}
        />
      )}

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

      <Modal
        visible={showReorderModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseReorderModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseReorderModal} />
          <View style={styles.reorderModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>그룹 순서 변경</Text>
              <TouchableOpacity onPress={handleCloseReorderModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reorderHint}>화살표 버튼으로 순서를 변경하세요</Text>

            <ScrollView style={styles.reorderListContainer}>
              {customGroups.length > 0 ? (
                [...customGroups].sort((a, b) => a.sortOrder - b.sortOrder).map((group, index) => (
                  <View key={group.id} style={styles.reorderItem}>
                    <View style={styles.reorderItemContent}>
                      <Ionicons name="folder-outline" size={20} color={Colors.textSecondary} />
                      <Text style={styles.reorderItemText}>{group.name}</Text>
                      <Text style={styles.reorderItemCount}>{group.count}</Text>
                    </View>
                    <View style={styles.reorderButtons}>
                      <TouchableOpacity
                        style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                        onPress={() => handleMoveGroup(index, 'up')}
                        disabled={index === 0}
                      >
                        <Ionicons name="chevron-up" size={20} color={index === 0 ? Colors.textTertiary : Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reorderButton, index === customGroups.length - 1 && styles.reorderButtonDisabled]}
                        onPress={() => handleMoveGroup(index, 'down')}
                        disabled={index === customGroups.length - 1}
                      >
                        <Ionicons name="chevron-down" size={20} color={index === customGroups.length - 1 ? Colors.textTertiary : Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyReorderList}>
                  <Text style={styles.emptyReorderText}>순서를 변경할 그룹이 없습니다.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseReorderModal}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSaveReorder}
              >
                <Text style={styles.createButtonText}>저장</Text>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textTertiary,
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
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  cardMemo: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  reorderModalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reorderHint: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  reorderListContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reorderItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reorderItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  reorderItemCount: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginRight: 8,
  },
  reorderButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  reorderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  reorderButtonDisabled: {
    opacity: 0.5,
  },
  emptyReorderList: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyReorderText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
