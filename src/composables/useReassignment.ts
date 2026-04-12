import { ref, computed } from 'vue';
import reassignmentService from '@/services/reassignmentService';
import type {
  ReassignmentSolicitation,
  AvailableAgent,
  ReassignmentRequest,
  ReassignmentResponseRequest,
} from '@/types/reassignment';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  message?: string;
  detail?: string;
}

export function useReassignment() {
  const receivedRequests = ref<ReassignmentSolicitation[]>([]);
  const availableAgents = ref<AvailableAgent[]>([]);
  const pendingCount = ref<number>(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasPending = computed(() => pendingCount.value > 0);

  /**
   * Loads all PENDING requests received by the authenticated agent.
   */
  async function loadReceivedRequests() {
    loading.value = true;
    error.value = null;
    try {
      receivedRequests.value = await reassignmentService.getReceivedRequests();
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      error.value =
        axiosError?.response?.data?.error ??
        'Failed to load reassignment requests.';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Loads the pending counter for the menu badge.
   */
  async function loadPendingCount() {
    try {
      pendingCount.value = await reassignmentService.getPendingCount();
    } catch {
      pendingCount.value = 0;
    }
  }

  /**
   * Loads the list of available agents for the selection modal.
   */
  async function loadAvailableAgents() {
    loading.value = true;
    error.value = null;
    try {
      availableAgents.value = await reassignmentService.getAvailableAgents();
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      error.value =
        axiosError?.response?.data?.error ?? 'Failed to load agents.';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Submits a reassignment request and returns the created solicitation.
   */
  async function requestReassignment(
    visitId: string,
    payload: ReassignmentRequest
  ): Promise<ReassignmentSolicitation | null> {
    loading.value = true;
    error.value = null;
    try {
      return await reassignmentService.requestReassignment(visitId, payload);
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      error.value =
        axiosError?.response?.data?.error ??
        'Failed to submit the reassignment request.';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Responds to a received request (ACCEPTED / REJECTED).
   * Automatically removes the request from the local list on success.
   */
  async function respondToRequest(
    requestId: string,
    payload: ReassignmentResponseRequest
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      await reassignmentService.respondToRequest(requestId, payload);
      receivedRequests.value = receivedRequests.value.filter(
        (r) => r.id !== requestId
      );
      pendingCount.value = Math.max(0, pendingCount.value - 1);
      return true;
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      error.value =
        axiosError?.response?.data?.error ??
        'Failed to respond to the request.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    receivedRequests,
    availableAgents,
    pendingCount,
    hasPending,
    loading,
    error,
    loadReceivedRequests,
    loadPendingCount,
    loadAvailableAgents,
    requestReassignment,
    respondToRequest,
  };
}
