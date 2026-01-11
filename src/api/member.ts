import { api } from './client';

interface SignUpRequest {
  loginId: string;
  password: string;
  email?: string;
}

interface SignUpResponse {
  loginId: string;
}

interface CheckLoginIdResponse {
  available: boolean;
}

export const memberApi = {
  signUp: (data: SignUpRequest) =>
    api.post<SignUpResponse>('/api/member/v1/sign-up', data),

  checkLoginId: (loginId: string) =>
    api.get<CheckLoginIdResponse>(`/api/member/v1/check-login-id?loginId=${loginId}`),
};
