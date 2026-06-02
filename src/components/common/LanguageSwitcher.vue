<template>
  <fwb-dropdown :show-arrow="false">
    <template #trigger>
      <button
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        :title="t('languageSwitcher.title')"
      >
        <IconLucideGlobe class="w-5 h-5" />
        <span class="hidden sm:inline">{{ currentLabel }}</span>
      </button>
    </template>

    <div class="w-48">
      <button
        v-for="lang in languages"
        :key="lang.value"
        @click="selectLanguage(lang.value)"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        :class="{
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium':
            locale === lang.value,
          'text-gray-700 dark:text-gray-300': locale !== lang.value,
        }"
      >
        <span>{{ lang.label }}</span>
        <IconLucideCheck v-if="locale === lang.value" class="w-4 h-4 ml-auto" />
      </button>
    </div>
  </fwb-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FwbDropdown } from 'flowbite-vue';
import { setLanguage, type Language } from '@/locales/i18n';
import IconLucideGlobe from '~icons/lucide/globe';
import IconLucideCheck from '~icons/lucide/check';

const { t, locale } = useI18n();

const languages = [
  { value: 'es', label: t('common.languageLabels.es') },
  { value: 'en', label: t('common.languageLabels.en') },
];

const currentLabel = computed(() => {
  const current = languages.find((l) => l.value === locale.value);
  return current?.label || t('languageSwitcher.fallback');
});

function selectLanguage(lang: string) {
  locale.value = lang;
  setLanguage(lang as Language);
}
</script>
