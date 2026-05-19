import { ref } from 'vue';
import { apiClient as api } from '@/api';
import type { ApiResponse } from '@/api/types';

export interface InventoryTypeMetrics {
  count: number;
  soldCount: number;
  retiredCount: number;
  averageDays: number;
  medianDays: number;
  percentile75Days: number;
}

export interface InventoryMetrics {
  totalPropertiesAnalyzed: number;
  totalSoldProperties: number;
  totalRetiredProperties: number;
  totalActiveProperties: number;
  averageDaysInInventory: number;
  medianDaysInInventory: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
  minDaysInInventory: number;
  maxDaysInInventory: number;
  metricsByPropertyType: Record<string, InventoryTypeMetrics>;
  metricsByOperationType: Record<string, InventoryTypeMetrics>;
  metricsByZone: Record<string, InventoryTypeMetrics>;
  operationTypeFilter: string;
  zoneFilter: string;
  propertyTypeFilter: string;
}

export function useInventoryMetrics() {
  const metrics = ref<InventoryMetrics | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMetrics(operationType?: string) {
    loading.value = true;
    error.value = null;
    try {
      const url = operationType
        ? `/properties/metrics/inventory/operation/${encodeURIComponent(operationType)}`
        : '/properties/metrics/inventory';
      const res = await api.get<ApiResponse<InventoryMetrics>>(url);
      metrics.value = res.data.data ?? null;
    } catch {
      error.value = 'metricsError';
      metrics.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { metrics, loading, error, fetchMetrics };
}
