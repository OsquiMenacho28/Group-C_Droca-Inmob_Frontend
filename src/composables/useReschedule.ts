// src/composables/useReschedule.ts
// Composable for the reschedule cancelled visit feature.

import { ref } from 'vue';
import rescheduleService from '@/services/rescheduleService';
import type { RescheduleResponse, Visit } from '@/types/reschedule';
import type { AxiosError } from 'axios';
import i18n from '@/locales/i18n';

const { t } = i18n.global;

interface ApiErrorResponse {
  error?: string;
  message?: string;
  detail?: string;
}

export function useReschedule() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const rescheduledVisits = ref<Visit[]>([]);

  /**
   * Submits a reschedule request for a cancelled visit.
   * Returns the RescheduleResponse on success, null on error.
   */
  async function reschedule(
    visitId: string,
    newDateTime: string,
    notes?: string
  ): Promise<RescheduleResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      const result = await rescheduleService.reschedule(visitId, { newDateTime, notes });
      return result;
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      const status = axiosError?.response?.status;
      if (status === 409) {
        error.value = t('rescheduleVisit.status409');
      } else if (status === 422) {
        error.value = axiosError?.response?.data?.error ?? t('rescheduleVisit.status422');
      } else if (status === 404) {
        error.value = t('rescheduleVisit.status404');
      } else {
        error.value = axiosError?.response?.data?.error ?? t('rescheduleVisit.errorMessage');
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Loads all visits that were rescheduled from the given original visit.
   * Populates rescheduledVisits ref.
   */
  async function loadRescheduledVisits(visitId: string): Promise<void> {
    try {
      rescheduledVisits.value = await rescheduleService.getRescheduledVisits(visitId);
    } catch {
      rescheduledVisits.value = [];
    }
  }

  return {
    loading,
    error,
    rescheduledVisits,
    reschedule,
    loadRescheduledVisits,
  };
}
