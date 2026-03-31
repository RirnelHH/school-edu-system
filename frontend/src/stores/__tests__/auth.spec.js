import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';

// Mock the API
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  getProfile: vi.fn(),
  logout: vi.fn(),
}));

import { login, getProfile, logout } from '@/api/auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have no token initially', () => {
      const authStore = useAuthStore();
      expect(authStore.token).toBeNull();
    });

    it('should not be logged in initially', () => {
      const authStore = useAuthStore();
      expect(authStore.isLoggedIn).toBe(false);
    });

    it('should have no user info initially', () => {
      const authStore = useAuthStore();
      expect(authStore.userInfo).toBeNull();
    });
  });

  describe('loginAction', () => {
    it('should set token and user info on successful login', async () => {
      const mockResponse = {
        access_token: 'mock-token',
        user: { id: '1', name: 'Test User', username: 'test' },
      };
      login.mockResolvedValue(mockResponse);

      const authStore = useAuthStore();
      await authStore.loginAction('test', 'password');

      expect(authStore.token).toBe('mock-token');
      expect(authStore.userInfo).toEqual(mockResponse.user);
      expect(authStore.isLoggedIn).toBe(true);
      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    it('should throw error on failed login', async () => {
      login.mockRejectedValue(new Error('Invalid credentials'));

      const authStore = useAuthStore();
      await expect(authStore.loginAction('test', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('logout', () => {
    it('should clear token and user info', () => {
      const authStore = useAuthStore();
      authStore.token = 'mock-token';
      authStore.userInfo = { id: '1', name: 'Test' };
      localStorage.setItem('token', 'mock-token');

      authStore.logout();

      expect(authStore.token).toBeNull();
      expect(authStore.userInfo).toBeNull();
      expect(authStore.isLoggedIn).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('fetchUserInfo', () => {
    it('should fetch and set user info', async () => {
      const mockUser = { id: '1', name: 'Test User' };
      getProfile.mockResolvedValue(mockUser);

      const authStore = useAuthStore();
      authStore.token = 'mock-token';

      const result = await authStore.fetchUserInfo();

      expect(result).toEqual(mockUser);
      expect(authStore.userInfo).toEqual(mockUser);
    });

    it('should return null and logout when not authenticated', async () => {
      const authStore = useAuthStore();
      authStore.token = null;

      const result = await authStore.fetchUserInfo();

      expect(result).toBeNull();
    });
  });
});
