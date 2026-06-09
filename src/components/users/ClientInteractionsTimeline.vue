<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-end gap-3">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {{ t('clientInteractions.filterType') }}
        </label>
        <select v-model="typeFilter" class="app-input w-full text-sm">
          <option value="ALL">{{ t('clientInteractions.filterAll') }}</option>
          <option value="VISITA">{{ t('clientInteractions.typeVisit') }}</option>
          <option value="FAVORITO">{{ t('clientInteractions.typeFavorite') }}</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {{ t('clientInteractions.dateFrom') }}
        </label>
        <input v-model="dateFrom" type="date" class="app-input w-full text-sm" />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {{ t('clientInteractions.dateTo') }}
        </label>
        <input v-model="dateTo" type="date" class="app-input w-full text-sm" />
      </div>
      <button
        type="button"
        class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        @click="clearFilters"
      >
        {{ t('common.clear') }}
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-10 text-sm text-gray-500">
      <div
        class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"
      />
      {{ t('clientInteractions.loading') }}
    </div>

    <div
      v-else-if="accessDenied"
      class="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20"
    >
      <IconLucideShieldAlert class="w-10 h-10 text-amber-500 mx-auto mb-2" />
      <p class="text-sm font-medium text-amber-800 dark:text-amber-200">
        {{ t('clientInteractions.accessDenied') }}
      </p>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div
      v-else-if="filteredInteractions.length === 0"
      class="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center"
    >
      <IconLucideHistory class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
        {{ t('clientInteractions.empty') }}
      </p>
      <p class="text-xs text-gray-400 mt-1">
        {{ t('clientInteractions.emptyHint') }}
      </p>
    </div>

    <ol v-else class="relative border-l-2 border-blue-200 dark:border-blue-800 ml-3 space-y-6">
      <li
        v-for="item in filteredInteractions"
        :key="item.id"
        class="relative pl-6"
      >
        <span
          class="absolute -left-[0.57rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-gray-900"
          :class="item.type === 'VISITA' ? 'bg-indigo-500' : 'bg-rose-500'"
        />
        <div
          class="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
        >
          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <component
                :is="item.type === 'VISITA' ? IconLucideCalendar : IconLucideHeart"
                class="w-4 h-4"
                :class="
                  item.type === 'VISITA'
                    ? 'text-indigo-500'
                    : 'text-rose-500'
                "
              />
              <span class="text-xs font-bold uppercase tracking-wide text-gray-500">
                {{ interactionTypeLabel(item.type) }}
              </span>
              <span
                v-if="item.subType"
                class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold"
              >
                {{ subTypeLabel(item) }}
              </span>
            </div>
            <time class="text-xs text-gray-400 whitespace-nowrap">
              {{ formatDateTime(item.occurredAt) }}
            </time>
          </div>

          <p class="text-sm font-semibold text-primary">
            {{ item.propertyName || item.propertyId }}
          </p>

          <p v-if="item.agentName" class="text-xs text-secondary mt-1">
            {{ t('clientInteractions.agent') }}: {{ item.agentName }}
          </p>

          <p v-if="item.detail && item.type === 'VISITA'" class="text-xs text-gray-500 mt-2 italic">
            {{ item.detail }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import IconLucideCalendar from '~icons/lucide/calendar';
import IconLucideHeart from '~icons/lucide/heart';
import IconLucideHistory from '~icons/lucide/history';
import IconLucideShieldAlert from '~icons/lucide/shield-alert';
import { useClientInteractions } from '@/composables/useClientInteractions';
import type { ClientInteraction } from '@/types/clientInteraction';
import { getLocaleString } from '@/locales/i18n';

const props = defineProps<{
  clientAuthUserId?: string;
  enabled?: boolean;
}>();

const { t } = useI18n();

const {
  filteredInteractions,
  loading,
  error,
  accessDenied,
  typeFilter,
  dateFrom,
  dateTo,
} = useClientInteractions({
  clientAuthUserId: toRef(props, 'clientAuthUserId'),
  enabled: toRef(props, 'enabled'),
});

function clearFilters() {
  typeFilter.value = 'ALL';
  dateFrom.value = '';
  dateTo.value = '';
}

function interactionTypeLabel(type: ClientInteraction['type']) {
  return type === 'VISITA'
    ? t('clientInteractions.typeVisit')
    : t('clientInteractions.typeFavorite');
}

function subTypeLabel(item: ClientInteraction) {
  if (item.type === 'FAVORITO' && item.subType === 'ADDED') {
    return t('clientInteractions.favoriteAdded');
  }
  if (item.type === 'VISITA' && item.subType) {
    const key = `status.${String(item.subType).toLowerCase()}`;
    const translated = t(key);
    return translated !== key ? translated : item.subType;
  }
  return item.subType || '';
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(getLocaleString(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
