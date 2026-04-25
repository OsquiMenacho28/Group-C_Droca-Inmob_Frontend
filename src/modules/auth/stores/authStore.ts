import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/modules/auth/services';
import { parseJwt } from '@/api';

export interface UserClaims {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  roles?: string[];
  userType?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<UserClaims | null>(null);
  const loading = ref(false);
  const error = ref('');

  if (token.value) {
    user.value = parseJwt(token.value) as UserClaims;
  }

  const isAuthenticated = computed(() => !!token.value);

  const userRole = computed(() => user.value?.role || null);

  const mustChangePassword = computed(
    () => localStorage.getItem('must_change_password') === 'true'
  );

  async function login(payload: LoginPayload) {
    loading.value = true;
    error.value = '';
    try {
      const res = await authService.login(payload);
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      token.value = res.accessToken;
      user.value = parseJwt(res.accessToken) as UserClaims;

      if (res.mustChangePassword) {
        localStorage.setItem('must_change_password', 'true');
      } else {
        localStorage.removeItem('must_change_password');
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      error.value = errorObj.response?.data?.message || errorObj.message || 'Error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await authService.logout();
    token.value = null;
    user.value = null;
    localStorage.removeItem('must_change_password');
  }

  async function changePassword(payload: ChangePasswordPayload) {
    loading.value = true;
    error.value = '';
    try {
      await authService.changePassword(payload);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      error.value = errorObj.response?.data?.message || errorObj.message || 'Error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resendTemporaryPassword(email: string) {
    await authService.resendTemporaryPassword(email);
  }

  function clearError() {
    error.value = '';
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    mustChangePassword,
    login,
    logout,
    changePassword,
    resendTemporaryPassword,
    clearError,
  };
});
