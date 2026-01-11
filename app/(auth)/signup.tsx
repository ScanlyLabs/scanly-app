import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { memberApi } from '../../src/api/member';
import { ApiError } from '../../src/api/client';

export default function SignupScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdValid, setLoginIdValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    loginId?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateLoginId = (value: string): string | undefined => {
    if (value.length < 3 || value.length > 20) {
      return '아이디는 3-20자여야 합니다.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return '영문, 숫자, 언더스코어만 사용 가능합니다.';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (value.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
      return '영문과 숫자를 포함해야 합니다.';
    }
    return undefined;
  };

  const checkLoginId = (value: string) => {
    setLoginId(value);
    const error = validateLoginId(value);
    if (error) {
      setLoginIdValid(null);
      setErrors((prev) => ({ ...prev, loginId: error }));
    } else {
      setLoginIdValid(true);
      setErrors((prev) => ({ ...prev, loginId: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setErrors((prev) => ({ ...prev, password: error }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSignup = async () => {
    // Validation
    const loginIdError = validateLoginId(loginId);
    const passwordError = validatePassword(password);
    const confirmPasswordError = password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : undefined;

    if (loginIdError || passwordError || confirmPasswordError) {
      setErrors({
        loginId: loginIdError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setIsLoading(true);
    try {
      await memberApi.signUp({
        loginId,
        password,
        email: email || undefined,
      });

      Alert.alert('회원가입 완료', '회원가입이 완료되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(auth)/create-card') },
      ]);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'M003') {
          setLoginIdValid(false);
          setErrors((prev) => ({ ...prev, loginId: '이미 사용 중인 아이디입니다.' }));
        } else {
          Alert.alert('회원가입 실패', error.message);
        }
      } else {
        Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
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
              <View style={[
                styles.loginIdInputWrapper,
                errors.loginId && styles.inputError
              ]}>
                <Text style={styles.loginIdPrefix}>scanly.io/u/</Text>
                <TextInput
                  style={styles.loginIdInput}
                  placeholder="loginid"
                  placeholderTextColor={Colors.textTertiary}
                  value={loginId}
                  onChangeText={checkLoginId}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {loginIdValid === true && !errors.loginId && (
                <Text style={styles.validText}>
                  ✓ 사용 가능한 아이디입니다
                </Text>
              )}
              {errors.loginId && (
                <Text style={styles.invalidText}>
                  ✗ {errors.loginId}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="8자 이상, 영문+숫자 조합"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.password && (
                <Text style={styles.invalidText}>✗ {errors.password}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={styles.invalidText}>✗ {errors.confirmPassword}</Text>
              )}
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
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>가입하기</Text>
              )}
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
  inputError: {
    borderColor: Colors.error,
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
  signupButtonDisabled: {
    opacity: 0.7,
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
