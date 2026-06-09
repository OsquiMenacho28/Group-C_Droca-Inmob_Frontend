import { apiClient as api } from '@/api';

export interface FavoriteHistoryEntry {
  propertyId: string;
  action: 'ADDED' | 'REMOVED' | string;
  timestamp: string;
}

export const favoriteService = {
  async getFavorites(): Promise<string[]> {
    const res = await api.get('/favoritos');
    return res.data.data;
  },
  async addFavorite(propertyId: string) {
    await api.post('/favoritos', { propertyId });
  },
  async removeFavorite(propertyId: string) {
    await api.delete(`/favoritos/${propertyId}`);
  },
  async getHistory(limit = 20): Promise<FavoriteHistoryEntry[]> {
    const res = await api.get('/favoritos/history', { params: { limit } });
    return res.data.data;
  },
  async getHistoryForClient(
    authUserId: string,
    limit = 100
  ): Promise<FavoriteHistoryEntry[]> {
    const res = await api.get('/favoritos/history', {
      params: { limit },
      headers: { 'X-Auth-User-Id': authUserId },
    });
    return res.data.data;
  },
  async getPropertyHistory(propertyId: string): Promise<FavoriteHistoryEntry[]> {
    const res = await api.get(`/favoritos/history/${propertyId}`);
    return res.data.data;
  },
};
