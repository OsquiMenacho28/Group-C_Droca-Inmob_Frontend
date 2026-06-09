<template>
  <div class="app-page">
    <div class="app-card border-t-0 border-x-0 px-6 py-4">
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
            <h1 class="text-2xl font-bold text-primary">
              {{ t('calendar.title') }}
            </h1>
          </div>
          <p class="text-sm text-secondary mt-0.5">
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
      <FwbAlert
        v-if="pendingRequests.length > 0"
        type="warning"
        class="rounded-xl shadow-sm"
      >
        <div class="flex items-center justify-between gap-3 mb-2">
          <div>
            <span class="text-sm font-bold">{{
              t('calendar.pendingRequestsTitle')
            }}</span>
            <p class="text-xs mt-1">
              {{
                t('calendar.pendingRequestsText', { n: pendingRequests.length })
              }}
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
                <p class="text-sm font-semibold text-primary truncate">
                  {{ request.propertyName }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  {{ t('calendar.client') }} {{ request.clientName }}
                </p>
                <p class="text-xs text-secondary">
                  <strong>{{ t('calendar.preferredTime', 'Horario Principal:') }}</strong> {{ formatPendingDate(request.preferredDateTime) }}
                </p>
                <p v-if="request.alternativeDateTime" class="text-xs text-secondary mt-0.5">
                  <strong>{{ t('calendar.alternativeTime', 'Horario Alternativo:') }}</strong> {{ formatPendingDate(request.alternativeDateTime) }}
                </p>
                <p
                  v-if="request.message"
                  class="text-xs text-secondary mt-1 line-clamp-2"
                >
                  {{ request.message }}
                </p>
              </div>
              <FwbBadge
                type="yellow"
                size="sm"
                class="shrink-0 text-[10px] font-bold"
              >
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

      <div class="app-card p-4">
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
                <button
                  type="button"
                  @click="showPropertyDropdown = !showPropertyDropdown"
                >
                  <IconLucideChevronDown
                    class="h-4 w-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showPropertyDropdown }"
                  />
                </button>
              </template>
            </FwbInput>
            <div
              v-if="showPropertyDropdown"
              class="absolute z-50 w-full mt-1 app-card rounded-lg shadow-xl max-h-60 overflow-y-auto"
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
                  <p class="text-sm font-bold text-primary">
                    {{ p.title }}
                  </p>
                  <p class="text-[10px] text-secondary truncate">
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
                <button
                  type="button"
                  @click="showAgentDropdown = !showAgentDropdown"
                >
                  <IconLucideChevronDown
                    class="h-4 w-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showAgentDropdown }"
                  />
                </button>
              </template>
            </FwbInput>
            <div
              v-if="showAgentDropdown"
              class="absolute z-50 w-full mt-1 app-card rounded-lg shadow-xl max-h-60 overflow-y-auto"
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
                  <p class="text-sm font-bold text-primary">
                    {{ a.fullName }}
                  </p>
                  <p class="text-[10px] text-secondary">
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
        <div class="app-card text-center">
          <div class="p-4">
            <p class="text-2xl font-bold text-primary">
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
            <p
              class="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-black"
            >
              {{ t('calendar.myVisits') }}
            </p>
          </div>
        </div>
        <div class="app-card text-center">
          <div class="p-4">
            <p class="text-2xl font-bold text-primary">
              {{ teamEvents }}
            </p>
            <p class="text-[10px] text-secondary uppercase font-black">
              {{ t('calendar.team') }}
            </p>
          </div>
        </div>
        <div class="app-card text-center">
          <div class="p-4">
            <p class="text-2xl font-bold text-primary">
              {{ uniqueProperties }}
            </p>
            <p class="text-[10px] text-secondary uppercase font-black">
              {{ t('calendar.properties') }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="!loading" class="app-card overflow-hidden">
        <div
          class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700"
        >
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="py-3 px-2 text-center border-r border-gray-100 dark:border-gray-700 last:border-r-0"
            :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': isToday(day) }"
          >
            <p
              class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase"
            >
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
            <p
              v-if="getAvailabilityTextForDay(day)"
              class="text-[9px] text-gray-450 dark:text-gray-500 mt-1 uppercase font-black tracking-tighter leading-none"
            >
              {{ getAvailabilityTextForDay(day) }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-7 min-h-112.5">
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="border-r border-gray-100 dark:border-gray-700 last:border-r-0 p-2 space-y-2"
            :class="{
              'bg-blue-50/20 dark:bg-blue-900/5': isToday(day),
              'bg-gray-100/40 dark:bg-gray-800/20 opacity-60 pointer-events-none': isDayUnavailable(day)
            }"
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
            <span class="text-xl font-bold">{{
              selectedEvent?.propertyName
            }}</span>
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
            <span class="font-bold dark:text-white">{{
              selectedEvent?.agentName
            }}</span>
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
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{
              t('calendar.assignedVehicle')
            }}</span>
            <template v-if="selectedEvent?.vehicleId && selectedEventVehicle">
              <div class="text-right font-bold dark:text-white">
                <p>{{ selectedEventVehicle.licensePlate }}</p>
                <p class="text-xs font-medium text-secondary">
                  {{ selectedEventVehicle.brand }}
                  {{ selectedEventVehicle.model }}
                </p>
                <p class="text-xs font-medium text-secondary">
                  {{
                    t('calendar.vehicleCapacity', {
                      capacity: selectedEventVehicle.passengerCapacity,
                    })
                  }}
                </p>
              </div>
            </template>
            <span v-else class="font-medium text-secondary text-right">
              {{ t('calendar.noVehicleAssigned') }}
            </span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 w-full">
          <FwbButton
            @click="goToVisitDetail(selectedEvent!.id)"
            color="blue"
            class="flex-1"
          >
            {{ t('common.details') }}
          </FwbButton>
          <FwbButton
            @click="closeEventModal"
            color="alternative"
            class="flex-1"
          >
            {{ t('common.close') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>

    <!-- Custom Date/Time scheduling for conflicted visit requests -->
    <FwbModal v-if="showCustomScheduleModal" @close="showCustomScheduleModal = false" size="md">
      <template #header>
        <div class="flex items-center gap-2">
          <IconLucideCalendar class="w-5 h-5 text-blue-600" />
          <span>{{ t('calendar.proposeNewDateTime', 'Proponer Nueva Fecha de Visita') }}</span>
        </div>
      </template>
      <template #body>
        <div class="space-y-4 text-xs sm:text-sm">
          <p class="text-secondary mb-2">
            {{ t('calendar.conflictNotice', 'El cliente solicitó horarios que tienen conflictos. Por favor, asigne una nueva fecha y hora de visita.') }}
          </p>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {{ t('scheduleVisit.property', 'Propiedad') }}
            </label>
            <input type="text" :value="customScheduleForm.propertyName" readonly class="w-full bg-gray-100 dark:bg-gray-700 border rounded-lg p-2 dark:text-white pointer-events-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {{ t('calendar.client', 'Cliente') }}
            </label>
            <input type="text" :value="customScheduleForm.clientName" readonly class="w-full bg-gray-100 dark:bg-gray-700 border rounded-lg p-2 dark:text-white pointer-events-none" />
          </div>

          <div class="grid grid-cols-2 gap-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 text-xs">
            <div>
              <span class="font-semibold block text-yellow-800 dark:text-yellow-200">{{ t('calendar.clientPreferred', 'Solicitado Principal:') }}</span>
              <span>{{ customScheduleForm.preferredDateTime ? formatPendingDate(customScheduleForm.preferredDateTime) : '' }}</span>
            </div>
            <div v-if="customScheduleForm.alternativeDateTime">
              <span class="font-semibold block text-yellow-800 dark:text-yellow-200">{{ t('calendar.clientAlternative', 'Solicitado Alternativo:') }}</span>
              <span>{{ formatPendingDate(customScheduleForm.alternativeDateTime) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ t('scheduleVisit.startTime', 'Hora Inicio') }} <span class="text-red-500">*</span>
              </label>
              <input type="datetime-local" v-model="customScheduleForm.startTimeLocal" @change="onCustomTimeChange" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ t('scheduleVisit.endTime', 'Hora Fin') }} <span class="text-red-500">*</span>
              </label>
              <input type="datetime-local" v-model="customScheduleForm.endTimeLocal" @change="onCustomTimeChange" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {{ t('scheduleVisit.assignedVehicle', 'Vehículo Asignado') }}
            </label>
            <select v-model="customScheduleForm.vehicleId" :disabled="loadingCustomVehicles || !customScheduleForm.startTimeLocal || !customScheduleForm.endTimeLocal" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white disabled:opacity-50">
              <option value="">-- {{ t('scheduleVisit.selectVehiclePlaceholder', 'Opcional: Seleccione vehículo') }} --</option>
              <option v-for="vehicle in customAvailableVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.brand }} {{ vehicle.model }} - {{ vehicle.licensePlate }}
              </option>
            </select>
          </div>

          <div v-if="checkingCustomConflict" class="flex items-center gap-2 text-xs text-gray-500">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            {{ t('scheduleVisit.checkingAvailability', 'Comprobando disponibilidad...') }}
          </div>

          <div v-if="customConflictResult && customConflictResult.hasConflict" class="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-3 text-xs text-red-900 dark:text-red-100 flex items-center gap-2">
            <IconLucideAlertCircle class="h-4 w-4 text-red-600" />
            <span>{{ customConflictResult.message }}</span>
          </div>

          <div v-if="customConflictResult && !customConflictResult.hasConflict" class="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3 text-xs text-green-900 dark:text-green-100 flex items-center gap-2">
            <IconLucideCircleCheck class="h-4 w-4 text-green-600" />
            <span>{{ t('scheduleVisit.available', 'Disponible') }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end w-full">
          <FwbButton @click="showCustomScheduleModal = false" color="alternative" size="sm">
            {{ t('common.cancel', 'Cancelar') }}
          </FwbButton>
          <FwbButton @click="submitCustomScheduleAccept" :disabled="customScheduleSubmitting || !customScheduleForm.startTimeLocal || !customScheduleForm.endTimeLocal || (customConflictResult && customConflictResult.hasConflict)" color="blue" size="sm">
            {{ customScheduleSubmitting ? t('common.processing', 'Procesando...') : t('common.save', 'Guardar') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>

    <FwbAlert
      v-if="alertMessage"
      :type="alertType"
      class="fixed bottom-4 right-4 z-70 max-w-sm"
    >
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
import IconLucideCalendar from '~icons/lucide/calendar';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideCircleCheck from '~icons/lucide/circle-check';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  FwbCard,
  FwbButton,
  FwbModal,
  FwbInput,
  FwbAlert,
  FwbBadge,
} from 'flowbite-vue';
import { getCalendar, getAgentAvailability, getAvailableVehicles, checkConflict } from '@/services/calendarService';
import vehicleService from '@/services/vehicleService';
import { propertyService } from '@/modules/properties';
import { userService } from '@/services/userService';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import type {
  CalendarResponse,
  CalendarEventResponse,
  VisitRequestResponse,
  Vehicle,
  AgentAvailability,
} from '@/types/visitCalendar';
import {
  getPendingRequestsForAgent,
  acceptVisitRequest,
  rejectVisitRequest,
} from '@/services/visitRequestService';
import { useI18n } from 'vue-i18n';
import { getLocaleString } from '@/locales/i18n';
import { handleApiError } from '@/api/errorHandler';
import {
  getWeekRangeUtc,
  isSameLocalDay,
  formatShortTime,
  formatDisplayDateTime,
  localInputToUtcIso,
} from '@/utils/dateTime';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const myAgentId = computed(() => {
  const u = authStore.user as UserClaims | null;
  return (u?.sub || u?.userId || '') as string;
});

const loading = ref(false);
const error = ref('');
const calendarData = ref<CalendarResponse | null>(null);
const selectedEvent = ref<CalendarEventResponse | null>(null);
const selectedEventVehicle = ref<Vehicle | null>(null);
const showEventModal = ref(false);
const currentWeekStart = ref(new Date());
const pendingRequests = ref<VisitRequestResponse[]>([]);
const requestActionLoadingId = ref('');
const alertMessage = ref('');
const alertType = ref<'success' | 'danger' | 'warning' | 'info'>('danger');
let pendingRequestsIntervalId: ReturnType<typeof setInterval> | null = null;

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
const fleet = ref<Vehicle[] | null>(null);

const weekRange = computed(() => getWeekRangeUtc(currentWeekStart.value));

const weekDays = computed(() => {
  const start = new Date(weekRange.value.from);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
});

const weekLabel = computed(() => {
  const from = weekDays.value[0];
  const to = weekDays.value[6];
  const locale = getLocaleString();
  return `${from.getDate()} ${from.toLocaleString(locale, { month: 'short' })} — ${to.getDate()} ${to.toLocaleString(locale, { month: 'short', year: 'numeric' })}`;
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

function showAlert(
  msg: string,
  type: 'success' | 'danger' | 'warning' | 'info' = 'danger'
) {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    alertMessage.value = '';
  }, 4000);
}

const activeAgentAvailability = ref<AgentAvailability[]>([]);

async function loadCalendar() {
  loading.value = true;
  error.value = '';
  try {
    const { from, to } = weekRange.value;
    calendarData.value = await getCalendar(
      from,
      to,
      myAgentId.value,
      filterAgentId.value || undefined,
      filterPropertyId.value || undefined
    );

    const agentToQuery = filterAgentId.value || myAgentId.value;
    if (agentToQuery) {
      try {
        activeAgentAvailability.value = await getAgentAvailability(agentToQuery);
      } catch (e) {
        console.error('Error fetching agent availability:', e);
        activeAgentAvailability.value = [];
      }
    } else {
      activeAgentAvailability.value = [];
    }
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
    pendingRequests.value = requests.filter(
      (request) => request.status === 'PENDING'
    );
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
        String(p.title).toLowerCase().includes(s) ||
        String(p.address).toLowerCase().includes(s)
    )
    .slice(0, 10);
});

const filteredAgents = computed(() => {
  const s = searchTermAgent.value.toLowerCase();
  if (!s) return allAgents.value.slice(0, 10);
  return allAgents.value
    .filter((a) => String(a.fullName).toLowerCase().includes(s))
    .slice(0, 10);
});

const selectProperty = (p: {
  id: string;
  title: string;
  [key: string]: unknown;
}) => {
  filterPropertyId.value = p.id;
  searchTermProperty.value = p.title;
  showPropertyDropdown.value = false;
  loadCalendar();
};
const selectAgent = (a: {
  id: string;
  fullName: string;
  [key: string]: unknown;
}) => {
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
  calendarData.value?.events.filter((ev) =>
    isSameLocalDay(ev.startTime, day)
  ) || [];
const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
const dayName = (d: Date) =>
  d.toLocaleString(getLocaleString(), { weekday: 'short' });
const shortTime = (iso: string) => formatShortTime(iso, getLocaleString());
const teamEvents = computed(
  () =>
    (calendarData.value?.totalEvents ?? 0) - (calendarData.value?.myEvents ?? 0)
);
const uniqueProperties = computed(
  () => new Set(calendarData.value?.events.map((e) => e.propertyId)).size
);

const formatPendingDate = (iso: string) =>
  formatDisplayDateTime(iso, getLocaleString());

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
  currentWeekStart.value = new Date();
  loadCalendar();
}

const selectEvent = async (ev: CalendarEventResponse) => {
  selectedEvent.value = ev;
  selectedEventVehicle.value = null;
  showEventModal.value = true;
  await loadSelectedEventVehicle(ev.vehicleId);
};

const closeEventModal = () => {
  showEventModal.value = false;
  selectedEvent.value = null;
  selectedEventVehicle.value = null;
};

const getAvailabilityTextForDay = (day: Date) => {
  if (activeAgentAvailability.value.length === 0) return '';
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayNameStr = days[day.getDay()];

  // Formato YYYY-MM-DD local ajustado para comparar en la misma zona
  const dateStr = day.toLocaleDateString('en-CA'); // en-CA retorna YYYY-MM-DD
  
  const exceptions = activeAgentAvailability.value.filter(
    (a) => a.type === 'EXCEPTION' && a.specificDate === dateStr
  );
  
  if (exceptions.length > 0) {
    const unavailable = exceptions.find((a) => !a.isAvailable);
    if (unavailable) return t('availability.holidayShort', 'Feriado/No lab');
    return exceptions
      .filter((a) => a.isAvailable)
      .map((a) => `${a.startTime.substring(0, 5)}-${a.endTime.substring(0, 5)}`)
      .join(', ');
  }

  const recurring = activeAgentAvailability.value.filter(
    (a) => a.type === 'RECURRING' && a.dayOfWeek === dayNameStr
  );

  if (recurring.length === 0) return t('availability.offShort', 'No laborable');

  return recurring
    .filter((a) => a.isAvailable)
    .map((a) => `${a.startTime.substring(0, 5)}-${a.endTime.substring(0, 5)}`)
    .join(', ');
};

const isDayUnavailable = (day: Date) => {
  if (activeAgentAvailability.value.length === 0) return false;
  const text = getAvailabilityTextForDay(day);
  return text === t('availability.holidayShort', 'Feriado/No lab') || text === t('availability.offShort', 'No laborable');
};

const ensureFleetLoaded = async () => {
  if (fleet.value) {
    return fleet.value;
  }

  const vehicles = await vehicleService.getVehicles();
  fleet.value = vehicles;
  return vehicles;
};

const loadSelectedEventVehicle = async (vehicleId?: string) => {
  if (!vehicleId) {
    selectedEventVehicle.value = null;
    return;
  }

  try {
    const vehicles = await ensureFleetLoaded();
    selectedEventVehicle.value =
      vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
  } catch {
    selectedEventVehicle.value = null;
  }
};

function goToVisitDetail(visitId: string) {
  closeEventModal();
  router.push(`/visits/${visitId}`);
}

const showCustomScheduleModal = ref(false);
const customScheduleForm = ref({
  requestId: '',
  propertyId: '',
  propertyName: '',
  clientId: '',
  clientName: '',
  preferredDateTime: '',
  alternativeDateTime: '',
  startTimeLocal: '',
  endTimeLocal: '',
  vehicleId: '',
});
const customScheduleSubmitting = ref(false);
const customAvailableVehicles = ref<Vehicle[]>([]);
const loadingCustomVehicles = ref(false);
const customConflictResult = ref<any>(null);
const checkingCustomConflict = ref(false);

const onCustomTimeChange = async () => {
  customConflictResult.value = null;
  const start = customScheduleForm.value.startTimeLocal;
  const end = customScheduleForm.value.endTimeLocal;

  if (!start || !end) {
    customAvailableVehicles.value = [];
    customScheduleForm.value.vehicleId = '';
    return;
  }

  checkingCustomConflict.value = true;
  try {
    customConflictResult.value = await checkConflict(
      customScheduleForm.value.propertyId,
      localInputToUtcIso(start),
      localInputToUtcIso(end),
      myAgentId.value
    );
  } catch (err: any) {
    customConflictResult.value = {
      hasConflict: true,
      message: err.message || t('scheduleVisit.conflictError', 'Conflicto detectado en el horario.')
    };
  } finally {
    checkingCustomConflict.value = false;
  }

  loadingCustomVehicles.value = true;
  try {
    const vehicles = await getAvailableVehicles(localInputToUtcIso(start));
    customAvailableVehicles.value = vehicles;
    if (
      customScheduleForm.value.vehicleId &&
      !vehicles.some((vehicle) => vehicle.id === customScheduleForm.value.vehicleId)
    ) {
      customScheduleForm.value.vehicleId = '';
    }
  } catch {
    customAvailableVehicles.value = [];
    customScheduleForm.value.vehicleId = '';
  } finally {
    loadingCustomVehicles.value = false;
  }
};

const submitCustomScheduleAccept = async () => {
  const form = customScheduleForm.value;
  if (!form.requestId || !form.startTimeLocal || !form.endTimeLocal) return;

  customScheduleSubmitting.value = true;
  try {
    const response = await acceptVisitRequest(form.requestId, myAgentId.value, {
      customStartTime: localInputToUtcIso(form.startTimeLocal),
      customEndTime: localInputToUtcIso(form.endTimeLocal),
      vehicleId: form.vehicleId || undefined,
    });
    showCustomScheduleModal.value = false;
    const formattedDate = response && response.acceptedDateTime
      ? formatPendingDate(response.acceptedDateTime)
      : formatPendingDate(localInputToUtcIso(form.startTimeLocal));
    showAlert(`${t('calendar.requestAcceptedCustom', 'Solicitud aceptada con el nuevo horario:')} ${formattedDate}`, 'success');
    await Promise.all([loadPendingRequests(), loadCalendar()]);
  } catch (err: any) {
    showAlert(err.message || t('calendar.acceptError', 'Error al aceptar la solicitud.'), 'danger');
  } finally {
    customScheduleSubmitting.value = false;
  }
};

async function handleAcceptRequest(requestId: string) {
  if (!myAgentId.value) return;

  requestActionLoadingId.value = requestId;
  try {
    const response = await acceptVisitRequest(requestId, myAgentId.value);
    const req = pendingRequests.value.find((r) => r.id === requestId);
    let successMsg = t('calendar.requestAccepted', 'Solicitud de visita aceptada con éxito.');
    if (response && response.acceptedDateTime && req) {
      if (response.acceptedDateTime === req.preferredDateTime) {
        successMsg = `${t('calendar.requestAcceptedPreferred', 'Solicitud aceptada en el horario principal:')} ${formatPendingDate(req.preferredDateTime)}`;
      } else if (req.alternativeDateTime && response.acceptedDateTime === req.alternativeDateTime) {
        successMsg = `${t('calendar.requestAcceptedAlternative', 'Solicitud aceptada en el horario auxiliar:')} ${formatPendingDate(req.alternativeDateTime)}`;
      }
    }
    showAlert(successMsg, 'success');
    await Promise.all([loadPendingRequests(), loadCalendar()]);
  } catch (error: any) {
    if (error.status === 409 || error.message?.includes('conflict') || error.message?.includes('horario')) {
      const req = pendingRequests.value.find((r) => r.id === requestId);
      if (req) {
        customScheduleForm.value = {
          requestId: req.id,
          propertyId: req.propertyId,
          propertyName: req.propertyName,
          clientId: req.clientId,
          clientName: req.clientName,
          preferredDateTime: req.preferredDateTime,
          alternativeDateTime: req.alternativeDateTime || '',
          startTimeLocal: '',
          endTimeLocal: '',
          vehicleId: '',
        };
        customAvailableVehicles.value = [];
        customConflictResult.value = null;
        showCustomScheduleModal.value = true;
      } else {
        showAlert(t('calendar.loadError'), 'danger');
      }
    } else {
      showAlert(error.message || t('calendar.loadError'), 'danger');
    }
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

const closeClickOutside = (e: MouseEvent) => {
  if (!e.target || !(e.target instanceof HTMLElement)) return;
  if (!e.target.closest('#prop-filter-container'))
    showPropertyDropdown.value = false;
  if (!e.target.closest('#agent-filter-container'))
    showAgentDropdown.value = false;
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
