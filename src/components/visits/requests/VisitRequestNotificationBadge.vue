<template>
  <FwbBadge
    v-if="count > 0"
    type="yellow"
    size="sm"
    class="ml-1.5 animate-pulse"
  >
    {{ count > 99 ? '99+' : count }}
  </FwbBadge>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { FwbBadge } from 'flowbite-vue';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import { getPendingRequestsForAgent } from '@/services/visitRequestService';

const authStore = useAuthStore();
const count = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

async function fetchCount() {
  const u = authStore.user as UserClaims | null;
  const agentId = (u?.sub || u?.userId || '') as string;
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
