// Enums
export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  BOOKS = 'BOOKS',
  CLOTHING = 'CLOTHING',
  FURNITURE = 'FURNITURE',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER'
}

export enum ItemCondition {
  NEW = 'NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  INACTIVE = 'INACTIVE'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

// User Interfaces
export interface UserStatistics {
  totalItems: number;
  activeItems: number;
  soldItems: number;
  totalValue: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  createdAt?: string;
  statistics?: UserStatistics;
}

export interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  universityId: string;
  role: UserRole;
}

// Item Interfaces
export interface Item {
  id: number;
  title: string;
  description?: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  status: ItemStatus;
  imageUrl?: string;
  location?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
}

// Pagination
export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ItemSearchResponse {
  items: Item[];
  pagination: Pagination;
}

export interface ItemSearchParams {
  keyword?: string;
  category?: ItemCategory;
  condition?: ItemCondition;
  status?: ItemStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

// Authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  role: UserRole;
  token: string;
  expiresAt: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  universityId: string;
  phone?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
  phone?: string;
}

// Legacy interfaces for backward compatibility
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  seller: string;
  sellerEmail: string;
  image: string;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  seller: string;
  sellerEmail: string;
  image: string;
  quantity: number;
}

