<script setup lang="ts">
  import { ref } from 'vue';
  import { useImageUpload } from '../composables/useImageUpload';

  const props = defineProps<{
    propertyId: string;
  }>();

  const { uploadingFiles, uploadFiles, clearCompleted } = useImageUpload(props.propertyId);
  const isDragging = ref(false);
  const fileInput = ref<HTMLInputElement | null>(null);

  const handleDrop = (e: DragEvent) => {
    isDragging.value = false;
    const files = e.dataTransfer?.files;
    if (files) {
      validateAndUpload(Array.from(files));
    }
  };

  const handleFileSelect = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      validateAndUpload(Array.from(files));
    }
  };

  const validateAndUpload = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isImage = ['image/jpeg', 'image/png'].includes(file.type);
      const isSmallEnough = file.size <= 10 * 1024 * 1024;
      return isImage && isSmallEnough;
    });

    if (validFiles.length < files.length) {
      alert('Algunos archivos fueron rechazados. Solo se permiten JPG/PNG de hasta 10MB.');
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };
</script>

<template>
  <div class="space-y-4">
    <!-- Dropzone -->
    <div
      class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200"
      :class="[
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          class="w-10 h-10 mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <p class="mb-2 text-sm text-gray-500">
          <span class="font-semibold">Haga clic para subir</span>
          o arrastre y suelte
        </p>
        <p class="text-xs text-gray-500">JPG o PNG (MAX. 10MB)</p>
      </div>
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        multiple
        accept="image/jpeg,image/png"
        @change="handleFileSelect"
      />
    </div>

    <!-- Uploading List -->
    <div v-if="uploadingFiles.length > 0" class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-medium text-gray-700">Subidas recientes</h3>
        <button
          v-if="uploadingFiles.some((f) => f.status === 'success')"
          @click="clearCompleted"
          class="text-xs text-blue-600 hover:underline"
        >
          Limpiar completados
        </button>
      </div>

      <div
        v-for="(file, index) in uploadingFiles"
        :key="index"
        class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {{ file.file.name }}
          </span>
          <span
            class="text-xs font-medium"
            :class="{
              'text-blue-600': file.status === 'uploading',
              'text-green-600': file.status === 'success',
              'text-red-600': file.status === 'error',
            }"
          >
            {{
              file.status === 'uploading'
                ? 'Subiendo...'
                : file.status === 'success'
                  ? 'Completado'
                  : 'Error'
            }}
          </span>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="{
              'bg-blue-600': file.status === 'uploading',
              'bg-green-600': file.status === 'success',
              'bg-red-600': file.status === 'error',
            }"
            :style="{ width: `${file.progress}%` }"
          ></div>
        </div>

        <p v-if="file.error" class="mt-1 text-xs text-red-600">{{ file.error }}</p>
      </div>
    </div>
  </div>
</template>
