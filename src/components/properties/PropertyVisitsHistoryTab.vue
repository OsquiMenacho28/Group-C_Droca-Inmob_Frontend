<template>
  <div class="space-y-4">
    <!-- Date filters -->
    <div class="app-card p-4 rounded-xl">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label
            class="block mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            {{ t('reports.startDate') }}
          </label>
          <input
            v-model="dateFrom"
            type="date"
            class="app-input w-full"
            :max="dateTo || undefined"
          />
        </div>
        <div>
          <label
            class="block mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            {{ t('reports.endDate') }}
          </label>
          <input
            v-model="dateTo"
            type="date"
            class="app-input w-full"
            :min="dateFrom || undefined"
          />
        </div>
        <div>
          <fwb-button
            color="alternative"
            class="w-full"
            :disabled="!dateFrom && !dateTo"
            @click="clearFilters"
          >
            {{ t('propertyDetails.visitsClearFilters') }}
          </fwb-button>
        </div>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-2 gap-4">
      <div class="app-card p-4 rounded-xl">
        <p
          class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ t('propertyDetails.visitsTotal') }}
        </p>
        <p class="text-2xl font-bold text-primary mt-1">
          {{ stats.total }}
        </p>
      </div>
      <div class="app-card p-4 rounded-xl">
        <p
          class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {{ t('propertyDetails.visitsInterestPercent') }}
        </p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
          {{ stats.interestPercent }}%
        </p>
        <p class="text-[10px] text-gray-400 mt-1">
          {{ t('propertyDetails.visitsInterestedCount', { count: stats.interested }) }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12 gap-2 text-gray-400"
    >
      <div
        class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"
      ></div>
      <span class="text-sm">{{ t('propertyDetails.visitsHistoryLoading') }}</span>
    </div>

    <!-- Empty: no visits registered for this property (PA) -->
    <div
      v-else-if="hasNoRegisteredVisits"
      class="text-center py-12 app-card rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideCalendarX class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
      <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {{ t('propertyDetails.visitsHistoryEmpty') }}
      </p>
    </div>

    <!-- Empty: filters or no completed visits in range -->
    <div
      v-else-if="filteredVisits.length === 0"
      class="text-center py-12 app-card rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideCalendarX class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
      <p class="text-sm text-gray-400">
        {{
          dateFrom || dateTo
            ? t('propertyDetails.noVisitsInRange')
            : t('propertyDetails.visitsNoCompleted')
        }}
      </p>
    </div>

    <!-- Table -->
    <div v-else class="app-card rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-secondary">
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600"
          >
            <tr>
              <th scope="col" class="px-4 py-3 whitespace-nowrap">
                {{ t('propertyDetails.visitsColDate') }}
              </th>
              <th scope="col" class="px-4 py-3 whitespace-nowrap">
                {{ t('propertyDetails.visitsColTime') }}
              </th>
              <th scope="col" class="px-4 py-3">
                {{ t('propertyDetails.visitsColAgent') }}
              </th>
              <th scope="col" class="px-4 py-3 whitespace-nowrap">
                {{ t('propertyDetails.visitsColResult') }}
              </th>
              <th scope="col" class="px-4 py-3">
                {{ t('propertyDetails.visitsColNotes') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="visit in paginatedVisits"
              :key="visit.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap font-medium text-primary">
                {{ formatVisitDate(visit.startTime) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                {{ formatVisitTime(visit.startTime) }}
              </td>
              <td class="px-4 py-3">
                {{ visit.agentName || t('common.notSpecified') }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  v-if="visit.resultado"
                  :class="resultadoBadgeClass(visit.resultado)"
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                >
                  {{ getResultadoLabel(visit.resultado) }}
                </span>
                <span v-else class="text-[10px] text-gray-400 italic">
                  {{ t('propertyDetails.noResult') }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                <span v-if="visit.observaciones" class="line-clamp-2">
                  {{ visit.observaciones }}
                </span>
                <span v-else class="text-gray-400 italic text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="filteredVisits.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="filteredVisits.length"
        :size-options="[10, 20, 30]"
        class="px-4"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FwbButton } from 'flowbite-vue';
import IconLucideCalendarX from '~icons/lucide/calendar-x';
import type { Visit } from '@/types/reschedule';
import { usePropertyVisitsHistory } from '@/composables/usePropertyVisitsHistory';
import { formatDateLong, formatShortTime } from '@/utils/dateTime';
import { getLocaleString } from '@/locales/i18n';
import Pagination from '@/components/ui/Pagination.vue';

const props = defineProps<{
  visits: Visit[];
  loading?: boolean;
}>();

const { t } = useI18n();
const locale = getLocaleString();

const {
  dateFrom,
  dateTo,
  currentPage,
  pageSize,
  hasNoRegisteredVisits,
  filteredVisits,
  paginatedVisits,
  totalPages,
  stats,
  clearFilters,
} = usePropertyVisitsHistory(toRef(props, 'visits'));

function formatVisitDate(iso: string): string {
  return formatDateLong(iso);
}

function formatVisitTime(iso: string): string {
  return formatShortTime(iso, locale);
}

function getResultadoLabel(resultado: string): string {
  const map: Record<string, string> = {
    INTERESADO: t('visitResult.interesado'),
    NO_INTERESADO: t('visitResult.noInteresado'),
    PENDIENTE: t('visitResult.pendiente'),
  };
  return map[resultado] || resultado;
}

function resultadoBadgeClass(resultado: string): string {
  const map: Record<string, string> = {
    INTERESADO:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    NO_INTERESADO:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    PENDIENTE:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return map[resultado] || 'bg-gray-100 text-gray-800';
}
</script>
