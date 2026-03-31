import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login, getProfile } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<any>(null);

  const isLoggedIn = computed(() => !!token.value);

  async function loginAction(username: string, password: string) {
    const res = await login(username, password);
    token.value = res.access_token;
    localStorage.setItem('token', res.access_token);
    userInfo.value = res.user;
    return res;
  }

  async function fetchUserInfo() {
    if (!token.value) return null;
    try {
      const res = await getProfile();
      userInfo.value = res;
      return res;
    } catch (e) {
      logout();
      return null;
    }
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    fetchUserInfo,
    logout,
  };
});
