import { computed, ref, watch, type Ref } from 'vue';
import type { Visit } from '@/types/reschedule';
import type { EventStatus } from '@/types/visitCalendar';

export const VISITS_PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

const COMPLETED_STATUSES: EventStatus[] = ['REALIZADA', 'COMPLETED'];

export function isCompletedVisit(visit: Visit): boolean {
  return COMPLETED_STATUSES.includes(visit.status);
}

function startOfLocalDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function endOfLocalDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999`);
}

export function usePropertyVisitsHistory(visits: Ref<Visit[]>) {
  const dateFrom = ref('');
  const dateTo = ref('');
  const currentPage = ref(0);
  const pageSize = ref<number>(VISITS_PAGE_SIZE_OPTIONS[0]);

  const hasNoRegisteredVisits = computed(() => visits.value.length === 0);

  const completedVisits = computed(() => visits.value.filter(isCompletedVisit));

  const filteredVisits = computed(() => {
    let result = completedVisits.value;

    if (dateFrom.value) {
      const from = startOfLocalDay(dateFrom.value);
      result = result.filter((v) => new Date(v.startTime) >= from);
    }

    if (dateTo.value) {
      const to = endOfLocalDay(dateTo.value);
      result = result.filter((v) => new Date(v.startTime) <= to);
    }

    return [...result].sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  });

  const stats = computed(() => {
    const total = filteredVisits.value.length;
    const interested = filteredVisits.value.filter(
      (v) => v.resultado === 'INTERESADO'
    ).length;
    const interestPercent =
      total > 0 ? Math.round((interested / total) * 1000) / 10 : 0;

    return { total, interested, interestPercent };
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredVisits.value.length / pageSize.value))
  );

  const paginatedVisits = computed(() => {
    const start = currentPage.value * pageSize.value;
    return filteredVisits.value.slice(start, start + pageSize.value);
  });

  watch([filteredVisits, pageSize], () => {
    if (currentPage.value >= totalPages.value) {
      currentPage.value = Math.max(0, totalPages.value - 1);
    }
  });

  watch([dateFrom, dateTo], () => {
    currentPage.value = 0;
  });

  function clearFilters() {
    dateFrom.value = '';
    dateTo.value = '';
    currentPage.value = 0;
  }

  return {
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    hasNoRegisteredVisits,
    completedVisits,
    filteredVisits,
    paginatedVisits,
    totalPages,
    stats,
    clearFilters,
  };
}
