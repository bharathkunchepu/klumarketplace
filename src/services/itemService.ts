import api from './api';
import type { ItemsResponse, ItemSearchParams, Item, ItemCategory, ItemCondition } from '../types';

const itemService = {
  /**
   * Get all items with optional filters
   */
  getItems: async (params: ItemSearchParams = {}): Promise<ItemsResponse> => {
    try {
      const response = await api.get<ItemsResponse>('/items', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get a single item by ID
   */
  getItemById: async (id: number): Promise<Item> => {
    try {
      const response = await api.get<Item>(`/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get current user's items
   */
  getMyItems: async (params: ItemSearchParams = {}): Promise<ItemsResponse> => {
    try {
      const response = await api.get<ItemsResponse>('/items/my-items', { params });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Create a new item with optional image upload
   * 
   * Following best practices:
   * - Use FormData with Blob for JSON part (prevents charset=UTF-8 injection)
   * - Do NOT set Content-Type manually (browser will set it with boundary)
   * - Match parameter names exactly: 'data' and 'image' (as backend expects)
   */
  createItem: async (itemData: CreateItemData, imageFile?: File): Promise<Item> => {
    try {
      // Build the data object exactly as backend expects
      const dataToSend: any = {
        title: itemData.title,
        price: itemData.price,
        category: itemData.category,
        condition: itemData.condition,
      };

      // Add optional fields only if they have values
      if (itemData.description) {
        dataToSend.description = itemData.description;
      }
      if (itemData.location) {
        dataToSend.location = itemData.location;
      }
      if (itemData.contactInfo) {
        dataToSend.contactInfo = itemData.contactInfo;
      }

      // Create FormData - browser will handle multipart encoding
      const formData = new FormData();

      // IMPORTANT: Use Blob for JSON part to prevent charset=UTF-8 injection
      // 'data' must match @RequestPart("data") in Spring controller
      formData.append('data', new Blob([JSON.stringify(dataToSend)], { type: 'application/json' }));

      // IMPORTANT: 'image' must match @RequestPart("image") in Spring controller
      // Append image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Use axios - do NOT set Content-Type manually
      // The api interceptor will remove Content-Type for FormData,
      // allowing browser to set it automatically with boundary
      const response = await api.post<Item>('/items', formData);

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Update an existing item
   */
  updateItem: async (id: number, itemData: Partial<CreateItemData>): Promise<Item> => {
    try {
      const response = await api.put<Item>(`/items/${id}`, itemData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Delete an item (soft delete)
   */
  deleteItem: async (id: number): Promise<void> => {
    try {
      await api.delete(`/items/${id}`);
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Upload image for an existing item
   */
  uploadItemImage: async (id: number, imageFile: File): Promise<Item> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post<Item>(`/items/${id}/image`, formData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export interface CreateItemData {
  title: string;
  description?: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  location?: string;
  contactInfo?: string;
}

export default itemService;

