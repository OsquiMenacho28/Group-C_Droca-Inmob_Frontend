<template>
  <FwbCard
    class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-xl overflow-hidden"
  >
    <div class="p-8 space-y-8">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-none">
          {{ t('receiptUploader.title') }}
        </h3>
      </div>

      <div
        class="relative border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden group"
        :class="[
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/30',
          selectedFile ? 'py-6 px-8' : 'py-16 px-8',
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
          class="flex flex-col items-center gap-5 text-center pointer-events-none"
        >
          <div
            class="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300"
          >
            <IconLucideUploadCloud class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-lg font-bold text-gray-800 dark:text-gray-100">
              {{ t('receiptUploader.dragDrop') }}
              <span
                class="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-4"
              >
                {{ t('receiptUploader.browse') }}
              </span>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {{ t('receiptUploader.formats') }}
            </p>
          </div>
        </div>

        <div v-else class="flex items-center gap-6 pointer-events-none animate-slide-up">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
            :class="
              isPdf ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
            "
          >
            <IconLucideFileText v-if="isPdf" class="w-8 h-8 text-red-600 dark:text-red-400" />
            <IconLucideImage v-else class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-lg font-black text-gray-900 dark:text-white truncate">
              {{ selectedFile.name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">
              {{ formatSize(selectedFile.size) }} •
              {{ selectedFile.type.split('/')[1].toUpperCase() }}
            </p>
          </div>
          <FwbButton
            @click.stop="clearFile"
            size="sm"
            color="red"
            outline
            class="pointer-events-auto rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2"
            :title="t('receiptUploader.removeFile')"
          >
            <div class="flex items-center gap-2">
              <IconLucideX class="w-4 h-4" />
              <span class="hidden sm:inline font-bold">{{ t('common.remove') }}</span>
            </div>
          </FwbButton>
        </div>
      </div>

      <FwbAlert
        v-if="fileError"
        type="danger"
        closable
        @close="fileError = null"
        class="shadow-sm border-l-4 border-red-500"
      >
        <span class="font-bold">{{ fileError }}</span>
      </FwbAlert>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div class="space-y-2">
          <FwbInput
            v-model="form.amount"
            :label="t('receiptUploader.amount')"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            :error="formErrors.amount"
            required
            class="font-medium"
          />
        </div>

        <div class="space-y-2">
          <FwbSelect
            v-model="form.currency"
            :label="t('receiptUploader.currency')"
            :options="currencyOptions"
            required
          />
          <p
            v-if="formErrors.currency"
            class="text-red-500 text-[11px] font-bold mt-1 px-1 uppercase tracking-wider"
          >
            {{ formErrors.currency }}
          </p>
        </div>

        <div class="space-y-2">
          <FwbInput
            v-model="form.paymentDate"
            :label="t('receiptUploader.paymentDate')"
            type="datetime-local"
            :error="formErrors.paymentDate"
            required
            class="font-medium"
          />
        </div>

        <div class="space-y-2">
          <FwbInput
            v-model="form.concept"
            :label="t('receiptUploader.concept')"
            type="text"
            maxlength="255"
            :placeholder="t('receiptUploader.conceptPlaceholder')"
            :error="formErrors.concept"
            required
            class="font-medium"
          />
        </div>
      </div>

      <div
        v-if="uploading"
        class="space-y-3 py-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700"
      >
        <div
          class="flex justify-between items-center text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest"
        >
          <span>{{ t('receiptUploader.uploading') }}</span>
          <span class="text-sm">{{ uploadProgress }}%</span>
        </div>
        <div
          class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner"
        >
          <div
            class="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <FwbAlert
        v-if="uploadError"
        type="danger"
        closable
        @close="clearUploadError"
        class="shadow-sm border-l-4 border-red-500"
      >
        <span class="font-bold">{{ uploadError }}</span>
      </FwbAlert>

      <div
        class="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-100 dark:border-gray-700"
      >
        <FwbButton
          @click="handleSubmit"
          :disabled="uploading"
          color="blue"
          size="lg"
          class="w-full sm:w-auto shadow-xl shadow-blue-600/20 px-10 py-3.5 transform active:scale-95 transition-transform"
        >
          <div class="flex items-center justify-center gap-3">
            <IconLucideLoader v-if="uploading" class="animate-spin w-6 h-6" />
            <IconLucideUpload v-else class="w-6 h-6" />
            <span class="font-black text-lg tracking-tight">
              {{ uploading ? t('receiptUploader.uploading') : t('receiptUploader.attachReceipt') }}
            </span>
          </div>
        </FwbButton>
      </div>
    </div>
  </FwbCard>
</template>

<script setup lang="ts">
  import IconLucideUpload from '~icons/lucide/upload';
  import IconLucideUploadCloud from '~icons/lucide/upload-cloud';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideLoader from '~icons/lucide/loader';
  import { ref, reactive, computed } from 'vue';
  import { FwbCard, FwbInput, FwbButton, FwbAlert, FwbSelect } from 'flowbite-vue';
  import { useReceipts } from '@/composables/useReceipts';
  import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, ALLOWED_TYPE_LABELS } from '@/types/receipt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps<{ operationId: string }>();

  const emit = defineEmits<{
    (e: 'uploaded'): void;
  }>();

  const { attachReceipt, uploading, uploadProgress, uploadError } = useReceipts(props.operationId);

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

  const currencyOptions = [
    { value: 'BOB', name: t('receiptUploader.currencyBOB') },
    { value: 'USD', name: t('receiptUploader.currencyUSD') },
    { value: 'EUR', name: t('receiptUploader.currencyEUR') },
  ];

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
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      fileError.value = t('receiptUploader.invalidFileFormat', { formats: ALLOWED_TYPE_LABELS });
      selectedFile.value = null;
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      fileError.value = t('receiptUploader.fileTooLarge', { size: mb });
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

  function clearUploadError() {}

  function validateForm(): boolean {
    formErrors.amount = '';
    formErrors.currency = '';
    formErrors.paymentDate = '';
    formErrors.concept = '';
    let valid = true;

    if (!form.amount || Number(form.amount) <= 0) {
      formErrors.amount = t('receiptUploader.validationAmount');
      valid = false;
    }
    if (!form.currency) {
      formErrors.currency = t('receiptUploader.validationCurrency');
      valid = false;
    }
    if (!form.paymentDate) {
      formErrors.paymentDate = t('receiptUploader.validationDate');
      valid = false;
    }
    if (!form.concept.trim()) {
      formErrors.concept = t('receiptUploader.validationConcept');
      valid = false;
    }
    return valid;
  }

  async function handleSubmit() {
    if (!selectedFile.value) {
      fileError.value = t('receiptUploader.selectFile');
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

<style scoped>
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  @keyframes slide-up {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
