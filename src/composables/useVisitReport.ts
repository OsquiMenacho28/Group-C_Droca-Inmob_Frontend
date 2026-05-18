import { ref } from 'vue';
import { apiClient as api } from '@/api';
import { useI18n } from 'vue-i18n';

export interface PropertyVisitReport {
  rank: number;
  propertyId: string;
  propertyAddress: string;
  propertyName: string;
  visitCount: number;
  agentId: string;
  agentName: string;
}

export interface VisitReportData {
  month: number;
  year: number;
  totalProperties: number;
  rankings: PropertyVisitReport[];
}

export function useVisitReport() {
  const { t } = useI18n();
  const reportData = ref<VisitReportData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchReport(month: number, year: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/reports/visits-by-property', {
        params: { month, year },
      });
      reportData.value = response.data.data;
    } catch (err: unknown) {
      console.error('Error fetching visit report:', err);
      error.value = t('reports.visitReportLoadError');
    } finally {
      loading.value = false;
    }
  }

  return {
    reportData,
    loading,
    error,
    fetchReport,
  };
}
