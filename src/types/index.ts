export interface Member {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Card {
  id: string;
  memberId: string;
  name: string;
  title: string;
  company: string;
  phone?: string;
  email?: string;
  bio?: string;
  profileImage?: string;
  portfolio?: string;
  location?: string;
  qrImageUrl: string;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  type: SocialLinkType;
  url: string;
  order: number;
}

export type SocialLinkType =
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'GITHUB'
  | 'TWITTER'
  | 'FACEBOOK'
  | 'OTHER';

export interface SavedCard {
  id: string;
  memberId: string;
  cardId: string;
  card: Card;
  groupId?: string;
  memo?: string;
  isFavorite: boolean;
  tags: Tag[];
  savedAt: string;
}

export interface Group {
  id: string;
  memberId: string;
  name: string;
  order: number;
  count: number;
}

export interface Tag {
  id: string;
  memberId: string;
  name: string;
  color: string;
}
