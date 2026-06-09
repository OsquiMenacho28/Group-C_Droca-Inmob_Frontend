import { ref, watch, type Ref } from 'vue';
import {
  fetchClientInteractions,
  ClientInteractionAccessError,
} from '@/services/clientInteractionService';
import type {
  ClientInteraction,
  ClientInteractionFilterType,
} from '@/types/clientInteraction';

interface UseClientInteractionsOptions {
  clientAuthUserId: Ref<string | undefined>;
  enabled?: Ref<boolean>;
}

export function useClientInteractions(options: UseClientInteractionsOptions) {
  const interactions = ref<ClientInteraction[]>([]);
  const loading = ref(false);
  const error = ref('');
  const accessDenied = ref(false);
  const typeFilter = ref<ClientInteractionFilterType>('ALL');
  const dateFrom = ref('');
  const dateTo = ref('');

  const loadInteractions = async () => {
    const clientId = options.clientAuthUserId.value;

    if (!clientId) {
      interactions.value = [];
      return;
    }

    if (options.enabled?.value === false) {
      return;
    }

    loading.value = true;
    error.value = '';
    accessDenied.value = false;

    try {
      interactions.value = await fetchClientInteractions({
        clientAuthUserId: clientId,
        type: typeFilter.value,
        from: dateFrom.value || undefined,
        to: dateTo.value || undefined,
      });
    } catch (err) {
      interactions.value = [];
      if (err instanceof ClientInteractionAccessError) {
        accessDenied.value = true;
        error.value = err.message;
      } else {
        error.value =
          err instanceof Error ? err.message : 'Error loading interactions';
      }
    } finally {
      loading.value = false;
    }
  };

  const enabledRef = options.enabled ?? ref(true);

  watch(
    [options.clientAuthUserId, typeFilter, dateFrom, dateTo, enabledRef],
    () => {
      loadInteractions();
    },
    { immediate: true }
  );

  return {
    interactions,
    filteredInteractions: interactions,
    loading,
    error,
    accessDenied,
    typeFilter,
    dateFrom,
    dateTo,
    reload: loadInteractions,
  };
}
