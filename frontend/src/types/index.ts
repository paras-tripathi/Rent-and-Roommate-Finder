export type Role = 'TENANT' | 'OWNER' | 'ADMIN';
export type ListingStatus = 'ACTIVE' | 'FILLED' | 'DELETED';
export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type RoomType = 'SINGLE' | 'SHARED' | 'STUDIO' | 'APARTMENT' | 'PG';
export type FurnishingStatus = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  tenantProfile?: TenantProfile;
  ownerProfile?: OwnerProfile;
  createdAt: string;
}

export interface TenantProfile {
  id: string;
  userId: string;
  preferredLocation: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  bio?: string;
  preferences?: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  publicId: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  owner: { id: string; name: string; email?: string; ownerProfile?: OwnerProfile };
  title: string;
  location: string;
  rent: number;
  availableFrom: string;
  roomType: RoomType;
  furnishing: FurnishingStatus;
  description: string;
  status: ListingStatus;
  images: ListingImage[];
  _count?: { interests: number };
  compatibilityScore?: number;
  createdAt: string;
}

export interface Compatibility {
  id: string;
  listingId: string;
  tenantProfileId: string;
  score: number;
  explanation: string;
  isAiFallback: boolean;
  createdAt: string;
}

export interface Interest {
  id: string;
  tenantId: string;
  tenant?: { id: string; name: string; email: string; tenantProfile?: TenantProfile };
  listingId: string;
  listing?: Listing;
  status: InterestStatus;
  message?: string;
  chatRoom?: { id: string };
  createdAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  sender: { id: string; name: string; avatar?: string };
  content: string;
  seenAt?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  interestId: string;
  interest?: { listing?: { id: string; title: string }; tenant?: { id: string; name: string } };
  participants: { id: string; name: string; avatar?: string }[];
  messages?: Message[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  listings: number;
  interests: number;
  chatRooms: number;
  messages: number;
  tenants: number;
  owners: number;
  activeListings: number;
  filledListings: number;
  pendingInterests: number;
  acceptedInterests: number;
}
