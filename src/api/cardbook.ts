import { api } from './client';

export interface CardBookResponse {
  id: string;
  cardId: string;
  profileSnapshot: string | null;
  groupId: string | null;
  memo: string | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface CardBookPageResponse {
  content: CardBookResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CardExchangeResponse {
  id: string;
  senderId: string;
  receiverId: string;
  exchangedAt: string;
}

interface SaveCardBookRequest {
  cardId: string;
  groupId?: string;
}

interface CardExchangeRequest {
  cardId: string;
}

interface UpdateCardBookGroupRequest {
  groupId: string;
}

interface UpdateCardBookMemoRequest {
  memo: string;
}

interface UpdateCardBookFavoriteRequest {
  favorite: boolean;
}

interface GetCardBooksParams {
  groupId?: string;
  page?: number;
  size?: number;
}

export const cardBookApi = {
  getAll: (params?: GetCardBooksParams) => {
    const searchParams = new URLSearchParams();
    if (params?.groupId) searchParams.append('groupId', params.groupId);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    const query = searchParams.toString();
    return api.get<CardBookPageResponse>(`/api/cardbooks/v1${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    api.get<CardBookResponse>(`/api/cardbooks/v1/${id}`),

  save: (data: SaveCardBookRequest) =>
    api.post<CardBookResponse>('/api/cardbooks/v1', data),

  exchange: (data: CardExchangeRequest) =>
    api.post<CardExchangeResponse>('/api/cardbooks/v1/exchange', data),

  updateGroup: (id: string, data: UpdateCardBookGroupRequest) =>
    api.post<CardBookResponse>(`/api/cardbooks/v1/${id}/group`, data),

  updateMemo: (id: string, data: UpdateCardBookMemoRequest) =>
    api.post<CardBookResponse>(`/api/cardbooks/v1/${id}/memo`, data),

  updateFavorite: (id: string, data: UpdateCardBookFavoriteRequest) =>
    api.post<CardBookResponse>(`/api/cardbooks/v1/${id}/favorite`, data),

  delete: (id: string) =>
    api.post<void>(`/api/cardbooks/v1/${id}/delete`),
};
