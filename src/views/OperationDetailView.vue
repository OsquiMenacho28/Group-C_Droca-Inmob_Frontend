<template>
  <!--
    OperationDetailView.vue
    Full page view for a single operation.
    Includes the OperationReceiptsSection at the bottom.

    Route: /operations/:id
    If you already have an operation detail view in your project,
    simply copy the <OperationReceiptsSection> block into it
    and skip this file.
  -->
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Back link -->
      <RouterLink
        to="/operations"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to operations
      </RouterLink>

      <!-- Loading state -->
      <div v-if="loadingOperation" class="space-y-4 animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="operationError"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm"
      >
        {{ operationError }}
      </div>

      <template v-else>
        <!-- Operation header card -->
        <div
          class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4"
        >
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2"
              >
                Operation
              </span>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ operation?.propertyName ?? "Operation #" + operationId }}
              </h1>
              <p class="text-gray-500 text-sm mt-1">ID: {{ operationId }}</p>
            </div>
            <span
              class="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium"
              :class="statusClass"
            >
              {{ operation?.status ?? "—" }}
            </span>
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100"
          >
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">
                Property
              </p>
              <p class="text-sm font-medium text-gray-800 mt-0.5">
                {{ operation?.propertyName ?? "—" }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">
                Client
              </p>
              <p class="text-sm font-medium text-gray-800 mt-0.5">
                {{ operation?.clientName ?? "—" }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Agent</p>
              <p class="text-sm font-medium text-gray-800 mt-0.5">
                {{ operation?.agentName ?? "—" }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Date</p>
              <p class="text-sm font-medium text-gray-800 mt-0.5">
                {{ formatDate(operation?.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Reservation Receipts Section ─────────────────────────────── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <OperationReceiptsSection :operation-id="operationId" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import OperationReceiptsSection from "../components/operations/receipts/OperationReceiptsSection.vue";
import { api } from "../services/api";

// ── Route params ──────────────────────────────────────────────────────────
const route = useRoute();
const operationId = route.params.id as string;

// ── Operation data ────────────────────────────────────────────────────────
const operation = ref<any>(null);
const loadingOperation = ref(false);
const operationError = ref<string | null>(null);

onMounted(async () => {
  loadingOperation.value = true;
  try {
    const { data } = await api.get(`/api/operations/${operationId}`);
    operation.value = data;
  } catch (e: any) {
    operationError.value =
      e?.response?.data?.error ?? "Failed to load operation details.";
  } finally {
    loadingOperation.value = false;
  }
});

// ── Computed ──────────────────────────────────────────────────────────────
const statusClass = computed(() => {
  const status = operation.value?.status ?? "";
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
});

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
