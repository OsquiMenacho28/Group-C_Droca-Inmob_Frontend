<template>
  <span
    v-if="count > 0"
    class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none ml-1.5 animate-pulse"
    :title="`${count} solicitud${count !== 1 ? 'es' : ''} de visita pendiente${count !== 1 ? 's' : ''}`"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { getPendingRequestsForAgent } from '@/services/visitRequestService';

const { user } = useAuth();
const count = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

async function fetchCount() {
  const agentId = (user.value?.sub || user.value?.userId || '') as string;
  if (!agentId) {
    count.value = 0;
    return;
  }

  try {
    const requests = await getPendingRequestsForAgent(agentId);
    count.value = requests.filter(
      (request) => request.status === 'PENDING'
    ).length;
  } catch {}
}

onMounted(() => {
  fetchCount();
  intervalId = setInterval(fetchCount, 30_000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>
