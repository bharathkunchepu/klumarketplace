/**
 * Type definitions for the application
 */

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  status: ItemStatus;
  seller: Seller;
  imageUrl?: string;
  location?: string;
  contactInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ItemCategory = {
  BOOKS: 'BOOKS',
  ELECTRONICS: 'ELECTRONICS',
  CLOTHING: 'CLOTHING',
  FURNITURE: 'FURNITURE',
  SPORTS: 'SPORTS',
  STATIONERY: 'STATIONERY',
  VEHICLES: 'VEHICLES',
  OTHER: 'OTHER',
} as const;

export type ItemCategory = typeof ItemCategory[keyof typeof ItemCategory];

export const ItemCondition = {
  NEW: 'NEW',
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
} as const;

export type ItemCondition = typeof ItemCondition[keyof typeof ItemCondition];

export const ItemStatus = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
} as const;

export type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus];

export interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  email?: string; // Optional since backend may not always include it
  universityId?: string;
  profileImageUrl?: string;
  role?: string; // Added to match backend response
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ItemsResponse {
  items: Item[];
  pagination: Pagination;
}

export interface ItemSearchParams {
  page?: number;
  size?: number;
  category?: ItemCategory;
  condition?: ItemCondition;
  status?: ItemStatus;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string; // API uses 'keyword' instead of 'search'
  userId?: number;
  fromDate?: string; // ISO-8601 format: 2025-11-23T00:00:00Z
  toDate?: string; // ISO-8601 format: 2025-11-23T23:59:59Z
}

