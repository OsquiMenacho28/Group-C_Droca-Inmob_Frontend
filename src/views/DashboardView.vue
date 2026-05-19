<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-primary">{{ t('dashboard.title') }}</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      {{ t('dashboard.welcome') }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <div
        class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-primary">
          {{ t('dashboard.systemStatus') }}
        </h3>
        <p class="text-sm text-green-500 font-medium mt-1">
          ● {{ t('dashboard.allServicesOperational') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
