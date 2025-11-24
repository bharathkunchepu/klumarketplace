import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  universityId: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  phone?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  statistics: {
    totalItems: number;
    activeItems: number;
    soldItems: number;
    totalSales: number;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const userService = {
  /**
   * Get current authenticated user's profile
   */
  getCurrentProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get user profile by ID (public)
   */
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfile>(`/users/${userId}/profile`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Update current user's profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await api.put<UserProfile>('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Upload profile image
   */
  uploadProfileImage: async (imageFile: File): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post<UserProfile>('/users/profile/image', formData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default userService;

