<template>
  <div
    class="relative app-card h-full flex flex-col overflow-hidden"
    :class="{
      'bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600': isMinimalInfo,
    }"
  >
    <!-- Card Status Tag (Prominent for terminal states) -->
    <div
      v-if="isMinimalInfo"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
    >
      <span
        class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 animate-pulse"
        :class="{
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800':
            isSold,
          'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600':
            isDeleted,
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800':
            isWithdrawn,
        }"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Quick Action Buttons (Top Right) -->
    <div class="absolute top-3 right-3 z-40 flex gap-2">
      <slot name="actions-top" :property="property" :status-helpers="statusHelpers"></slot>
    </div>

    <!-- Details/History Button (Top Left) -->
    <button
      v-if="showHistoryButton"
      @click="$emit('view-details', property)"
      class="absolute top-3 left-3 z-40 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110 active:scale-95"
      :title="t('adminProperties.viewHistory')"
    >
      <IconLucideClipboardList class="w-5 h-5" />
    </button>

    <!-- Main Image Carousel / Container -->
    <div
      class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden group/carousel"
      :class="{ 'grayscale opacity-60': isMinimalInfo }"
    >
      <template v-if="property.imageUrls?.length">
        <img
          :src="property.imageUrls[activeImageIndex]"
          class="h-full w-full object-cover transition-transform duration-500"
          :class="{ 'group-hover/carousel:scale-105': !isMinimalInfo }"
          @error="handleImageError"
        />
        <!-- Navigation Buttons -->
        <button
          v-if="property.imageUrls.length > 1 && !isMinimalInfo"
          @click.stop="prevImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity backdrop-blur-sm z-20"
        >
          <IconLucideChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-if="property.imageUrls.length > 1 && !isMinimalInfo"
          @click.stop="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity backdrop-blur-sm z-20"
        >
          <IconLucideChevronRight class="w-4 h-4" />
        </button>

        <!-- Dots -->
        <div
          v-if="property.imageUrls.length > 1 && !isMinimalInfo"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20"
        >
          <div
            v-for="(_, dotIdx) in property.imageUrls"
            :key="dotIdx"
            class="w-1.5 h-1.5 rounded-full transition-colors"
            :class="activeImageIndex === dotIdx ? 'bg-white' : 'bg-white/50'"
          ></div>
        </div>
      </template>
      <div v-else class="flex flex-col items-center gap-2">
        <IconLucideImage class="w-12 h-12 text-gray-300" />
        <span class="text-xs uppercase font-bold tracking-tighter">
          {{ t('adminProperties.noImages') }}
        </span>
      </div>

      <!-- Operation Type Badge -->
      <div v-if="!isMinimalInfo" class="absolute top-3 left-14 z-10">
        <fwb-badge :type="getOpTypeBadge(property.operationType)">
          {{
            property.operationType
              ? t('propertyOperations.' + property.operationType)
              : t('common.empty')
          }}
        </fwb-badge>
      </div>

      <!-- Floating Status Badge (Only for active states) -->
      <div v-if="!isMinimalInfo" class="absolute bottom-3 right-3">
        <span
          :class="statusBadgeClass"
          class="text-[10px] font-black px-2.5 py-1 rounded shadow-sm"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <!-- Card Content -->
    <div class="flex-1 flex flex-col p-5 sm:p-6" :class="{ 'grayscale-[0.5]': isMinimalInfo }">
      <div class="flex-1 flex flex-col gap-3">
        <!-- Title with proper typography scale -->
        <div class="space-y-1">
          <p class="text-[0.625rem] font-semibold uppercase tracking-wide text-gray-400">
            {{ t('adminProperties.owner') }}:
            <span class="text-gray-600 dark:text-gray-300 ml-1">
              {{ ownerName || t('adminProperties.notAssigned') }}
            </span>
          </p>
          <h3
            class="text-lg sm:text-xl font-bold text-primary line-clamp-1"
            :class="{ 'text-gray-500': isMinimalInfo }"
          >
            {{ property.title }}
          </h3>
          <div class="flex items-start gap-1.5 text-xs text-secondary">
            <IconLucideMapPin
              class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500"
              :class="{ 'text-gray-400': isMinimalInfo }"
            />
            <span class="line-clamp-1">{{ property.address }}</span>
          </div>
        </div>

        <!-- Stats Grid (Hide or minimize for sold/deleted) -->
        <div
          v-if="!isMinimalInfo"
          class="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-gray-700"
        >
          <div class="space-y-0.5">
            <p class="text-[0.625rem] font-semibold uppercase tracking-wide text-gray-400">
              {{ t('common.price') }}
            </p>
            <p class="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${{ (property.price || 0).toLocaleString() }}
            </p>
          </div>
          <div class="text-right space-y-0.5">
            <p class="text-[0.625rem] font-semibold uppercase tracking-wide text-gray-400">
              {{ t('adminProperties.advisor') }}
            </p>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
              {{ agentName || t('common.unassigned') }}
            </p>
          </div>
        </div>

        <!-- Simple Info for Sold/Deleted -->
        <div
          v-else
          class="flex justify-between items-center py-2 text-xs border-t border-gray-200 dark:border-gray-700 mt-auto"
        >
          <span class="text-gray-400 uppercase font-bold">{{ t('adminProperties.price') }}</span>
          <span class="font-black text-gray-600 dark:text-gray-400">
            ${{ (property.price || 0).toLocaleString() }}
          </span>
        </div>

        <div class="mt-auto space-y-3">
          <!-- Document Upload (Hidden for terminal states) -->
          <slot v-if="!isMinimalInfo" name="documents" :property="property"></slot>

          <!-- Action Buttons Section with proper spacing -->
          <div class="flex flex-wrap gap-2 pt-2">
            <slot name="actions-bottom" :property="property" :status-helpers="statusHelpers"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbBadge } from 'flowbite-vue';

  import { usePropertyStatus } from '@/composables/usePropertyStatus';
  import type { Property } from '@/types/property';

  // Icons
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideClipboardList from '~icons/lucide/clipboard-list';
  import IconLucideMapPin from '~icons/lucide/map-pin';
  import IconLucideChevronLeft from '~icons/lucide/chevron-left';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';

  const props = defineProps<{
    property: Property;
    ownerName?: string;
    agentName?: string;
    showHistoryButton?: boolean;
  }>();

  defineEmits(['view-details', 'open-zoom']);

  const { t } = useI18n();
  const statusHelpers = usePropertyStatus(props.property.status);
  const { statusLabel, statusBadgeClass, isMinimalInfo, isSold, isDeleted, isWithdrawn } =
    statusHelpers;

  const activeImageIndex = ref(0);

  const nextImage = () => {
    if (!props.property.imageUrls) return;
    activeImageIndex.value = (activeImageIndex.value + 1) % props.property.imageUrls.length;
  };

  const prevImage = () => {
    if (!props.property.imageUrls) return;
    activeImageIndex.value =
      (activeImageIndex.value - 1 + props.property.imageUrls.length) %
      props.property.imageUrls.length;
  };

  const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).style.display = 'none';
  };

  const getOpTypeBadge = (type?: string) => {
    switch (type) {
      case 'VENTA':
        return 'indigo';
      case 'ALQUILER':
        return 'green';
      case 'ANTICRETICO':
        return 'yellow';
      default:
        return 'dark';
    }
  };
</script>
