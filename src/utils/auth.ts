import { User, LoginCredentials, SignupData, LoginResponse, RegisterRequest } from '../types';
import api from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const CURRENT_USER_KEY = 'klu-marketplace-current-user';

export const authUtils = {
  isLoggedIn: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        authUtils.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User, token?: string): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also keep legacy key for backward compatibility
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    }));
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('klu-marketplace-cart');
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const data = response.data;

      // Store token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        universityId: data.universityId,
        role: data.role
      };
      authUtils.setCurrentUser(user, data.token);

      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 423) {
        throw new Error('Account locked. Please try again later.');
      } else if (error.response?.status === 404) {
        throw new Error('No account found with this email. Please sign up first.');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  },

  signup: async (signupData: SignupData): Promise<LoginResponse> => {
    if (signupData.password !== signupData.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const registerData: RegisterRequest = {
      email: signupData.email,
      password: signupData.password,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      universityId: signupData.universityId,
      phone: signupData.phone || undefined
    };

    try {
      const response = await api.post<LoginResponse>('/auth/register', registerData);
      const data = response.data;

      // Store token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      const user: User = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        universityId: data.universityId,
        role: data.role
      };
      authUtils.setCurrentUser(user, data.token);

      return data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed';
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          const fieldErrors = errors.map((e: any) => e.message).join(', ');
          throw new Error(fieldErrors || errorMessage);
        }
        throw new Error(errorMessage);
      } else {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  },

  isTokenExpired: (): boolean => {
    const token = authUtils.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

export default authUtils;

