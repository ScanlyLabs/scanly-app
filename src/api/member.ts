import { api } from './client';

interface SignUpRequest {
  loginId: string;
  password: string;
  email?: string;
}

interface SignUpResponse {
  id: string;
  loginId: string;
}

interface CheckLoginIdResponse {
  available: boolean;
}

export const memberApi = {
  signUp: (data: SignUpRequest) =>
    api.post<SignUpResponse>('/api/members/v1/sign-up', data),

  checkLoginId: (loginId: string) =>
    api.get<CheckLoginIdResponse>(`/api/members/v1/check-login-id?loginId=${loginId}`),
};
