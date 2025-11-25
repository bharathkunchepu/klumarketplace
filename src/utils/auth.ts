import api from '../services/api';
import { toastUtils } from './toast';

const AUTH_TOKEN_KEY = 'authToken';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

export const authUtils = {
  // Check if user is logged in
  isLoggedIn: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Store token
  setToken: (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  // Remove token (logout)
  removeToken: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // CRITICAL: Handle backend that returns 200 OK with success: false flag
      // Some backends return 200 with { success: false, message: "Invalid credentials" }
      // Axios won't throw for 200 status, so we need to check manually
      if ((response.data as any).success === false || (response.data as any).error) {
        const errorMessage = (response.data as any).message || 'Invalid credentials';
        const error: any = new Error(errorMessage);
        error.response = {
          status: 401,
          data: response.data
        };
        throw error;
      }
      
      // CRITICAL: Verify token exists before considering login successful
      if (!response.data.token) {
        const error: any = new Error('No authentication token received from server');
        error.response = {
          status: 401,
          data: { message: 'No authentication token received' }
        };
        throw error;
      }
      
      // Only set token if we have one
      authUtils.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      // Re-throw to propagate to Login.tsx catch block
      throw error;
    }
  },

  // Signup
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (response.data.token) {
        authUtils.setToken(response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Logout
  logout: (): void => {
    authUtils.removeToken();
    toastUtils.showLogoutSuccess();
    window.location.href = '/login';
  },
};

export default authUtils;

