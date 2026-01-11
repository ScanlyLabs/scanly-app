import { api } from './client';

interface SignUpRequest {
  loginId: string;
  password: string;
  email?: string;
}

interface SignUpResponse {
  loginId: string;
}

interface LoginRequest {
  loginId: string;
  password: string;
}

interface LoginResponse {
  // 현재 빈 응답
}

interface CheckLoginIdResponse {
  available: boolean;
}

export const memberApi = {
  signUp: (data: SignUpRequest) =>
    api.post<SignUpResponse>('/api/member/v1/sign-up', data),

  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/member/v1/login', data),

  checkLoginId: (loginId: string) =>
    api.get<CheckLoginIdResponse>(`/api/member/v1/check-login-id?loginId=${loginId}`),
};
