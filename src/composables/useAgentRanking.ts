import { ref } from 'vue';
import { apiClient as api } from '@/api';
import type { AgentRankingData, AgentRankingFilters } from '@/types/ranking';
import { useI18n } from 'vue-i18n';

export function useAgentRanking() {
  const { t } = useI18n();
  const rankingData = ref<AgentRankingData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchRanking(filters: AgentRankingFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/operations/reports/agent-ranking', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          department: filters.department || undefined,
        },
      });
      rankingData.value = response.data.data;
    } catch (err: unknown) {
      console.error('Error fetching ranking:', err);
      error.value = t('reports.rankingLoadError');
    } finally {
      loading.value = false;
    }
  }

  return {
    rankingData,
    loading,
    error,
    fetchRanking,
  };
}
