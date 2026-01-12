import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  MEMBER_ID: 'member_id',
  LOGIN_ID: 'login_id',
} as const;

export const storage = {
  async setMemberId(memberId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MEMBER_ID, memberId);
  },

  async getMemberId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.MEMBER_ID);
  },

  async setLoginId(loginId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LOGIN_ID, loginId);
  },

  async getLoginId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.LOGIN_ID);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MEMBER_ID,
      STORAGE_KEYS.LOGIN_ID,
    ]);
  },
};
