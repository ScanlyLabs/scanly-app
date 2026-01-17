import { api } from './client';

interface LoginRequest {
  loginId: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/v1/login', data),
};
