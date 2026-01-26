import { api } from './client';

export type NotificationType = 'CARD_EXCHANGE';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CardExchangeData {
  senderLoginId: string;
}

export const notificationApi = {
  getAll: () => api.get<NotificationResponse[]>('/api/notifications/v1'),

  getUnreadCount: () => api.get<number>('/api/notifications/v1/unread-count'),

  read: (id: string) => api.post<number>(`/api/notifications/v1/${id}/read`),
};

export const parseNotificationData = (
  type: NotificationType,
  data: string | null
): CardExchangeData | null => {
  if (!data) return null;

  try {
    if (type === 'CARD_EXCHANGE') {
      return JSON.parse(data) as CardExchangeData;
    }
  } catch {
    return null;
  }

  return null;
};
