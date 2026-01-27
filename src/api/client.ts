import Constants from 'expo-constants';
import { router } from 'expo-router';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8080';

// 인증이 필요 없는 엔드포인트
const PUBLIC_ENDPOINTS = [
  '/api/auth/v1/login',
  '/api/auth/v1/reissue',
  '/api/members/v1/sign-up',
  '/api/members/v1/check-login-id',
];

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

function isPublicEndpoint(endpoint: string): boolean {
  return PUBLIC_ENDPOINTS.some((publicPath) => endpoint.startsWith(publicPath));
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function reissueToken(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/v1/reissue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json: ApiResponse<TokenResponse> = await response.json();

    if (json.success && json.data) {
      await tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = reissueToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 인증이 필요한 엔드포인트에만 Authorization 헤더 추가
  if (!isPublicEndpoint(endpoint)) {
    const accessToken = await tokenStorage.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // 응답 본문이 비어있는 경우 처리
  const text = await response.text();
  if (!text) {
    if (response.ok) {
      return null as T;
    }
    throw new ApiError('EMPTY_RESPONSE', '서버 응답이 비어있습니다.');
  }

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError('PARSE_ERROR', '서버 응답을 파싱할 수 없습니다.');
  }

  // 401 에러이고 재시도가 아닌 경우 토큰 재발급 시도
  if (response.status === 401 && !isRetry && !isPublicEndpoint(endpoint)) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      return request<T>(endpoint, options, true);
    }
    // 토큰 재발급 실패 시 로그인 화면으로 이동
    await tokenStorage.clearTokens();
    router.replace('/(auth)/login');
    throw new ApiError('UNAUTHORIZED', '인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  if (!json.success || json.error) {
    throw new ApiError(
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || '알 수 없는 오류가 발생했습니다.'
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, data?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: <T>(endpoint: string, data?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};

export { ApiError };
