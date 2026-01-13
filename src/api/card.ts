import { api } from './client';

export type SocialLinkType =
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'GITHUB'
  | 'TWITTER'
  | 'FACEBOOK'
  | 'OTHER';

interface SocialLinkRequest {
  type: SocialLinkType;
  url: string;
}

export interface RegisterCardRequest {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bio?: string;
  socialLinks?: SocialLinkRequest[];
  profileImageUrl?: string;
  portfolioUrl?: string;
  location?: string;
}

interface SocialLinkResponse {
  type: SocialLinkType;
  url: string;
}

export interface RegisterCardResponse {
  id: string;
  memberId: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bio: string | null;
  socialLinks: SocialLinkResponse[];
  profileImageUrl: string | null;
  portfolioUrl: string | null;
  location: string | null;
  createdAt: string;
}

export interface ReadMeCardResponse {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bio: string | null;
  socialLinks: SocialLinkResponse[];
  profileImageUrl: string | null;
  portfolioUrl: string | null;
  location: string | null;
  qrImageUrl: string | null;
}

export type UpdateCardRequest = RegisterCardRequest;

export const cardApi = {
  register: (memberId: string, data: RegisterCardRequest) =>
    api.post<RegisterCardResponse>('/api/cards/v1', data, {
      'X-Member-Id': memberId,
    }),

  getMe: (memberId: string) =>
    api.get<ReadMeCardResponse>('/api/cards/v1/me', {
      'X-Member-Id': memberId,
    }),

  update: (memberId: string, data: UpdateCardRequest) =>
    api.post<ReadMeCardResponse>('/api/cards/v1/me/update', data, {
      'X-Member-Id': memberId,
    }),
};
