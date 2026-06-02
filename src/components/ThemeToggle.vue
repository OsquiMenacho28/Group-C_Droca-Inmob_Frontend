<template>
  <fwb-button
    @click="toggleTheme"
    color="alternative"
    size="sm"
    pill
    :aria-label="t('common.toggleDarkMode')"
  >
    <IconLucideSun v-if="isDark" class="w-5 h-5" />
    <IconLucideMoon v-else class="w-5 h-5" />
  </fwb-button>
</template>

<script setup lang="ts">
import { FwbButton } from 'flowbite-vue';
import { useTheme } from '@/composables/useTheme';
import { useI18n } from 'vue-i18n';
import IconLucideSun from '~icons/lucide/sun';
import IconLucideMoon from '~icons/lucide/moon';

const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();
</script>
