<template>
  <BaseModal
    v-model="show"
    :title="property?.title"
    size="2xl"
    @update:model-value="$emit('close')"
  >
    <template #header-icon>
      <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
        <IconLucideHome class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <!-- Left Column - Images -->
        <div class="space-y-4">
          <!-- Gallery with proper aspect ratio -->
          <div class="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
            <ImageGallery v-if="property?.id" :property-id="property.id" :can-manage="false" />
          </div>
        </div>

        <!-- Right Column - Details -->
        <div class="space-y-5">
          <!-- Status Badge -->
          <div class="flex items-center justify-between">
            <span
              :class="statusBadgeClass"
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {{ statusLabel }}
            </span>
            <span class="text-xs text-gray-400">{{ property?.type }}</span>
          </div>

          <!-- Price Card - Flowbite Card variant -->
          <div
            class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-secondary">
              {{ t('common.price') }}
            </p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ t('common.currency.symbol') }}{{ (property?.price || 0).toLocaleString() }}
            </p>
          </div>

          <!-- Details Grid with consistent spacing -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p class="text-xs font-medium text-secondary">
                {{ t('propertyDetails.location') }}
              </p>
              <p class="font-medium text-primary mt-0.5">
                {{ property?.address || '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-secondary">
                {{ t('propertyDetails.area') }}
              </p>
              <p class="font-medium text-primary mt-0.5">
                {{ property?.m2 || property?.area || '—' }} m²
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-secondary">
                {{ t('propertyDetails.bedrooms') }}
              </p>
              <p class="font-medium text-primary mt-0.5">
                {{ property?.rooms || property?.bedrooms || '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-secondary">
                {{ t('propertyDetails.operation') }}
              </p>
              <p class="font-medium text-primary mt-0.5">
                {{ formatOperationType(property?.operationType) }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div
            v-if="property?.description"
            class="border-t border-gray-100 dark:border-gray-700 pt-4"
          >
            <p class="text-xs font-medium text-secondary mb-1">
              {{ t('clientPropertyDetails.description') }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ property.description }}
            </p>
          </div>

          <!-- Agent Section -->
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p class="text-xs font-medium text-secondary mb-2">
              {{ t('clientPropertyDetails.responsibleAgent') }}
            </p>
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                {{ getAgentInitial() }}
              </div>
              <div>
                <p class="font-medium text-primary">
                  {{ property?.agentName || t('clientPropertyDetails.agentAssigned') }}
                </p>
                <p class="text-xs text-gray-500">{{ t('clientPropertyDetails.portalContact') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        @click="$emit('close')"
        class="inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
      >
        {{ t('common.close') }}
      </button>
      <button
        v-if="property?.status === 'DISPONIBLE'"
        @click="handleScheduleVisit"
        class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
      >
        <IconLucideCalendar class="w-4 h-4 mr-2" />
        {{ t('clientPropertyDetails.scheduleVisit') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { Property } from '@/types/property';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideHome from '~icons/lucide/home';
  import { useI18n } from 'vue-i18n';
  import ImageGallery from '@/components/properties/ImageGallery.vue';
  import BaseModal from '@/components/ui/BaseModal.vue';
  import { usePropertyStatus } from '@/composables/usePropertyStatus';

  const { t } = useI18n();

  const props = defineProps<{
    show: boolean;
    property: Property | null;
  }>();

  const emit = defineEmits<{
    close: [];
    'schedule-visit': [propertyId: string | undefined];
  }>();

  const statusHelpers = computed(() => usePropertyStatus(props.property?.status || 'DISPONIBLE'));
  const statusLabel = computed(() => statusHelpers.value.statusLabel.value);
  const statusBadgeClass = computed(() => statusHelpers.value.statusBadgeClass.value);

  const formatOperationType = (type: string | undefined) => {
    if (!type) return t('propertyOperations.VENTA');
    return t(`propertyOperations.${type}`);
  };

  const getAgentInitial = () => {
    const agentName = props.property?.agentName || t('common.advisor');
    return agentName.charAt(0).toUpperCase();
  };

  const handleScheduleVisit = () => {
    emit('schedule-visit', props.property?.id);
    emit('close');
  };
</script>
