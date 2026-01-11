import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';

export default function SignupScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdValid, setLoginIdValid] = useState<boolean | null>(null);

  const checkLoginId = (value: string) => {
    setLoginId(value);
    // TODO: 실제 중복 체크 API 호출
    if (value.length >= 3) {
      setLoginIdValid(true);
    } else {
      setLoginIdValid(null);
    }
  };

  const handleSignup = () => {
    // TODO: 회원가입 API 호출
    router.replace('/(auth)/create-card');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>Scanly와 함께 시작하세요</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>아이디 (URL에 사용됩니다)</Text>
              <View style={styles.loginIdInputWrapper}>
                <Text style={styles.loginIdPrefix}>scanly.io/u/</Text>
                <TextInput
                  style={styles.loginIdInput}
                  placeholder="loginid"
                  placeholderTextColor={Colors.textTertiary}
                  value={loginId}
                  onChangeText={checkLoginId}
                  autoCapitalize="none"
                />
              </View>
              {loginIdValid === true && (
                <Text style={styles.validText}>
                  ✓ 사용 가능한 아이디입니다
                </Text>
              )}
              {loginIdValid === false && (
                <Text style={styles.invalidText}>
                  ✗ 이미 사용 중인 아이디입니다
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="8자 이상, 영문+숫자 조합"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="알림 수신용 이메일"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>가입하기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>로그인</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  loginIdInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  loginIdPrefix: {
    paddingLeft: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loginIdInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
    paddingRight: 16,
  },
  validText: {
    fontSize: 12,
    color: Colors.success,
  },
  invalidText: {
    fontSize: 12,
    color: Colors.error,
  },
  signupButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  signupButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
