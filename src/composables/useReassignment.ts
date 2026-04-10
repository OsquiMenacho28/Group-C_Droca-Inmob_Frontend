// src/composables/useReassignment.ts
// Composable that encapsulates state and logic for visit reassignment.

import { ref, computed } from "vue";
import reassignmentService from "../services/reassignmentService";
import type {
  ReassignmentSolicitation,
  AvailableAgent,
  ReassignmentRequest,
  ReassignmentResponseRequest,
} from "../types/reassignment";

export function useReassignment() {
  // ── State ─────────────────────────────────────────────────────────────────
  const receivedRequests = ref<ReassignmentSolicitation[]>([]);
  const availableAgents = ref<AvailableAgent[]>([]);
  const pendingCount = ref<number>(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const hasPending = computed(() => pendingCount.value > 0);

  // Añadir al estado
  const sentRequests = ref<ReassignmentSolicitation[]>([]);

    // Añadir método
  async function loadSentRequests() {
      loading.value = true;
      error.value = null;
      try {
          sentRequests.value = await reassignmentService.getSentRequests();
      } catch (e: any) {
          error.value = e?.response?.data?.error ?? "Failed to load sent reassignment requests.";
      } finally {
          loading.value = false;
      }
  }
  // Retornar también sentRequests y loadSentRequests
  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Loads all PENDING requests received by the authenticated agent.
   */
  async function loadReceivedRequests() {
    loading.value = true;
    error.value = null;
    try {
      receivedRequests.value = await reassignmentService.getReceivedRequests();
    } catch (e: any) {
      error.value =
        e?.response?.data?.error ?? "Failed to load reassignment requests.";
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
      // Silent: badge simply shows nothing if the call fails
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
    } catch (e: any) {
      error.value = e?.response?.data?.error ?? "Failed to load agents.";
    } finally {
      loading.value = false;
    }
  }

  /**
   * Submits a reassignment request and returns the created solicitation.
   */
  async function requestReassignment(
    visitId: string,
    payload: ReassignmentRequest,
  ): Promise<ReassignmentSolicitation | null> {
    loading.value = true;
    error.value = null;
    try {
      return await reassignmentService.requestReassignment(visitId, payload);
    } catch (e: any) {
      error.value =
        e?.response?.data?.error ??
        "Failed to submit the reassignment request.";
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
    payload: ReassignmentResponseRequest,
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      await reassignmentService.respondToRequest(requestId, payload);
      // Remove the responded request from the local list
      receivedRequests.value = receivedRequests.value.filter(
        (r) => r.id !== requestId,
      );
      pendingCount.value = Math.max(0, pendingCount.value - 1);
      return true;
    } catch (e: any) {
      error.value =
        e?.response?.data?.error ?? "Failed to respond to the request.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    receivedRequests,
    availableAgents,
    pendingCount,
    hasPending,
    loading,
    error,
    // Methods
    loadReceivedRequests,
    loadPendingCount,
    loadAvailableAgents,
    requestReassignment,
    respondToRequest,
  };
}
