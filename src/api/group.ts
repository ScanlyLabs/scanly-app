import { api } from './client';

export interface GroupResponse {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

interface CreateGroupRequest {
  name: string;
}

interface RenameGroupRequest {
  name: string;
}

interface ReorderGroupRequest {
  groups: {
    id: string;
    sortOrder: number;
  }[];
}

export const groupApi = {
  getAll: () => api.get<GroupResponse[]>('/api/groups/v1'),

  create: (data: CreateGroupRequest) =>
    api.post<GroupResponse>('/api/groups/v1', data),

  rename: (id: string, data: RenameGroupRequest) =>
    api.post<GroupResponse>(`/api/groups/v1/${id}/rename`, data),

  reorder: (data: ReorderGroupRequest) =>
    api.post<GroupResponse[]>('/api/groups/v1/reorder', data),

  delete: (id: string) => api.post<void>(`/api/groups/v1/${id}/delete`),
};
