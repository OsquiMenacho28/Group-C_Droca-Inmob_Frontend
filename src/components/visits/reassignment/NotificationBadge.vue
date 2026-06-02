<template>
  <FwbBadge v-if="count > 0" type="red" size="sm" class="ml-1.5 animate-pulse">
    {{ count > 99 ? '99+' : count }}
  </FwbBadge>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { FwbBadge } from 'flowbite-vue';
import reassignmentService from '@/services/reassignmentService';

const count = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  fetchCount();
  intervalId = setInterval(fetchCount, 60_000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

async function fetchCount() {
  try {
    count.value = await reassignmentService.getPendingCount();
  } catch {}
}
</script>
