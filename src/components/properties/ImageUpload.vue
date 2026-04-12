<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
      :class="{
        'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400':
          !isDragging,
        'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging,
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        class="hidden"
        @change="handleFileSelect"
      />

      <IconLucideImage class="w-12 h-12 mx-auto text-gray-400 mb-3" />

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Arrastra y suelta imágenes aquí o haz clic para seleccionar
      </p>
      <p class="text-xs text-gray-400 mt-1">
        Formatos: JPG, PNG, WebP (máx. 10MB por imagen)
      </p>
    </div>

    <div
      v-if="uploadingImages.size > 0 || uploadedImages.length > 0"
      class="space-y-3"
    >
      <div class="flex justify-between items-center">
        <h4 class="font-semibold text-gray-900 dark:text-white">
          Imágenes ({{ uploadedImages.length }})
        </h4>
        <button
          v-if="uploadedImages.length > 1 && canReorder"
          @click="toggleReorderMode"
          class="text-xs text-blue-600 hover:text-blue-700"
        >
          {{ reorderMode ? 'Cancelar ordenamiento' : 'Reordenar imágenes' }}
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="[file, progress] in uploadingImages"
          :key="file.name"
          class="relative"
        >
          <div
            class="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <div class="text-center">
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
              ></div>
              <p class="text-xs mt-2">{{ progress }}%</p>
            </div>
          </div>
          <p class="text-xs truncate mt-1 text-gray-500">{{ file.name }}</p>
        </div>

        <div
          v-for="(img, idx) in reorderMode ? reorderImages : uploadedImages"
          :key="img.id"
          class="relative group"
          :class="{ 'cursor-move': reorderMode }"
          :draggable="reorderMode"
          @dragstart="reorderMode ? handleDragStart($event, idx) : null"
          @dragover.prevent
          @drop="reorderMode ? handleDropReorder($event, idx) : null"
        >
          <div class="relative">
            <img
              :src="img.temporaryDownloadUrl || img.publicUrl"
              class="w-full aspect-square object-cover rounded-lg shadow-sm"
            />
            <div
              v-if="reorderMode"
              class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span class="text-white text-xs font-medium">Arrastrar</span>
            </div>
          </div>

          <button
            v-if="!reorderMode"
            @click="removeImage(img.id, idx)"
            class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconLucideX class="w-4 h-4" />
          </button>

          <div
            v-if="img.isPrimary && !reorderMode"
            class="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded"
          >
            Principal
          </div>
        </div>
      </div>

      <div v-if="reorderMode" class="flex justify-end gap-2 mt-2">
        <fwb-button size="sm" color="alternative" @click="cancelReorder"
          >Cancelar</fwb-button
        >
        <fwb-button size="sm" gradient="blue" @click="saveReorder"
          >Guardar orden</fwb-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { FwbButton } from 'flowbite-vue';
import IconLucideImage from '~icons/lucide/image';
import IconLucideX from '~icons/lucide/x';
import {
  propertyService,
  type ImageResponse,
} from '@/services/propertyService';

const props = defineProps<{
  propertyId: string;
}>();

const emit = defineEmits<{
  (e: 'images-updated', urls: string[]): void;
}>();

const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const uploadingImages = ref<Map<File, number>>(new Map());
const uploadedImages = ref<ImageResponse[]>([]);
const reorderMode = ref(false);
const reorderImages = ref<ImageResponse[]>([]);
let dragStartIndex = -1;

const canReorder = computed(() => uploadedImages.value.length > 1);

/**
 * Carga las imágenes completas (objetos con ID) desde el servidor.
 */
const loadImages = async () => {
  try {
    const images = await propertyService.getPropertyImages(props.propertyId);
    uploadedImages.value = images;
    emit(
      'images-updated',
      images.map((img) => img.temporaryDownloadUrl || img.publicUrl)
    );
  } catch (error) {
    console.error('Error cargando imágenes:', error);
  }
};

const triggerFileInput = () => fileInput.value?.click();

const handleFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  uploadFiles(files);
  if (fileInput.value) fileInput.value.value = '';
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  uploadFiles(files);
};

const uploadFiles = async (files: File[]) => {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'));

  for (const file of imageFiles) {
    uploadingImages.value.set(file, 0);
    try {
      const { uploadUrl, objectKey } =
        await propertyService.generateImageUploadUrl(props.propertyId, file);

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await propertyService.confirmImageUpload(props.propertyId, {
        objectKey,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      await loadImages();
    } catch {
      alert(`Error al subir ${file.name}`);
    } finally {
      uploadingImages.value.delete(file);
    }
  }
};

/**
 * Elimina la imagen usando su ID único.
 */
const removeImage = async (imageId: string, index: number) => {
  if (!confirm('¿Seguro que deseas eliminar esta imagen?')) return;

  try {
    await propertyService.deleteImage(props.propertyId, imageId);
    uploadedImages.value.splice(index, 1);
    emit(
      'images-updated',
      uploadedImages.value.map(
        (img) => img.temporaryDownloadUrl || img.publicUrl
      )
    );
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    alert('Error al eliminar la imagen del servidor');
  }
};

const toggleReorderMode = () => {
  if (!reorderMode.value) {
    reorderImages.value = [...uploadedImages.value];
  }
  reorderMode.value = !reorderMode.value;
};

const handleDragStart = (e: DragEvent, index: number) => {
  dragStartIndex = index;
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
};

const handleDropReorder = (_e: DragEvent, index: number) => {
  if (dragStartIndex === -1) return;
  const draggedItem = reorderImages.value[dragStartIndex];
  reorderImages.value.splice(dragStartIndex, 1);
  reorderImages.value.splice(index, 0, draggedItem);
  dragStartIndex = -1;
};

const saveReorder = async () => {
  try {
    const ids = reorderImages.value.map((img) => img.id);
    const updated = await propertyService.reorderImages(props.propertyId, ids);
    uploadedImages.value = updated;
    reorderMode.value = false;
    emit(
      'images-updated',
      updated.map((img) => img.temporaryDownloadUrl || img.publicUrl)
    );
  } catch {
    alert('Error al guardar el nuevo orden');
  }
};

const cancelReorder = () => {
  reorderMode.value = false;
  reorderImages.value = [];
};

onMounted(loadImages);
</script>
PropertyService
