import api from './api';
import { User } from '../types';

export const userService = {
  getCurrentUserProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  getUserProfileById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}/profile`);
    return response.data;
  },

  updateProfile: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>): Promise<User> => {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  uploadProfileImage: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<User>('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userService;

