import api from './api';
import { Item, ItemSearchParams, ItemSearchResponse } from '../types';

export const itemService = {
  searchItems: async (params: ItemSearchParams = {}): Promise<ItemSearchResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.status) queryParams.append('status', params.status);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await api.get<ItemSearchResponse>(`/items?${queryParams.toString()}`);
    return response.data;
  },

  getItemById: async (id: number): Promise<Item> => {
    const response = await api.get<Item>(`/items/${id}`);
    return response.data;
  },

  getMyItems: async (params: { status?: string; page?: number; size?: number } = {}): Promise<ItemSearchResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await api.get<ItemSearchResponse>(`/items/my-items?${queryParams.toString()}`);
    return response.data;
  },

  createItem: async (data: {
    title: string;
    description?: string;
    price: number;
    category: string;
    condition: string;
    location?: string;
    contactInfo?: string;
  }): Promise<Item> => {
    const idempotencyKey = `create-item-${Date.now()}-${Math.random()}`;
    const response = await api.post<Item>('/items', data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  updateItem: async (id: number, data: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    condition?: string;
    location?: string;
    contactInfo?: string;
  }): Promise<Item> => {
    const idempotencyKey = `update-item-${id}-${Date.now()}`;
    const response = await api.put<Item>(`/items/${id}`, data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  uploadItemImage: async (id: number, file: File): Promise<Item> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<Item>(`/items/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default itemService;

