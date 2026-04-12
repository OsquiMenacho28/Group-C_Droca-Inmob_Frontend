<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
    <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2">
      <IconLucideUpload class="w-5 h-5 text-blue-500" />
      Attach Payment Receipt
    </h3>

    <div
      class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer"
      :class="[
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50',
        selectedFile ? 'py-4 px-5' : 'py-10 px-5',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFilePicker"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        class="sr-only"
        @change="onFileChange"
      />

      <div
        v-if="!selectedFile"
        class="flex flex-col items-center gap-3 text-center pointer-events-none"
      >
        <div
          class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <IconLucideUploadCloud class="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">
            Drag & drop your file here, or
            <span class="text-blue-600 underline">browse</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">
            PDF, JPEG, PNG, WebP — max 10 MB
          </p>
        </div>
      </div>

      <div v-else class="flex items-center gap-4 pointer-events-none">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="isPdf ? 'bg-red-100' : 'bg-green-100'"
        >
          <IconLucideFileText v-if="isPdf" class="w-5 h-5 text-red-500" />
          <IconLucideImage v-else class="w-5 h-5 text-green-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatSize(selectedFile.size) }} · {{ selectedFile.type }}
          </p>
        </div>
        <button
          class="text-gray-400 hover:text-red-500 transition pointer-events-auto"
          @click.stop="clearFile"
          title="Remove file"
        >
          <IconLucideX class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div
      v-if="fileError"
      class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
    >
      <IconLucideAlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
      {{ fileError }}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Amount <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.amount ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.amount" class="text-red-500 text-xs mt-1">
          {{ formErrors.amount }}
        </p>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Currency <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.currency"
          class="w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.currency ? 'border-red-400' : 'border-gray-300'"
        >
          <option value="" disabled>Select currency</option>
          <option value="BOB">BOB — Boliviano</option>
          <option value="USD">USD — US Dollar</option>
          <option value="EUR">EUR — Euro</option>
        </select>
        <p v-if="formErrors.currency" class="text-red-500 text-xs mt-1">
          {{ formErrors.currency }}
        </p>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Payment Date <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.paymentDate"
          type="datetime-local"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.paymentDate ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.paymentDate" class="text-red-500 text-xs mt-1">
          {{ formErrors.paymentDate }}
        </p>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Concept <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.concept"
          type="text"
          maxlength="255"
          placeholder="e.g. Initial reservation payment"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.concept ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.concept" class="text-red-500 text-xs mt-1">
          {{ formErrors.concept }}
        </p>
      </div>
    </div>

    <div
      v-if="uploadError"
      class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
    >
      <IconLucideAlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
      {{ uploadError }}
    </div>

    <div v-if="uploading" class="space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span>Uploading...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="handleSubmit"
        :disabled="uploading"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <IconLucideLoader v-if="uploading" class="animate-spin w-4 h-4" />
        <IconLucideUpload v-else class="w-4 h-4" />
        {{ uploading ? 'Uploading...' : 'Attach Receipt' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLucideUpload from '~icons/lucide/upload';
import IconLucideUploadCloud from '~icons/lucide/upload-cloud';
import IconLucideFileText from '~icons/lucide/file-text';
import IconLucideImage from '~icons/lucide/image';
import IconLucideX from '~icons/lucide/x';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideLoader from '~icons/lucide/loader';
import { ref, reactive, computed } from 'vue';
import { useReceipts } from '@/composables/useReceipts';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_TYPE_LABELS,
} from '@/types/receipt';

const props = defineProps<{ operationId: string }>();

const emit = defineEmits<{
  (e: 'uploaded'): void;
}>();

const { attachReceipt, uploading, uploadProgress, uploadError } = useReceipts(
  props.operationId
);

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const fileError = ref<string | null>(null);

const form = reactive({
  amount: '',
  currency: 'BOB',
  paymentDate: '',
  concept: '',
});

const formErrors = reactive({
  amount: '',
  currency: '',
  paymentDate: '',
  concept: '',
});

const isPdf = computed(() => selectedFile.value?.type === 'application/pdf');

function triggerFilePicker() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) applyFile(input.files[0]);
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) applyFile(file);
}

function applyFile(file: File) {
  fileError.value = null;
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    fileError.value = `Invalid file format. Only ${ALLOWED_TYPE_LABELS} files are accepted.`;
    selectedFile.value = null;
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    fileError.value = `File is too large (${mb} MB). Maximum allowed size is 10 MB.`;
    selectedFile.value = null;
    return;
  }
  selectedFile.value = file;
}

function clearFile() {
  selectedFile.value = null;
  fileError.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function validateForm(): boolean {
  formErrors.amount = '';
  formErrors.currency = '';
  formErrors.paymentDate = '';
  formErrors.concept = '';
  let valid = true;

  if (!form.amount || Number(form.amount) <= 0) {
    formErrors.amount = 'A valid amount greater than zero is required.';
    valid = false;
  }
  if (!form.currency) {
    formErrors.currency = 'Please select a currency.';
    valid = false;
  }
  if (!form.paymentDate) {
    formErrors.paymentDate = 'Payment date is required.';
    valid = false;
  }
  if (!form.concept.trim()) {
    formErrors.concept = 'Concept is required.';
    valid = false;
  }
  return valid;
}

async function handleSubmit() {
  if (!selectedFile.value) {
    fileError.value = 'Please select a file to upload.';
    return;
  }
  if (!validateForm()) return;

  const success = await attachReceipt(selectedFile.value, {
    amount: Number(form.amount),
    currency: form.currency,
    paymentDate: new Date(form.paymentDate).toISOString(),
    concept: form.concept.trim(),
  });

  if (success) {
    clearFile();
    form.amount = '';
    form.currency = 'BOB';
    form.paymentDate = '';
    form.concept = '';
    emit('uploaded');
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>
