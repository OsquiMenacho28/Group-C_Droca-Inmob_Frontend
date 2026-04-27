<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <div class="flex items-center gap-3">
            <router-link
              to="/dashboard"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <IconLucideArrowLeft class="h-5 w-5" />
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('calendar.title') }}
            </h1>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ t('calendar.subtitle', { weekLabel }) }}
          </p>
        </div>

        <FwbButton
          @click="$router.push('/schedule-visit')"
          color="blue"
          class="inline-flex items-center gap-2"
        >
          <IconLucidePlus class="h-4 w-4" />
          {{ t('calendar.scheduleVisit') }}
        </FwbButton>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <FwbAlert v-if="pendingRequests.length > 0" type="warning" class="rounded-xl shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div>
            <span class="text-sm font-bold">{{ t('calendar.pendingRequestsTitle') }}</span>
            <p class="text-xs mt-1">
              {{ t('calendar.pendingRequestsText', { n: pendingRequests.length }) }}
            </p>
          </div>
          <FwbButton
            @click="loadPendingRequests"
            color="alternative"
            size="xs"
            class="font-semibold"
          >
            {{ t('calendar.update') }}
          </FwbButton>
        </div>

        <div class="space-y-3">
          <FwbCard
            v-for="request in pendingRequests.slice(0, 5)"
            :key="request.id"
            class="border-amber-100 dark:border-gray-700"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ request.propertyName }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  {{ t('calendar.client') }} {{ request.clientName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatPendingDate(request.preferredDateTime) }}
                </p>
                <p
                  v-if="request.message"
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                >
                  {{ request.message }}
                </p>
              </div>
              <FwbBadge type="yellow" size="sm" class="shrink-0 text-[10px] font-bold">
                {{ t('status.pending') }}
              </FwbBadge>
            </div>

            <div class="flex gap-2 mt-3">
              <FwbButton
                @click="handleAcceptRequest(request.id)"
                :disabled="requestActionLoadingId === request.id"
                color="green"
                size="xs"
              >
                {{
                  requestActionLoadingId === request.id
                    ? t('common.processing')
                    : t('common.accept')
                }}
              </FwbButton>
              <FwbButton
                @click="handleRejectRequest(request.id)"
                :disabled="requestActionLoadingId === request.id"
                color="red"
                size="xs"
              >
                {{ t('common.reject') }}
              </FwbButton>
            </div>
          </FwbCard>
        </div>
      </FwbAlert>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-colors shadow-sm"
      >
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex items-center gap-2 shrink-0">
            <FwbButton @click="prevWeek" color="alternative" size="sm">
              <IconLucideChevronLeft class="h-4 w-4" />
            </FwbButton>
            <FwbButton @click="goToday" color="alternative" size="sm">
              {{ t('calendar.today') }}
            </FwbButton>
            <FwbButton @click="nextWeek" color="alternative" size="sm">
              <IconLucideChevronRight class="h-4 w-4" />
            </FwbButton>
          </div>

          <div class="flex-1 relative" id="prop-filter-container">
            <FwbInput
              v-model="searchTermProperty"
              :label="t('calendar.filterProperty')"
              :placeholder="t('calendar.searchProperty')"
              @focus="showPropertyDropdown = true"
              autocomplete="off"
            >
              <template #prefix>
                <IconLucideSearch class="w-4 h-4 text-gray-400" />
              </template>
              <template #suffix>
                <button type="button" @click="showPropertyDropdown = !showPropertyDropdown">
                  <IconLucideChevronDown
                    class="h-4 w-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showPropertyDropdown }"
                  />
                </button>
              </template>
            </FwbInput>
            <div
              v-if="showPropertyDropdown"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            >
              <ul class="py-1">
                <li
                  v-if="filteredProperties.length === 0"
                  class="px-4 py-3 text-xs text-gray-500 italic"
                >
                  {{ t('calendar.noPropertiesFound') }}
                </li>
                <li
                  v-for="p in filteredProperties"
                  :key="p.id"
                  @click="selectProperty(p)"
                  class="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b last:border-b-0 border-gray-50 dark:border-gray-700 transition-colors"
                >
                  <p class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ p.title }}
                  </p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {{ p.address }}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex-1 relative" id="agent-filter-container">
            <FwbInput
              v-model="searchTermAgent"
              :label="t('calendar.filterAgent')"
              :placeholder="t('calendar.searchAgent')"
              @focus="showAgentDropdown = true"
              autocomplete="off"
            >
              <template #prefix>
                <IconLucideUser class="w-4 h-4 text-gray-400" />
              </template>
              <template #suffix>
                <button type="button" @click="showAgentDropdown = !showAgentDropdown">
                  <IconLucideChevronDown
                    class="h-4 w-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showAgentDropdown }"
                  />
                </button>
              </template>
            </FwbInput>
            <div
              v-if="showAgentDropdown"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            >
              <ul class="py-1">
                <li
                  v-if="filteredAgents.length === 0"
                  class="px-4 py-3 text-xs text-gray-500 italic"
                >
                  {{ t('calendar.noAgentsFound') }}
                </li>
                <li
                  v-for="a in filteredAgents"
                  :key="a.id"
                  @click="selectAgent(a)"
                  class="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b last:border-b-0 border-gray-50 dark:border-gray-700 transition-colors"
                >
                  <p class="text-sm font-bold text-gray-900 dark:text-white">
                    {{ a.fullName }}
                  </p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">
                    {{ a.email }}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex items-end pb-0.5">
            <FwbButton
              v-if="filterPropertyId || filterAgentId"
              @click="clearFilters"
              color="red"
              size="xs"
              class="uppercase tracking-wider"
            >
              {{ t('common.clear') }}
            </FwbButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" v-if="calendarData">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center"
        >
          <div class="p-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ calendarData?.totalEvents ?? 0 }}
            </p>
            <p class="text-[10px] text-gray-500 uppercase font-black">
              {{ t('calendar.totalAppointments') }}
            </p>
          </div>
        </div>
        <div
          class="bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm text-center"
        >
          <div class="p-4">
            <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {{ calendarData?.myEvents ?? 0 }}
            </p>
            <p class="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-black">
              {{ t('calendar.myVisits') }}
            </p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center"
        >
          <div class="p-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ teamEvents }}
            </p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">
              {{ t('calendar.team') }}
            </p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-center"
        >
          <div class="p-4">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ uniqueProperties }}
            </p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black">
              {{ t('calendar.properties') }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="!loading"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors"
      >
        <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="py-3 px-2 text-center border-r border-gray-100 dark:border-gray-700 last:border-r-0"
            :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': isToday(day) }"
          >
            <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">
              {{ dayName(day) }}
            </p>
            <p
              class="text-lg font-bold mt-0.5"
              :class="
                isToday(day)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-800 dark:text-gray-200'
              "
            >
              {{ day.getDate() }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-7 min-h-112.5">
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="border-r border-gray-100 dark:border-gray-700 last:border-r-0 p-2 space-y-2"
            :class="{ 'bg-blue-50/20 dark:bg-blue-900/5': isToday(day) }"
          >
            <div
              v-for="ev in eventsForDay(day)"
              :key="ev.id"
              @click="selectEvent(ev)"
              class="rounded-lg p-2 cursor-pointer text-[11px] leading-tight transition-all hover:scale-[1.02] shadow-sm border-l-4"
              :class="eventCardClass(ev)"
            >
              <div class="font-bold truncate">{{ ev.propertyName }}</div>
              <div class="opacity-80 mt-1">{{ shortTime(ev.startTime) }}</div>
            </div>
            <p
              v-if="eventsForDay(day).length === 0"
              class="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-10 italic"
            >
              {{ t('calendar.freeDay') }}
            </p>
          </div>
        </div>
      </div>

      <FwbAlert v-if="error" type="danger" class="mt-4">
        {{ error }}
      </FwbAlert>
    </div>

    <FwbModal v-if="showEventModal" @close="closeEventModal">
      <template #header>
        <div class="flex justify-between items-start w-full">
          <div>
            <span class="text-xl font-bold">{{ selectedEvent?.propertyName }}</span>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedEvent?.propertyAddress }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">{{ t('calendar.agent') }}</span>
            <span class="font-bold dark:text-white">{{ selectedEvent?.agentName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">{{ t('calendar.schedule') }}</span>
            <span class="font-bold dark:text-white">
              {{ shortTime(selectedEvent?.startTime ?? '') }} -
              {{ shortTime(selectedEvent?.endTime ?? '') }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">{{ t('calendar.statusLabel') }}</span>
            <FwbBadge
              :type="statusType(selectedEvent?.status ?? '')"
              size="sm"
              class="text-[10px] font-black uppercase"
            >
              {{ statusLabel(selectedEvent?.status ?? '') }}
            </FwbBadge>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 flex-wrap w-full">
          <FwbButton @click="closeEventModal" color="alternative" class="flex-1">
            {{ t('common.close') }}
          </FwbButton>

          <template v-if="selectedEvent?.ownEvent && selectedEvent?.status !== 'CANCELLED'">
            <FwbButton
              @click="handleCancel(selectedEvent!)"
              :disabled="cancelling"
              color="red"
              class="flex-1"
            >
              {{ cancelling ? t('common.processing') : t('common.cancel') }}
            </FwbButton>

            <ReassignButton
              class="flex-1"
              :visit-id="selectedEvent.id"
              :visit-info="`${shortTime(selectedEvent.startTime)} - ${selectedEvent.propertyName}`"
              @request-sent="handleReassignmentSent"
            />
          </template>
        </div>
        <div>
          <template v-if="selectedEvent?.status === 'CANCELLED'">
            <!-- Only visible when visit.status === 'CANCELLED' -->
            <RescheduleButton :visit="selectedEvent" @rescheduled="onRescheduled" />

            <!-- Shows link to new visit if this one was rescheduled -->
            <!-- <RescheduledVisitLink :visit-id="selectedEvent.id" :key="refreshKey" /> -->
          </template>
        </div>
        <!-- Show only if this visit itself was created by rescheduling another -->
        <div
          v-if="selectedEvent?.originVisitId"
          class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <svg
            class="w-4 h-4 text-amber-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <p class="text-sm text-amber-700">
            Esta visita fue creada al reprogramar la visita original.
          </p>
          <RouterLink
            :to="`/visits/${selectedEvent.originVisitId}`"
            class="ml-auto text-xs text-amber-700 underline hover:text-amber-900 shrink-0"
          >
            Ver visita original
          </RouterLink>
        </div>
      </template>
    </FwbModal>

    <FwbModal v-if="showCancelConfirm" @close="showCancelConfirm = false">
      <template #header>
        <span class="text-red-600 dark:text-red-500">{{ t('calendar.confirmCancelTitle') }}</span>
      </template>
      <template #body>
        <p class="text-gray-600 dark:text-gray-300">{{ t('calendar.confirmCancelText') }}</p>
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <FwbButton @click="showCancelConfirm = false" color="alternative">
            {{ t('calendar.noKeep') }}
          </FwbButton>
          <FwbButton @click="executeCancel" color="red">{{ t('calendar.yesCancel') }}</FwbButton>
        </div>
      </template>
    </FwbModal>

    <FwbAlert v-if="alertMessage" :type="alertType" class="fixed bottom-4 right-4 z-70 max-w-sm">
      {{ alertMessage }}
    </FwbAlert>
  </div>
</template>

<script setup lang="ts">
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideChevronLeft from '~icons/lucide/chevron-left';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideChevronDown from '~icons/lucide/chevron-down';
  import IconLucideUser from '~icons/lucide/user';
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { FwbCard, FwbButton, FwbModal, FwbInput, FwbAlert, FwbBadge } from 'flowbite-vue';
  import { getCalendar, cancelVisit } from '@/services/calendarService';
  import { propertyService } from '@/modules/properties';
  import { userService } from '@/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import type {
    CalendarResponse,
    CalendarEventResponse,
    VisitRequestResponse,
  } from '@/types/visitCalendar';
  import type { RescheduleResponse } from '@/types/reschedule';
  import {
    getPendingRequestsForAgent,
    acceptVisitRequest,
    rejectVisitRequest,
  } from '@/services/visitRequestService';
  import ReassignButton from '@/components/visits/reassignment/ReassignButton.vue';
  import RescheduleButton from '@/components/visits/reschedule/RescheduleButton.vue';
  // import RescheduledVisitLink from '@/components/visits/reschedule/RescheduledVisitLink.vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();
  const authStore = useAuthStore();
  const myAgentId = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (u?.sub || u?.userId || '') as string;
  });

  const loading = ref(false);
  const error = ref('');
  const calendarData = ref<CalendarResponse | null>(null);
  const selectedEvent = ref<CalendarEventResponse | null>(null);
  const showEventModal = ref(false);
  const cancelling = ref(false);
  const currentWeekStart = ref(getMonday(new Date()));
  const pendingRequests = ref<VisitRequestResponse[]>([]);
  const requestActionLoadingId = ref('');
  const showCancelConfirm = ref(false);
  const pendingCancelEvent = ref<CalendarEventResponse | null>(null);
  const alertMessage = ref('');
  const alertType = ref<'success' | 'danger' | 'warning' | 'info'>('danger');
  let pendingRequestsIntervalId: ReturnType<typeof setInterval> | null = null;
  const refreshKey = ref(0); // incremented after rescheduling to force RescheduledVisitLink reload

  const allProperties = ref<
    { id: string; title: string; address: string; [key: string]: unknown }[]
  >([]);
  const allAgents = ref<
    {
      id: string;
      fullName: string;
      email: string;
      userType: string;
      [key: string]: unknown;
    }[]
  >([]);
  const searchTermProperty = ref('');
  const showPropertyDropdown = ref(false);
  const filterPropertyId = ref('');
  const searchTermAgent = ref('');
  const showAgentDropdown = ref(false);
  const filterAgentId = ref('');

  function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const m = new Date(d);
    m.setDate(d.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
  }
  const weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart.value);
      d.setDate(currentWeekStart.value.getDate() + i);
      return d;
    })
  );
  const weekLabel = computed(() => {
    const from = weekDays.value[0];
    const to = weekDays.value[6];
    return `${from.getDate()} ${from.toLocaleString(getLocaleString(), { month: 'short' })} — ${to.getDate()} ${to.toLocaleString(getLocaleString(), { month: 'short', year: 'numeric' })}`;
  });

  const loadFilterData = async () => {
    try {
      const [p, uRes] = await Promise.all([
        propertyService.getProperties(),
        userService.getUsers(0, 1000),
      ]);
      const u = uRes.data || [];
      allProperties.value = (p || []) as {
        id: string;
        title: string;
        address: string;
        [key: string]: unknown;
      }[];
      allAgents.value = (
        u as {
          id: string;
          fullName: string;
          email: string;
          userType: string;
          [key: string]: unknown;
        }[]
      ).filter((x) => x.userType === 'EMPLOYEE' || x.userType === 'ADMIN');
    } catch {
      error.value = t('calendar.loadError');
      setTimeout(() => {
        error.value = '';
      }, 5000);
    }
  };

  function showAlert(msg: string, type: 'success' | 'danger' | 'warning' | 'info' = 'danger') {
    alertMessage.value = msg;
    alertType.value = type;
    setTimeout(() => {
      alertMessage.value = '';
    }, 4000);
  }

  async function loadCalendar() {
    loading.value = true;
    error.value = '';
    try {
      const from = weekDays.value[0].toISOString();
      const to = new Date(weekDays.value[6]).toISOString().split('T')[0] + 'T23:59:59.999Z';
      calendarData.value = await getCalendar(
        from,
        to,
        myAgentId.value,
        filterAgentId.value || undefined,
        filterPropertyId.value || undefined
      );
    } catch (e) {
      error.value = handleApiError(e).message;
    } finally {
      loading.value = false;
    }
  }

  async function loadPendingRequests() {
    if (!myAgentId.value) {
      pendingRequests.value = [];
      return;
    }

    try {
      const requests = await getPendingRequestsForAgent(myAgentId.value);
      pendingRequests.value = requests.filter((request) => request.status === 'PENDING');
    } catch (e) {
      console.error(handleApiError(e).message);
    }
  }

  const filteredProperties = computed(() => {
    const s = searchTermProperty.value.toLowerCase();
    if (!s) return allProperties.value.slice(0, 10);
    return allProperties.value
      .filter(
        (p) =>
          String(p.title).toLowerCase().includes(s) || String(p.address).toLowerCase().includes(s)
      )
      .slice(0, 10);
  });

  const filteredAgents = computed(() => {
    const s = searchTermAgent.value.toLowerCase();
    if (!s) return allAgents.value.slice(0, 10);
    return allAgents.value.filter((a) => String(a.fullName).toLowerCase().includes(s)).slice(0, 10);
  });

  const selectProperty = (p: { id: string; title: string; [key: string]: unknown }) => {
    filterPropertyId.value = p.id;
    searchTermProperty.value = p.title;
    showPropertyDropdown.value = false;
    loadCalendar();
  };
  const selectAgent = (a: { id: string; fullName: string; [key: string]: unknown }) => {
    filterAgentId.value = a.id;
    searchTermAgent.value = a.fullName;
    showAgentDropdown.value = false;
    loadCalendar();
  };
  function clearFilters() {
    filterPropertyId.value = '';
    searchTermProperty.value = '';
    filterAgentId.value = '';
    searchTermAgent.value = '';
    loadCalendar();
  }

  const eventsForDay = (day: Date) =>
    calendarData.value?.events.filter(
      (ev) => new Date(ev.startTime).toDateString() === day.toDateString()
    ) || [];
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const dayName = (d: Date) => d.toLocaleString(getLocaleString(), { weekday: 'short' });
  const shortTime = (iso: string) =>
    iso
      ? new Date(iso).toLocaleTimeString(getLocaleString(), {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  const teamEvents = computed(
    () => (calendarData.value?.totalEvents ?? 0) - (calendarData.value?.myEvents ?? 0)
  );
  const uniqueProperties = computed(
    () => new Set(calendarData.value?.events.map((e) => e.propertyId)).size
  );

  const formatPendingDate = (iso: string) =>
    new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  function eventCardClass(ev: CalendarEventResponse) {
    if (ev.status === 'CANCELLED')
      return 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 line-through';
    return ev.ownEvent
      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border-blue-500'
      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200';
  }

  function statusType(s: string): 'yellow' | 'green' | 'red' | 'default' {
    const map: Record<string, 'yellow' | 'green' | 'red' | 'default'> = {
      SCHEDULED: 'yellow',
      CONFIRMED: 'green',
      CANCELLED: 'red',
    };
    return map[s] || 'default';
  }

  const statusLabel = (s: string) =>
    ({
      SCHEDULED: t('status.scheduled'),
      CONFIRMED: t('status.confirmed'),
      CANCELLED: t('status.cancelled'),
    })[s] || s;

  function prevWeek() {
    currentWeekStart.value = new Date(
      currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)
    );
    loadCalendar();
  }
  function nextWeek() {
    currentWeekStart.value = new Date(
      currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)
    );
    loadCalendar();
  }
  function goToday() {
    currentWeekStart.value = getMonday(new Date());
    loadCalendar();
  }

  const selectEvent = (ev: CalendarEventResponse) => {
    selectedEvent.value = ev;
    showEventModal.value = true;
  };

  const closeEventModal = () => {
    showEventModal.value = false;
    selectedEvent.value = null;
  };

  async function handleCancel(ev: CalendarEventResponse) {
    showCancelConfirm.value = true;
    pendingCancelEvent.value = ev;
  }

  async function executeCancel() {
    if (!pendingCancelEvent.value) return;
    showCancelConfirm.value = false;
    cancelling.value = true;
    try {
      const updated = await cancelVisit(pendingCancelEvent.value.id, myAgentId.value);
      if (calendarData.value) {
        const idx = calendarData.value.events.findIndex(
          (e) => e.id === pendingCancelEvent.value!.id
        );
        if (idx !== -1) calendarData.value.events[idx] = updated;
      }
      closeEventModal();
    } catch {
      showAlert(t('calendar.loadError'));
    } finally {
      cancelling.value = false;
      pendingCancelEvent.value = null;
    }
  }

  function handleReassignmentSent() {
    closeEventModal();
    loadCalendar();
  }

  async function handleAcceptRequest(requestId: string) {
    if (!myAgentId.value) return;

    requestActionLoadingId.value = requestId;
    try {
      await acceptVisitRequest(requestId, myAgentId.value);
      await Promise.all([loadPendingRequests(), loadCalendar()]);
    } catch {
      showAlert(t('calendar.loadError'));
    } finally {
      requestActionLoadingId.value = '';
    }
  }

  async function handleRejectRequest(requestId: string) {
    if (!myAgentId.value) return;

    requestActionLoadingId.value = requestId;
    try {
      await rejectVisitRequest(requestId, myAgentId.value);
      await loadPendingRequests();
    } catch {
      showAlert(t('calendar.loadError'));
    } finally {
      requestActionLoadingId.value = '';
    }
  }

  function onRescheduled(_response: RescheduleResponse) {
    // Increment refreshKey to force RescheduledVisitLink to re-query the API
    refreshKey.value++;
  }

  const closeClickOutside = (e: MouseEvent) => {
    if (!e.target || !(e.target instanceof HTMLElement)) return;
    if (!e.target.closest('#prop-filter-container')) showPropertyDropdown.value = false;
    if (!e.target.closest('#agent-filter-container')) showAgentDropdown.value = false;
  };

  onMounted(() => {
    loadFilterData();
    loadCalendar();
    loadPendingRequests();
    window.addEventListener('click', closeClickOutside);
    pendingRequestsIntervalId = setInterval(loadPendingRequests, 30_000);
  });
  onUnmounted(() => {
    window.removeEventListener('click', closeClickOutside);
    if (pendingRequestsIntervalId) clearInterval(pendingRequestsIntervalId);
  });
</script>
