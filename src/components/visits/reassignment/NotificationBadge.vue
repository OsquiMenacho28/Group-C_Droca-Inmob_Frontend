<template>
  <span
    v-if="count > 0"
    class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ml-1.5 animate-pulse"
    :title="`${count} pending reassignment request${count !== 1 ? 's' : ''}`"
  >
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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
