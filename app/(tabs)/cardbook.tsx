import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

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

export default function CardBookScreen() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const renderGroupItem = ({ item }: { item: typeof mockGroups[0] }) => (
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
        <TouchableOpacity style={styles.addGroupButton}>
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
});
