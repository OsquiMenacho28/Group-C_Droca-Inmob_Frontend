<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          {{ t('dashboard.title') }}
        </h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">
          {{ t('dashboard.welcome') }}
        </p>
      </div>
    </div>

    <!-- Legacy/Welcome View -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <div
        class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-primary dark:text-white">
          {{ t('dashboard.systemStatus') }}
        </h3>
        <p
          class="text-sm text-green-500 font-medium mt-2 flex items-center gap-2"
        >
          <span
            class="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
          ></span>
          {{ t('dashboard.allServicesOperational') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
