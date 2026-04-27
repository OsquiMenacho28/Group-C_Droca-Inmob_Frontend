<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div class="max-w-2xl mx-auto flex items-center gap-4">
        <router-link
          to="/calendar"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <IconLucideArrowLeft class="h-5 w-5" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('scheduleVisit.title') }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('scheduleVisit.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors"
      >
        <form @submit.prevent="handleSubmit" novalidate class="space-y-5">
          <div class="relative" id="property-select-container">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('scheduleVisit.property') }}
              <span class="text-red-500">*</span>
            </label>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IconLucideLoader v-if="loadingList" class="animate-spin h-4 w-4 text-blue-500" />
                <IconLucideSearch v-else class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                v-model="searchTerm"
                @focus="showDropdown = true"
                :placeholder="
                  loadingList
                    ? t('scheduleVisit.loadingProperties')
                    : t('scheduleVisit.searchProperty')
                "
                :disabled="loadingList"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors dark:scheme-dark"
                :class="{
                  'border-red-400 dark:border-red-500': fieldErrors.propertyId,
                }"
                autocomplete="off"
              />
              <button
                type="button"
                @click="showDropdown = !showDropdown"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <IconLucideChevronDown class="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div
              v-if="showDropdown"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-72 overflow-y-auto overflow-x-hidden"
            >
              <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                <li
                  v-if="filteredProperties.length === 0"
                  class="px-4 py-3 text-gray-500 italic text-center"
                >
                  {{ t('scheduleVisit.noPropertiesFound') }}
                </li>
                <li
                  v-for="p in filteredProperties"
                  :key="p.id"
                  @click="handleSelect(p.id)"
                  class="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex justify-between items-center border-b last:border-b-0 border-gray-100 dark:border-gray-700 transition-colors"
                >
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 dark:text-white truncate">
                      {{ p.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ p.address }}
                    </p>
                  </div>
                  <div class="ml-3 flex flex-col items-end gap-1">
                    <span
                      class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-medium uppercase whitespace-nowrap"
                    >
                      {{ t('propertyTypes.' + p.type) }}
                    </span>
                    <span
                      :class="p.status === 'DISPONIBLE' ? 'text-green-500' : 'text-red-400'"
                      class="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {{ t('status.' + p.status.toLowerCase()) }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <p v-if="fieldErrors.propertyId" class="text-xs text-red-500 mt-1">
              {{ fieldErrors.propertyId }}
            </p>
          </div>

          <Transition name="slide-fade">
            <div
              v-if="propertyInfo"
              class="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-4 space-y-2"
            >
              <div class="flex justify-between items-start">
                <h3 class="font-bold text-blue-900 dark:text-blue-200">
                  {{ propertyInfo.title }}
                </h3>
                <span
                  class="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300"
                >
                  {{ t('status.' + propertyInfo.status.toLowerCase()) }}
                </span>
              </div>
              <p class="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <IconLucideMapPin class="w-3 h-3" />
                {{ propertyInfo.address }}
              </p>
              <div class="flex gap-4 pt-1 border-t border-blue-100 dark:border-blue-800/30 mt-2">
                <div
                  class="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-tighter"
                >
                  {{ t('scheduleVisit.areaLabel') }}
                  <span class="font-bold">{{ propertyInfo.m2 }}</span>
                </div>
                <div
                  class="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-tighter"
                >
                  {{ t('scheduleVisit.roomsLabel') }}
                  <span class="font-bold">{{ propertyInfo.rooms }}</span>
                </div>
                <div
                  class="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-tighter"
                >
                  {{ t('scheduleVisit.priceLabel') }}
                  <span class="font-bold">${{ propertyInfo.price.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </Transition>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('scheduleVisit.startTime') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="startTimeLocal"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dark:scheme-dark"
                :min="new Date().toISOString().slice(0, 16)"
                :class="{
                  'border-red-400 dark:border-red-500': fieldErrors.startTime,
                }"
              />
              <p v-if="fieldErrors.startTime" class="text-xs text-red-500 mt-1">
                {{ fieldErrors.startTime }}
              </p>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('scheduleVisit.endTime') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="endTimeLocal"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dark:scheme-dark"
                :min="startTimeLocal || new Date().toISOString().slice(0, 16)"
                :class="{
                  'border-red-400 dark:border-red-500': fieldErrors.endTime,
                }"
              />
              <p v-if="fieldErrors.endTime" class="text-xs text-red-500 mt-1">
                {{ fieldErrors.endTime }}
              </p>
            </div>
          </div>

          <ConflictAlert
            v-if="conflictResult"
            :conflict="conflictResult"
            :show-use-suggestion="true"
            @use-suggestion="applySuggestion"
          />

          <div v-if="checkingConflict" class="flex items-center gap-2 text-sm text-gray-500">
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
            ></div>
            {{ t('scheduleVisit.checkingAvailability') }}
          </div>

          <div
            v-if="conflictResult && !conflictResult.hasConflict"
            class="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
          >
            <IconLucideCircleCheck class="h-4 w-4" />
            {{ t('scheduleVisit.available') }}
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('scheduleVisit.notes') }}
            </label>
            <textarea
              v-model="notes"
              rows="2"
              :placeholder="t('scheduleVisit.notesPlaceholder')"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <router-link
              to="/calendar"
              class="flex-1 text-center py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ t('common.cancel') }}
            </router-link>
            <button
              type="submit"
              :disabled="submitting || (conflictResult?.hasConflict ?? false) || !propertyId"
              class="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              {{ submitting ? t('common.saving') : t('scheduleVisit.submit') }}
            </button>
          </div>
        </form>
      </div>

      <div
        v-if="dayAgenda.length > 0"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors shadow-sm"
      >
        <h2
          class="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"
        >
          <IconLucideCalendar class="w-4 h-4" />
          {{ t('scheduleVisit.dayAgenda') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="ev in dayAgenda"
            :key="ev.id"
            class="group flex items-center gap-3 p-3 rounded-xl border border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            :class="{
              'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30':
                ev.ownEvent,
            }"
          >
            <div class="text-center min-w-[50px]">
              <p class="text-xs font-bold text-gray-900 dark:text-white">
                {{ shortTime(ev.startTime) }}
              </p>
              <p class="text-[9px] text-gray-400 uppercase">{{ t('scheduleVisit.start') }}</p>
            </div>
            <div class="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {{ ev.propertyName }}
              </p>
              <p class="text-[10px] text-gray-500 truncate">
                {{ ev.ownEvent ? t('scheduleVisit.youAreResponsible') : ev.agentName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FwbModal v-if="showSuccessModal" @close="showSuccessModal = false">
      <template #header>
        <div class="flex items-center gap-2">
          <IconLucideCircleCheck class="w-5 h-5 text-green-600" />
          <span>{{ t('common.success') }}</span>
        </div>
      </template>
      <template #body>
        <FwbAlert type="success" :dismissible="false">
          {{ successMessage }}
        </FwbAlert>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <FwbButton @click="showSuccessModal = false">{{ t('common.accept') }}</FwbButton>
        </div>
      </template>
    </FwbModal>

    <FwbModal v-if="showErrorModal" @close="showErrorModal = false">
      <template #header>
        <div class="flex items-center gap-2">
          <IconLucideAlertCircle class="w-5 h-5 text-red-600" />
          <span>{{ t('common.error') }}</span>
        </div>
      </template>
      <template #body>
        <FwbAlert type="danger" :dismissible="false">
          {{ errorMessage }}
        </FwbAlert>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <FwbButton @click="showErrorModal = false" color="alternative">
            {{ t('common.accept') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { visitSchema } from '@/modules/properties/schemas/visitSchema';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { propertyService } from '@/modules/properties';
  import { checkConflict, createVisit, getDayAgenda } from '@/services/calendarService';
  import ConflictAlert from '@/components/visits/ConflictAlert.vue';
  import type {
    ConflictResponse,
    CalendarEventResponse,
    Property as VisitProperty,
  } from '@/types/visitCalendar';
  import type { Property } from '@/types/property';
  import type { VisitFormValues } from '@/modules/properties/schemas/visitSchema';
  import { FwbAlert, FwbModal, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideChevronDown from '~icons/lucide/chevron-down';
  import IconLucideMapPin from '~icons/lucide/map-pin';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  const { t } = useI18n();

  const showSuccessModal = ref(false);
  const showErrorModal = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');

  let successTimer: ReturnType<typeof setTimeout> | null = null;

  const authStore = useAuthStore();

  const myAgentId = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (u?.sub || u?.userId || '') as string;
  });
  const myAgentName = computed(() => {
    const u = authStore.user as UserClaims | null;
    if (u?.fullName) return u.fullName;
    if (u?.name) return u.name;
    return (u?.email as string)?.split('@')[0] || t('scheduleVisit.agentFallback');
  });

  const {
    defineField,
    handleSubmit: onSubmit,
    errors: fieldErrors,
    setValues,
  } = useForm({
    validationSchema: toTypedSchema(visitSchema),
  });

  const [propertyId] = defineField('propertyId');
  const [startTime] = defineField('startTime');
  const [endTime] = defineField('endTime');
  const [notes] = defineField('notes');

  const loadingList = ref(false);
  const allProperties = ref<VisitProperty[]>([]);
  const searchTerm = ref('');
  const showDropdown = ref(false);
  const propertyInfo = ref<Property | null>(null);

  const conflictResult = ref<ConflictResponse | null>(null);
  const checkingConflict = ref(false);
  const submitting = ref(false);
  const dayAgenda = ref<CalendarEventResponse[]>([]);

  const startTimeLocal = ref('');
  const endTimeLocal = ref('');

  watch(startTimeLocal, (val) => {
    if (val) {
      startTime.value = new Date(val).toISOString();
      onTimeChange();
    } else {
      startTime.value = '';
    }
  });

  watch(endTimeLocal, (val) => {
    if (val) {
      endTime.value = new Date(val).toISOString();
      onTimeChange();
    } else {
      endTime.value = '';
    }
  });

  const loadInitialData = async () => {
    loadingList.value = true;
    try {
      const data = await propertyService.getProperties();
      allProperties.value = data.filter(
        (p: VisitProperty) => p.status === 'DISPONIBLE'
      ) as VisitProperty[];
    } catch {
      console.error(t('scheduleVisit.propertyLoadError'));
    } finally {
      loadingList.value = false;
    }
  };

  const filteredProperties = computed(() => {
    if (!searchTerm.value) return allProperties.value;
    const s = searchTerm.value.toLowerCase();
    return allProperties.value
      .filter(
        (p) =>
          String(p.title).toLowerCase().includes(s) || String(p.address).toLowerCase().includes(s)
      )
      .slice(0, 20);
  });

  const handleSelect = async (id: string) => {
    showDropdown.value = false;
    searchTerm.value = t('scheduleVisit.loadingDetail');

    try {
      const detail = await propertyService.getPropertyById(id);

      propertyId.value = detail.id;
      propertyInfo.value = detail;
      searchTerm.value = detail.title;

      if (startTimeLocal.value) onTimeChange();
    } catch {
      alert(t('scheduleVisit.propertyDetailError'));
      searchTerm.value = '';
    }
  };

  let conflictTimer: ReturnType<typeof setTimeout> | null = null;
  const onTimeChange = () => {
    conflictResult.value = null;
    const pid = propertyId.value;
    const start = startTimeLocal.value;
    const end = endTimeLocal.value;
    if (!pid || !start || !end) return;

    if (conflictTimer) clearTimeout(conflictTimer);
    conflictTimer = setTimeout(async () => {
      checkingConflict.value = true;
      try {
        conflictResult.value = await checkConflict(
          pid,
          new Date(start).toISOString(),
          new Date(end).toISOString()
        );
      } finally {
        checkingConflict.value = false;
      }
    }, 500);
  };

  const handleSubmit = onSubmit(async (values: VisitFormValues) => {
    if (!myAgentId.value) {
      errorMessage.value = t('scheduleVisit.agentIdError');
      showErrorModal.value = true;
      return;
    }

    submitting.value = true;
    try {
      await createVisit(
        {
          propertyId: values.propertyId,
          propertyName: propertyInfo.value?.title || '',
          propertyAddress: propertyInfo.value?.address || '',
          agentId: myAgentId.value as string,
          agentName: myAgentName.value as string,
          startTime: values.startTime,
          endTime: values.endTime,
          notes: values.notes,
        },
        myAgentId.value as string
      );

      dayAgenda.value = await getDayAgenda(myAgentId.value as string, values.startTime);

      setValues({
        propertyId: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      startTimeLocal.value = '';
      endTimeLocal.value = '';
      propertyInfo.value = null;
      searchTerm.value = '';
      conflictResult.value = null;

      successMessage.value = t('scheduleVisit.successMessage');
      showSuccessModal.value = true;

      if (successTimer) clearTimeout(successTimer);
      successTimer = setTimeout(() => {
        showSuccessModal.value = false;
      }, 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      errorMessage.value = err.response?.data?.message || t('scheduleVisit.errorMessage');
      showErrorModal.value = true;
    } finally {
      submitting.value = false;
    }
  });

  const applySuggestion = (start?: string, end?: string) => {
    if (start) {
      startTimeLocal.value = new Date(start).toISOString().slice(0, 16);
      startTime.value = start;
    }
    if (end) {
      endTimeLocal.value = new Date(end).toISOString().slice(0, 16);
      endTime.value = end;
    }
    onTimeChange();
  };

  const shortTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(getLocaleString(), {
      hour: '2-digit',
      minute: '2-digit',
    });

  const closeClickOutside = (e: Event) => {
    if (!(e.target instanceof HTMLElement) || !e.target.closest('#property-select-container'))
      showDropdown.value = false;
  };

  onMounted(() => {
    loadInitialData();
    window.addEventListener('click', closeClickOutside);
  });

  onUnmounted(() => {
    window.removeEventListener('click', closeClickOutside);
  });
</script>

<style scoped>
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }
  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
  }
</style>
