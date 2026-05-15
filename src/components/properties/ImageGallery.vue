<template>
  <div class="space-y-4">
    <!-- Main Carousel Area -->
    <div
      v-if="images.length > 0"
      class="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm select-none"
    >
      <!-- Main Image -->
      <img
        :src="currentImageUrl"
        class="w-full h-64 md:h-96 object-cover cursor-zoom-in transition-transform duration-300"
        alt="Property image"
        @click="openZoom"
      />

      <!-- Navigation Arrows -->
      <button
        v-if="images.length > 1"
        @click.stop="prevImage"
        class="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <IconLucideChevronLeft class="w-6 h-6" />
      </button>
      <button
        v-if="images.length > 1"
        @click.stop="nextImage"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <IconLucideChevronRight class="w-6 h-6" />
      </button>

      <!-- Badge overlay -->
      <div
        v-if="reorderMode"
        class="absolute inset-0 bg-blue-500/10 border-4 border-blue-500 pointer-events-none rounded-xl"
      ></div>
    </div>

    <div
      v-else
      class="h-64 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
    >
      <div class="text-center">
        <IconLucideImage class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-secondary text-sm">
          {{ t('propertyDetails.noPhotos') }}
        </p>
      </div>
    </div>

    <!-- Thumbnails & Reorder Controls -->
    <div v-if="images.length > 0">
      <div class="flex justify-between items-end mb-2">
        <h5 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {{ t('propertyForm.images') }} ({{ images.length }})
        </h5>

        <div v-if="canManage && images.length > 1" class="flex gap-2">
          <button
            v-if="!reorderMode"
            @click="toggleReorderMode"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <IconLucideArrowUpDown class="w-3 h-3" />
            {{ t('imageUpload.reorder') }}
          </button>
          <template v-else>
            <button
              @click="cancelReorder"
              class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              {{ t('imageUpload.cancel') }}
            </button>
            <button
              @click="saveReorder"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded"
            >
              {{ t('imageUpload.saveOrder') }}
            </button>
          </template>
        </div>
      </div>

      <!-- Thumbnail Strip -->
      <div
        class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        <div
          v-for="(img, idx) in displayList"
          :key="img.id"
          class="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all"
          :class="[
            idx === currentIndex && !reorderMode
              ? 'border-blue-500 shadow-md'
              : 'border-transparent',
            reorderMode
              ? 'cursor-move ring-1 ring-gray-300 dark:ring-gray-600 hover:ring-blue-500'
              : 'cursor-pointer hover:opacity-80',
          ]"
          :draggable="reorderMode"
          @dragstart="reorderMode ? handleDragStart($event, idx) : null"
          @dragover.prevent
          @drop="reorderMode ? handleDrop($event, idx) : null"
          @click="!reorderMode ? selectImage(idx) : null"
        >
          <img
            :src="img.temporaryDownloadUrl || img.publicUrl"
            class="w-full h-full object-cover"
          />
          <div
            v-if="reorderMode"
            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <IconLucideMove class="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Zoom Overlay -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isZoomed"
          class="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 flex flex-col items-center justify-center select-none overflow-hidden transition-colors"
          @wheel.prevent="handleZoomWheel"
        >
          <!-- Controls Overlay -->
          <div class="absolute top-4 right-4 z-20 flex items-center gap-3">
            <span
              class="bg-white/80 text-gray-800 border-gray-200 dark:bg-gray-800/80 dark:text-gray-300 dark:border-gray-600 text-xs font-medium inline-flex items-center px-2.5 py-1.5 rounded-lg border shadow-sm backdrop-blur-md transition-colors"
            >
              <IconLucideMouse class="w-3.5 h-3.5 mr-1.5" />
              Scroll to zoom &middot; Drag to pan
            </span>

            <button
              @click="resetZoom"
              type="button"
              class="text-gray-500 bg-white/80 hover:bg-gray-100 hover:text-gray-900 border-gray-200 dark:text-gray-400 dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:hover:text-white dark:border-gray-600 rounded-lg text-sm p-2.5 inline-flex items-center border shadow-sm transition-colors focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 backdrop-blur-md"
              title="Reset Zoom"
            >
              <IconLucideRefreshCcw class="w-4 h-4" />
              <span class="sr-only">Reset Zoom</span>
            </button>

            <button
              @click="closeZoom"
              type="button"
              class="text-gray-500 bg-white/80 hover:bg-red-600 hover:text-white border-gray-200 dark:text-gray-400 dark:bg-gray-800/80 dark:hover:bg-red-600 dark:hover:text-white dark:border-gray-600 rounded-lg text-sm p-2.5 inline-flex items-center border shadow-sm transition-colors focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 backdrop-blur-md"
            >
              <IconLucideX class="w-4 h-4" />
              <span class="sr-only">Close modal</span>
            </button>
          </div>

          <!-- Main Zoomed Image -->
          <div
            class="relative w-full h-full cursor-move flex items-center justify-center"
            @mousedown="startPan"
            @mousemove="pan"
            @mouseup="endPan"
            @mouseleave="endPan"
          >
            <img
              :src="currentImageUrl"
              class="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none transition-transform shadow-2xl dark:shadow-none"
              :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})`,
                transitionDuration: isPanning ? '0ms' : '200ms',
              }"
              @dragstart.prevent
            />
          </div>

          <!-- Prev/Next inside zoom -->
          <button
            v-if="images.length > 1"
            @click.stop="prevImage"
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 cursor-pointer group focus:outline-none"
          >
            <span
              class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/60 text-gray-800 border-gray-200 group-hover:bg-white group-focus:ring-4 group-focus:ring-gray-200 dark:bg-gray-800/60 dark:text-white dark:border-gray-600 dark:group-hover:bg-gray-800 dark:group-focus:ring-gray-700 border backdrop-blur-sm transition-all"
            >
              <IconLucideChevronLeft class="w-5 h-5" />
              <span class="sr-only">Previous</span>
            </span>
          </button>

          <button
            v-if="images.length > 1"
            @click.stop="nextImage"
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 cursor-pointer group focus:outline-none"
          >
            <span
              class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/60 text-gray-800 border-gray-200 group-hover:bg-white group-focus:ring-4 group-focus:ring-gray-200 dark:bg-gray-800/60 dark:text-white dark:border-gray-600 dark:group-hover:bg-gray-800 dark:group-focus:ring-gray-700 border backdrop-blur-sm transition-all"
            >
              <IconLucideChevronRight class="w-5 h-5" />
              <span class="sr-only">Next</span>
            </span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideChevronLeft from '~icons/lucide/chevron-left';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';
  import IconLucideArrowUpDown from '~icons/lucide/arrow-up-down';
  import IconLucideMove from '~icons/lucide/move';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideRefreshCcw from '~icons/lucide/refresh-ccw';
  import IconLucideMouse from '~icons/lucide/mouse';
  import { usePropertyStore } from '@/modules/properties/stores/propertyStore';
  import type { ImageResponse } from '@/modules/properties/services/propertyService';

  const props = defineProps<{
    propertyId?: string;
    canManage?: boolean;
  }>();

  const { t } = useI18n();
  const propertyStore = usePropertyStore();

  // State
  const currentIndex = ref(0);
  const reorderMode = ref(false);
  const reorderList = ref<ImageResponse[]>([]);
  let dragStartIndex = -1;

  // Load images on mount
  onMounted(() => {
    if (props.propertyId) {
      propertyStore.fetchPropertyImages(props.propertyId);
    }
  });

  watch(
    () => props.propertyId,
    (newId) => {
      if (newId) propertyStore.fetchPropertyImages(newId);
    }
  );

  const images = computed(() => propertyStore.images);
  const displayList = computed(() => (reorderMode.value ? reorderList.value : images.value));

  const currentImageUrl = computed(() => {
    if (displayList.value.length === 0) return '';
    const img = displayList.value[currentIndex.value];
    return img?.temporaryDownloadUrl || img?.publicUrl || '';
  });

  // Carousel navigation
  const nextImage = () => {
    currentIndex.value = (currentIndex.value + 1) % displayList.value.length;
  };

  const prevImage = () => {
    currentIndex.value =
      (currentIndex.value - 1 + displayList.value.length) % displayList.value.length;
  };

  const selectImage = (index: number) => {
    currentIndex.value = index;
  };

  // Reorder functionality
  const toggleReorderMode = () => {
    reorderList.value = [...images.value];
    reorderMode.value = true;
  };

  const cancelReorder = () => {
    reorderMode.value = false;
    reorderList.value = [];
  };

  const handleDragStart = (e: DragEvent, index: number) => {
    dragStartIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDrop = (_e: DragEvent, index: number) => {
    if (dragStartIndex === -1 || dragStartIndex === index) return;
    const draggedItem = reorderList.value[dragStartIndex];
    reorderList.value.splice(dragStartIndex, 1);
    reorderList.value.splice(index, 0, draggedItem);
    dragStartIndex = -1;
    // If we moved the currently viewed image, update currentIndex
    if (dragStartIndex === currentIndex.value) {
      currentIndex.value = index;
    }
  };

  const saveReorder = async () => {
    try {
      const orderedIds = reorderList.value.map((img) => img.id);
      await propertyStore.reorderImages(props.propertyId!, orderedIds);
      reorderMode.value = false;
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  // Zoom / Pan Functionality
  const isZoomed = ref(false);
  const zoomScale = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const isPanning = ref(false);
  let startMouseX = 0;
  let startMouseY = 0;
  let initialPanX = 0;
  let initialPanY = 0;

  const openZoom = () => {
    isZoomed.value = true;
    document.body.style.overflow = 'hidden';
    resetZoom();
  };

  const closeZoom = () => {
    isZoomed.value = false;
    document.body.style.overflow = '';
  };

  const resetZoom = () => {
    zoomScale.value = 1;
    panX.value = 0;
    panY.value = 0;
  };

  const handleZoomWheel = (e: WheelEvent) => {
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(0.5, zoomScale.value + delta), 5); // Limit 0.5x to 5x
    zoomScale.value = newScale;
  };

  const startPan = (e: MouseEvent) => {
    isPanning.value = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    initialPanX = panX.value;
    initialPanY = panY.value;
  };

  const pan = (e: MouseEvent) => {
    if (!isPanning.value) return;
    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;
    panX.value = initialPanX + dx;
    panY.value = initialPanY + dy;
  };

  const endPan = () => {
    isPanning.value = false;
  };
</script>
