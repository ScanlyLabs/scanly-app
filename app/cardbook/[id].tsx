import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

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
  savedAt: '2024.01.15',
};

export default function SavedCardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(mockSavedCard.isFavorite);
  const [memo, setMemo] = useState(mockSavedCard.memo);
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: API 호출
  };

  const saveMemo = () => {
    setIsEditingMemo(false);
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
            {mockSavedCard.tags.map((tag) => (
              <View
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color + '20' }]}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>
                  #{tag.name}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addTagButton}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addTagText}>추가</Text>
            </TouchableOpacity>
          </View>
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
});
