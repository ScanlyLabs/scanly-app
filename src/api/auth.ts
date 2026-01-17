import { api } from './client';

interface LoginRequest {
  loginId: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

interface ReissueRequest {
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/api/auth/v1/login', data),

  logout: () => api.post<void>('/api/auth/v1/logout'),

  reissue: (data: ReissueRequest) =>
    api.post<TokenResponse>('/api/auth/v1/reissue', data),
};
