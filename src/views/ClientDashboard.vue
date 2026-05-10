<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-primary">
      {{ t('clientDashboard.title') }}
    </h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      {{ t('clientDashboard.welcome') }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
