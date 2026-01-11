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

// 더미 데이터
const mockUser = {
  loginId: 'hong',
  name: '홍길동',
  title: 'Product Manager',
  company: 'ABC Company',
};

export default function HomeScreen() {
  const qrValue = `https://scanly.io/u/${mockUser.loginId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${mockUser.name}의 명함입니다: ${qrValue}`,
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
            <Text style={styles.userName}>{mockUser.name}</Text>
            <Text style={styles.userTitle}>{mockUser.title}</Text>
            <Text style={styles.userCompany}>{mockUser.company}</Text>
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
