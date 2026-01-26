import { api } from './client';

interface RegisterPushTokenRequest {
  token: string;
  platform: 'ios' | 'android';
}

export const pushTokenApi = {
  register: (data: RegisterPushTokenRequest) =>
    api.post<void>('/api/push-tokens/v1', data),
};
