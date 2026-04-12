import { api } from './api';
import type { LoginPayload } from '@/types/user';

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await api.post('/auth/change-password', payload);
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async resendTemporaryPassword(email: string) {
    const response = await api.post('/auth/resend-temp-password', { email });
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
