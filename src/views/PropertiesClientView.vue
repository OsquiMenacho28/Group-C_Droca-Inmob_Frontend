<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header Section -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors"
    >
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('clientProperties.title') }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ t('clientProperties.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <!-- Filters Card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
      >
        <div class="p-6 space-y-6">
          <!-- Filter Fields Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="sm:col-span-2">
              <fwb-input
                v-model="filters.title"
                type="text"
                :label="t('clientProperties.searchTitle')"
                :placeholder="t('clientProperties.titlePlaceholder')"
                class="w-full"
              />
            </div>

            <div>
              <fwb-input
                v-model="filters.zone"
                type="text"
                :label="t('clientProperties.zoneLabel').replace(':', '')"
                :placeholder="t('clientProperties.zonePlaceholder', 'Ej: Equipetrol...')"
                class="w-full"
              />
            </div>

            <div>
              <fwb-select
                v-model="filters.type"
                :label="t('common.type')"
                :options="propertyTypeOptions"
                class="w-full"
              />
            </div>
          </div>

          <!-- Price Range and Actions -->
          <div
            class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('common.priceRange') }}:
              </label>
              <div class="flex items-center gap-2">
                <fwb-input
                  v-model.number="filters.minPrice"
                  type="number"
                  :placeholder="t('clientProperties.minPrice')"
                  class="w-32"
                />
                <span class="text-gray-400 dark:text-gray-500">—</span>
                <fwb-input
                  v-model.number="filters.maxPrice"
                  type="number"
                  :placeholder="t('clientProperties.maxPrice')"
                  class="w-32"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <fwb-button
                color="alternative"
                size="sm"
                @click="clearFilters"
                class="whitespace-nowrap"
              >
                {{ t('common.clear') }}
              </fwb-button>
              <fwb-button color="blue" size="sm" @click="applyFilters" class="whitespace-nowrap">
                {{ t('clientProperties.applyFilters') }}
              </fwb-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <fwb-spinner size="12" />
      </div>

      <!-- Error State -->
      <fwb-alert v-else-if="error" type="danger" class="text-center" closable @close="error = ''">
        {{ error }}
      </fwb-alert>

      <!-- Properties Grid -->
      <template v-else>
        <!-- Empty State -->
        <div
          v-if="properties.length === 0"
          class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 transition-colors"
        >
          <p class="text-gray-500 dark:text-gray-400">{{ t('clientProperties.emptyText') }}</p>
        </div>

        <!-- Properties Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="property in properties"
            :key="property.id"
            @click="openPropertyModal(property)"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden group"
          >
            <!-- Image Container -->
            <div class="relative h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <!-- Operation Type Badge -->
              <div class="absolute top-3 left-3 z-10">
                <span
                  :class="{
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200':
                      getOpTypeBadge(property.operationType) === 'indigo',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                      getOpTypeBadge(property.operationType) === 'green',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                      getOpTypeBadge(property.operationType) === 'yellow',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300':
                      getOpTypeBadge(property.operationType) === 'default',
                  }"
                  class="px-2 py-1 text-xs font-semibold rounded-lg"
                >
                  {{
                    property.operationType ? t('propertyOperations.' + property.operationType) : ''
                  }}
                </span>
              </div>

              <!-- Favorite Button -->
              <button
                @click.stop="toggleFavorite(property.id)"
                class="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                :aria-label="
                  isFavorite(property.id) ? t('common.removeFavorite') : t('common.addFavorite')
                "
              >
                <span v-if="isFavorite(property.id)" class="text-red-500 text-xl">❤️</span>
                <span v-else class="text-gray-400 dark:text-gray-500 text-xl hover:text-red-400">
                  🤍
                </span>
              </button>

              <!-- Property Image -->
              <img
                v-if="property.imageUrls?.length"
                :src="property.imageUrls[0]"
                :alt="property.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-gray-400 dark:text-gray-500">{{ t('common.noImage') }}</span>
              </div>
            </div>

            <!-- Property Content -->
            <div class="p-5 flex flex-col">
              <!-- Title -->
              <div class="flex justify-between items-start gap-2 mb-3">
                <h3
                  class="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 flex-1"
                >
                  {{ property.title }}
                </h3>
              </div>

              <!-- Location -->
              <div class="space-y-1 mb-4">
                <div class="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <span class="text-base mt-0.5">📍</span>
                  <span class="line-clamp-2 flex-1">{{ property.address }}</span>
                </div>
                <div
                  v-if="property.zone"
                  class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 pl-6"
                >
                  <span class="font-medium text-blue-600 dark:text-blue-400">
                    {{ t('clientProperties.zoneLabel') }}:
                  </span>
                  <span>{{ property.zone }}</span>
                </div>
              </div>

              <!-- Property Specs -->
              <div class="flex flex-wrap gap-2 mb-6">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  <span>🏠</span>
                  {{ t(`propertyTypes.${property.type}`, property.type) }}
                </span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  <span>📐</span>
                  {{ property.m2 }} {{ t('common.m2') }}
                </span>
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  <span>🛏️</span>
                  {{ property.rooms }} {{ t('propertyForm.rooms') }}
                </span>
              </div>

              <!-- Price and Action -->
              <div
                class="flex items-end justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide mb-0.5"
                  >
                    {{ t('common.price') }}
                  </p>
                  <p class="text-2xl font-bold text-blue-600 dark:text-blue-500">
                    ${{ property.price.toLocaleString() }}
                  </p>
                </div>
                <fwb-button
                  v-if="property.status === 'DISPONIBLE'"
                  @click.stop="openRequestModal(property)"
                  color="blue"
                  size="sm"
                  class="shadow-sm"
                >
                  {{ t('clientProperties.scheduleVisit') }}
                </fwb-button>
                <fwb-button
                  v-else
                  disabled
                  color="alternative"
                  size="sm"
                  class="opacity-50 cursor-not-allowed"
                >
                  {{ t('clientProperties.notAvailable') }}
                </fwb-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1" class="pt-4">
          <Pagination
            v-model:current-page="filters.page"
            v-model:page-size="filters.pageSize"
            :total-pages="totalPages"
            :total="totalElements"
            @change="loadProperties"
          />
        </div>
      </template>
    </main>

    <!-- Property Details Modal -->
    <property-details-modal
      v-if="selectedProperty"
      :show="!!selectedProperty"
      :property="selectedProperty"
      :is-client-view="true"
      @close="selectedProperty = null"
      @schedule-visit="handleScheduleVisit"
    />

    <!-- Visit Request Modal -->
    <fwb-modal v-if="showRequestModal" @close="closeRequestModal" size="xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
            <IconLucideCalendar class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold dark:text-white">
              {{ t('clientProperties.visitRequestTitle') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ requestTarget?.name }} · {{ requestTarget?.agentName }}
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <form @submit.prevent="submitVisitRequest" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fwb-input
              v-model="clientName"
              :label="t('clientProperties.form.name')"
              :placeholder="t('clientProperties.placeholder.name')"
              required
              :validation-status="errors.clientName ? 'error' : undefined"
              :validation-message="errors.clientName as string"
            />
            <fwb-input
              v-model="clientEmail"
              type="email"
              :label="t('clientProperties.form.email')"
              :placeholder="t('clientProperties.placeholder.email')"
              required
              :validation-status="errors.clientEmail ? 'error' : undefined"
              :validation-message="errors.clientEmail as string"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fwb-input
              v-model="clientPhone"
              :label="t('clientProperties.form.phone')"
              :placeholder="t('clientProperties.placeholder.phone')"
              :validation-status="errors.clientPhone ? 'error' : undefined"
              :validation-message="errors.clientPhone as string"
            />
            <fwb-input
              v-model="preferredDateTime"
              type="datetime-local"
              :label="t('clientProperties.form.preferredSchedule')"
              required
              :min="minDatetime"
              :validation-status="errors.preferredDateTime ? 'error' : undefined"
              :validation-message="errors.preferredDateTime as string"
            />
          </div>

          <fwb-input
            v-model="alternativeDateTime"
            type="datetime-local"
            :label="t('clientProperties.form.alternativeSchedule')"
            :min="preferredDateTime || minDatetime"
            :validation-status="errors.alternativeDateTime ? 'error' : undefined"
            :validation-message="errors.alternativeDateTime as string"
          />

          <fwb-textarea
            v-model="message"
            :label="t('clientProperties.form.message')"
            :placeholder="t('clientProperties.placeholder.message')"
            :rows="3"
            :validation-status="errors.message ? 'error' : undefined"
            :validation-message="errors.message as string"
          />

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p class="text-xs text-blue-700 dark:text-blue-300 italic">
              💡 {{ t('clientProperties.submitNote', { agent: requestTarget?.agentName }) }}
            </p>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <fwb-button color="alternative" @click="closeRequestModal">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button color="blue" @click="submitVisitRequest" :disabled="requestSubmitting">
            {{
              requestSubmitting
                ? t('clientProperties.sending')
                : t('clientProperties.submitRequest')
            }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <!-- Toast Notifications -->
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="showSuccessAlert" class="fixed bottom-6 right-6 z-50">
        <fwb-alert type="success" @close="showSuccessAlert = false" closable class="shadow-lg">
          {{ successMessage }}
        </fwb-alert>
      </div>
    </Transition>

    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="showErrorAlert" class="fixed bottom-6 right-6 z-50">
        <fwb-alert type="danger" @close="showErrorAlert = false" closable class="shadow-lg">
          {{ errorMessage }}
        </fwb-alert>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import {
    FwbButton,
    FwbModal,
    FwbInput,
    FwbTextarea,
    FwbAlert,
    FwbSpinner,
    FwbSelect,
  } from 'flowbite-vue';

  import IconLucideCalendar from '~icons/lucide/calendar';
  import { propertyService } from '@/modules/properties';
  import { favoriteService } from '@/services/favoriteService';
  import { createVisitRequest as apiCreateVisitRequest } from '@/services/visitRequestService';
  import { userService } from '@/services/userService';
  import { useAuthStore } from '@/modules/auth';
  import { handleApiError } from '@/api/errorHandler';
  import {
    visitRequestSchema,
    type VisitRequestFormValues,
  } from '@/modules/properties/schemas/visitSchema';
  import type { Property } from '@/types/property';
  import type { ClientVisitRequestDTO } from '@/types/visitCalendar';

  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import Pagination from '@/components/ui/Pagination.vue';

  // Types
  interface Filters {
    title: string;
    type: string;
    zone: string;
    operationType: string;
    status: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    page: number;
    pageSize: number;
  }

  interface RequestTarget {
    id: string;
    name: string;
    agentId: string;
    agentName: string;
  }

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  // State
  const properties = ref<Property[]>([]);
  const loading = ref<boolean>(true);
  const error = ref<string>('');
  const totalElements = ref<number>(0);
  const totalPages = ref<number>(0);
  const agentNames = ref<Record<string, string>>({});
  const favorites = ref<Set<string>>(new Set());
  const selectedProperty = ref<Property | null>(null);
  const showRequestModal = ref<boolean>(false);
  const requestTarget = ref<RequestTarget | null>(null);
  const requestSubmitting = ref<boolean>(false);
  const showSuccessAlert = ref<boolean>(false);
  const showErrorAlert = ref<boolean>(false);
  const successMessage = ref<string>('');
  const errorMessage = ref<string>('');
  let successTimer: ReturnType<typeof setTimeout> | null = null;

  // Filters
  const filters = ref<Filters>({
    title: (route.query.title as string) || '',
    type: (route.query.type as string) || '',
    zone: (route.query.zone as string) || '',
    operationType: (route.query.operationType as string) || '',
    status: (route.query.status as string) || '',
    minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
    maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
    sortBy: (route.query.sortBy as string) || 'price',
    sortOrder: (route.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
    page: route.query.page ? Number(route.query.page) : 0,
    pageSize: route.query.pageSize ? Number(route.query.pageSize) : 12,
  });

  // Computed
  const myClientId = computed<string>(
    () => (authStore.user?.sub || authStore.user?.userId || 'ANONYMOUS') as string
  );

  const myClientName = computed<string>(
    () => authStore.user?.fullName || authStore.user?.name || ''
  );

  const myClientEmail = computed<string>(() => authStore.user?.email || '');

  const minDatetime = computed<string>(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    return date.toISOString().slice(0, 16);
  });

  const propertyTypeOptions = computed(() => [
    { value: '', name: t('clientProperties.allTypeOption') },
    { value: 'CASA', name: t('propertyTypes.CASA') },
    { value: 'DEPARTAMENTO', name: t('propertyTypes.DEPARTAMENTO') },
    { value: 'LOCAL', name: t('propertyTypes.LOCAL') },
    { value: 'TERRENO', name: t('propertyTypes.TERRENO') },
    { value: 'OFICINA', name: t('propertyTypes.OFICINA') },
  ]);

  // Form setup
  const {
    defineField,
    handleSubmit: onRequestSubmit,
    resetForm,
    errors,
  } = useForm<VisitRequestFormValues>({
    validationSchema: toTypedSchema(visitRequestSchema),
  });

  const [clientName] = defineField('clientName');
  const [clientEmail] = defineField('clientEmail');
  const [clientPhone] = defineField('clientPhone');
  const [preferredDateTime] = defineField('preferredDateTime');
  const [alternativeDateTime] = defineField('alternativeDateTime');
  const [message] = defineField('message');

  // Methods
  const getOpTypeBadge = (type?: string): string => {
    if (type === 'VENTA') return 'indigo';
    if (type === 'ALQUILER') return 'green';
    if (type === 'ANTICRETICO') return 'yellow';
    return 'default';
  };

  const getAvailableProperties = async (params: Record<string, unknown>) => {
    const response = await propertyService.getProperties(params);
    const data = response.data || [];
    const meta = response.meta;

    return {
      data,
      totalElements: meta?.total || data.length || 0,
      totalPages: Math.ceil(
        (meta?.total || data.length || 0) / (meta?.limit || (params.pageSize as number) || 12)
      ),
    };
  };

  const loadAgentNames = async (props: Property[]): Promise<void> => {
    const agentIds = [
      ...new Set(props.map((property) => property.assignedAgentId).filter(Boolean)),
    ];

    for (const agentId of agentIds) {
      if (agentId && !agentNames.value[agentId]) {
        try {
          const user = await userService.getUserById(agentId);
          agentNames.value[agentId] =
            user.data.fullName || user.data.firstName || t('common.advisor');
        } catch {
          agentNames.value[agentId] = t('common.advisor');
        }
      }
    }
  };

  const loadProperties = async (): Promise<void> => {
    loading.value = true;
    error.value = '';

    try {
      const result = await getAvailableProperties({
        title: filters.value.title || undefined,
        type: filters.value.type || undefined,
        zone: filters.value.zone || undefined,
        operationType: filters.value.operationType || undefined,
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        status: filters.value.status || undefined,
      });

      properties.value = result.data;
      totalElements.value = result.totalElements;
      totalPages.value = result.totalPages;

      await loadAgentNames(properties.value);

      // Update URL query params without triggering navigation
      const query: Record<string, string> = {};
      if (filters.value.status) query.status = filters.value.status;
      if (filters.value.title) query.title = filters.value.title;
      if (filters.value.type) query.type = filters.value.type;
      if (filters.value.zone) query.zone = filters.value.zone;
      if (filters.value.operationType) query.operationType = filters.value.operationType;
      if (filters.value.minPrice) query.minPrice = String(filters.value.minPrice);
      if (filters.value.maxPrice) query.maxPrice = String(filters.value.maxPrice);
      query.sortBy = filters.value.sortBy;
      query.sortOrder = filters.value.sortOrder;
      query.page = String(filters.value.page);
      query.pageSize = String(filters.value.pageSize);

      router.replace({ query });
    } catch (err: unknown) {
      error.value = handleApiError(err).message;
    } finally {
      loading.value = false;
    }
  };

  const applyFilters = (): void => {
    filters.value.page = 0;
    loadProperties();
  };

  const clearFilters = (): void => {
    filters.value = {
      title: '',
      type: '',
      zone: '',
      operationType: '',
      status: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'price',
      sortOrder: 'ASC',
      page: 0,
      pageSize: 12,
    };
    loadProperties();
  };

  const loadFavorites = async (): Promise<void> => {
    try {
      const favoriteIds = await favoriteService.getFavorites();
      favorites.value = new Set(favoriteIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const isFavorite = (propertyId: string): boolean => favorites.value.has(propertyId);

  const toggleFavorite = async (propertyId: string): Promise<void> => {
    const wasFavorite = favorites.value.has(propertyId);

    try {
      if (wasFavorite) {
        favorites.value.delete(propertyId);
        await favoriteService.removeFavorite(propertyId);
        successMessage.value = t('favorites.removedSuccess');
        showSuccessAlert.value = true;
        if (successTimer) clearTimeout(successTimer);
        successTimer = setTimeout(() => {
          showSuccessAlert.value = false;
        }, 2000);
      } else {
        favorites.value.add(propertyId);
        await favoriteService.addFavorite(propertyId);
        successMessage.value = t('favorites.addedSuccess');
        showSuccessAlert.value = true;
        if (successTimer) clearTimeout(successTimer);
        successTimer = setTimeout(() => {
          showSuccessAlert.value = false;
        }, 2000);
      }
    } catch (err: unknown) {
      // Revert on error
      if (wasFavorite) {
        favorites.value.add(propertyId);
      } else {
        favorites.value.delete(propertyId);
      }
      errorMessage.value = handleApiError(err).message;
      showErrorAlert.value = true;
      setTimeout(() => {
        showErrorAlert.value = false;
      }, 3000);
    }
  };

  const openPropertyModal = (property: Property): void => {
    selectedProperty.value = property;
  };

  const handleScheduleVisit = (): void => {
    if (selectedProperty.value) {
      openRequestModal(selectedProperty.value);
    }
  };

  const openRequestModal = (property: Property): void => {
    const agentId = property.assignedAgentId || '';
    requestTarget.value = {
      id: property.id,
      name: property.title,
      agentId,
      agentName: agentNames.value[agentId] || property.agentName || t('common.advisor'),
    };
    showRequestModal.value = true;
    selectedProperty.value = null;

    resetForm({
      values: {
        propertyId: property.id,
        clientName: myClientName.value,
        clientEmail: myClientEmail.value,
        clientPhone: '',
        preferredDateTime: '',
        alternativeDateTime: '',
        message: '',
      },
    });
  };

  const closeRequestModal = (): void => {
    showRequestModal.value = false;
    requestTarget.value = null;
  };

  const submitVisitRequest = onRequestSubmit(
    async (values: VisitRequestFormValues): Promise<void> => {
      if (!requestTarget.value) return;

      requestSubmitting.value = true;

      try {
        const dto: ClientVisitRequestDTO = {
          propertyId: requestTarget.value.id,
          propertyName: requestTarget.value.name,
          agentId: requestTarget.value.agentId,
          agentName: requestTarget.value.agentName,
          clientId: myClientId.value,
          clientName: values.clientName,
          clientEmail: values.clientEmail,
          clientPhone: values.clientPhone || undefined,
          preferredDateTime: new Date(values.preferredDateTime).toISOString(),
          alternativeDateTime: values.alternativeDateTime
            ? new Date(values.alternativeDateTime).toISOString()
            : undefined,
          message: values.message || undefined,
        };

        await apiCreateVisitRequest(dto);
        closeRequestModal();

        successMessage.value = t('scheduleVisit.successMessage');
        showSuccessAlert.value = true;

        if (successTimer) clearTimeout(successTimer);
        successTimer = setTimeout(() => {
          showSuccessAlert.value = false;
        }, 4000);
      } catch (err: unknown) {
        errorMessage.value = handleApiError(err).message;
        showErrorAlert.value = true;
        setTimeout(() => {
          showErrorAlert.value = false;
        }, 4000);
      } finally {
        requestSubmitting.value = false;
      }
    }
  );

  // Watchers
  watch(
    () => filters.value.pageSize,
    () => {
      filters.value.page = 0;
      loadProperties();
    }
  );

  // Lifecycle
  onMounted(() => {
    loadProperties();
    loadFavorites();
  });

  onUnmounted(() => {
    if (successTimer) clearTimeout(successTimer);
  });
</script>
