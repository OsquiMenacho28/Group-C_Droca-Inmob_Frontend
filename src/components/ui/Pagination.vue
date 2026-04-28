<template>
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 py-6">
    <!-- Items per page selector -->
    <div
      class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 order-2 md:order-1"
    >
      <span>{{ t('common.show') }}</span>
      <fwb-select
        :model-value="String(pageSize)"
        @update:model-value="onPageSizeChange"
        :options="sizeOptionsMapped"
        size="sm"
        class="!w-20"
      />
      <span>{{ t('common.entries') }}</span>
      <span v-if="total > 0" class="ml-2 hidden sm:inline">
        ({{ t('common.total') }}: {{ total }})
      </span>
    </div>

    <!-- Navigation logic -->
    <nav
      aria-label="Page navigation"
      class="flex flex-wrap items-center justify-center gap-4 order-1 md:order-2"
    >
      <ul class="flex -space-x-px text-sm">
        <li>
          <button
            @click="onPageChange(currentPage - 1)"
            :disabled="currentPage === 0"
            class="flex items-center justify-center px-3 h-9 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ t('common.previous') }}
          </button>
        </li>

        <li v-for="(page, idx) in visiblePages" :key="idx">
          <button
            v-if="page !== -1"
            @click="onPageChange(page)"
            :aria-current="currentPage === page ? 'page' : undefined"
            class="flex items-center justify-center w-9 h-9 leading-tight border transition-colors"
            :class="[
              currentPage === page
                ? 'z-10 text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white font-bold'
                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
            ]"
          >
            {{ page + 1 }}
          </button>
          <span
            v-else
            class="flex items-center justify-center w-9 h-9 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
          >
            ...
          </span>
        </li>

        <li>
          <button
            @click="onPageChange(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="flex items-center justify-center px-3 h-9 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ t('common.next') }}
          </button>
        </li>
      </ul>

      <!-- Go to page -->
      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ t('common.goTo') }}
        </span>
        <fwb-input
          type="number"
          v-model="jumpPage"
          @keyup.enter="handleJump"
          :placeholder="String(currentPage + 1)"
          size="sm"
          class="!w-16"
        />
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ t('common.page') }}
        </span>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbSelect, FwbInput } from 'flowbite-vue';

  const props = defineProps<{
    currentPage: number;
    pageSize: number;
    totalPages: number;
    total: number;
    sizeOptions?: number[];
  }>();

  const emit = defineEmits<{
    (e: 'update:currentPage', value: number): void;
    (e: 'update:pageSize', value: number): void;
    (e: 'change'): void;
  }>();

  const { t } = useI18n();
  const jumpPage = ref<number | string>('');
  const sizeOptions = computed(() => props.sizeOptions || [5, 10, 20, 50, 100]);
  const sizeOptionsMapped = computed(() =>
    sizeOptions.value.map((s) => ({ value: String(s), name: String(s) }))
  );

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const total = props.totalPages;
    const current = props.currentPage;

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 3) pages.push(-1); // ellipsis

      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 4) pages.push(-1); // ellipsis
      if (!pages.includes(total - 1)) pages.push(total - 1);
    }
    return pages;
  });

  const onPageChange = (page: number) => {
    if (page >= 0 && page < props.totalPages) {
      emit('update:currentPage', page);
      emit('change');
    }
  };

  const onPageSizeChange = (val: string) => {
    const newSize = parseInt(val);
    emit('update:pageSize', newSize);
    emit('update:currentPage', 0);
    emit('change');
  };

  const handleJump = () => {
    const pageNum = parseInt(jumpPage.value.toString());
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= props.totalPages) {
      onPageChange(pageNum - 1);
      jumpPage.value = '';
    }
  };
</script>
