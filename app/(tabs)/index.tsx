import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../src/constants/colors';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

interface CardInfo {
  loginId: string;
  name: string;
  title: string;
  company: string;
}

export default function HomeScreen() {
  const [card, setCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동
    // 명함이 없는 상태로 시작
    setIsLoading(false);
    setCard(null);
  }, []);

  const qrValue = card ? `https://scanly.io/u/${card.loginId}` : '';

  const handleShare = async () => {
    if (!card) return;
    try {
      await Share.share({
        message: `${card.name}의 명함입니다: ${qrValue}`,
        url: qrValue,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = () => {
    // TODO: QR 이미지 저장
    console.log('Save QR');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Scanly</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State: 명함이 없는 경우
  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Scanly</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="card-outline" size={64} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>아직 명함이 없어요</Text>
          <Text style={styles.emptyDescription}>
            나만의 디지털 명함을 만들어{'\n'}QR 코드로 공유해보세요
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/card/register')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.registerButtonText}>명함 만들기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Ionicons name="scan" size={24} color={Colors.white} />
          <Text style={styles.scanButtonText}>스캔하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 명함이 있는 경우
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Scanly</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={QR_SIZE}
              color={Colors.text}
              backgroundColor={Colors.white}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{card.name}</Text>
            <Text style={styles.userTitle}>{card.title}</Text>
            <Text style={styles.userCompany}>{card.company}</Text>
          </View>

          <Text style={styles.qrUrl}>{qrValue}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="download-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>공유</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/(tabs)/scan')}
      >
        <Ionicons name="scan" size={24} color={Colors.white} />
        <Text style={styles.scanButtonText}>스캔하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  userCompany: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  qrUrl: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
