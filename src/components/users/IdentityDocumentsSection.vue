<template>
  <section
    class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div class="min-w-0 flex-1">
        <h4 class="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
          {{ t('identityDocuments.title') }}
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('identityDocuments.subtitle') }}
        </p>
      </div>
      <span
        class="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:min-w-[88px] sm:pt-1 sm:text-right"
      >
        {{ documents.length }} {{ t('identityDocuments.countLabel') }}
      </span>
    </div>

    <div
      class="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/30 space-y-4"
    >
      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
          {{ t('identityDocuments.documentType') }}
        </label>
        <select
          v-model="selectedType"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="ID_CARD">{{ t('identityDocuments.types.ID_CARD') }}</option>
          <option value="PASSPORT">{{ t('identityDocuments.types.PASSPORT') }}</option>
          <option value="OTHER">{{ t('identityDocuments.types.OTHER') }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
          {{ t('identityDocuments.file') }}
        </label>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          class="block w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 file:mr-3 file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:file:bg-emerald-900/40 dark:file:text-emerald-300"
          @change="handleFileChange"
        />
      </div>

      <div class="flex justify-start">
        <fwb-button gradient="green" :disabled="uploading || !selectedFile" @click="uploadDocument">
          <span v-if="uploading">{{ t('identityDocuments.uploading') }}</span>
          <span v-else>{{ t('identityDocuments.uploadAction') }}</span>
        </fwb-button>
      </div>
    </div>

    <p class="text-xs text-gray-500 dark:text-gray-400">
      {{ t('identityDocuments.allowedFormats') }}
    </p>

    <div v-if="feedback.message" :class="feedbackClass" class="rounded-lg px-3 py-2 text-sm">
      {{ feedback.message }}
    </div>

    <div v-if="loading" class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
      {{ t('common.loading') }}
    </div>

    <div
      v-else-if="documents.length === 0"
      class="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      {{ t('identityDocuments.empty') }}
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="document in documents"
        :key="document.id"
        class="flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
        :title="t('identityDocuments.openInNewTab')"
        @click="openDocument(document.fileUrl)"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 space-y-2">
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {{ t('identityDocuments.fileNameLabel') }}
              </p>
              <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {{ resolveFileName(document) }}
              </p>
            </div>

            <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <p
                  class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('identityDocuments.typeLabel') }}
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ resolveTypeLabel(document.documentType) }}
                </p>
              </div>

              <div>
                <p
                  class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('identityDocuments.uploadDateLabel') }}
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatDate(document.uploadDate) }}
                </p>
              </div>
            </div>
          </div>

          <span
            class="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            {{ resolveTypeLabel(document.documentType) }}
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <fwb-button color="alternative" size="sm" @click.stop="openDocument(document.fileUrl)">
            {{ t('identityDocuments.download') }}
          </fwb-button>
          <fwb-button
            color="red"
            size="sm"
            :disabled="deletingId === document.id"
            @click.stop="deleteDocument(document.id)"
          >
            {{
              deletingId === document.id ? t('common.processing') : t('identityDocuments.delete')
            }}
          </fwb-button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { handleApiError } from '@/api/errorHandler';
  import { personService } from '@/services/personService';
  import {
    identityDocumentService,
    type IdentityDocument,
    type IdentityDocumentType,
  } from '@/services/identityDocumentService';
  import { getLocaleString } from '@/locales/i18n';

  const props = defineProps<{
    personId?: string | null;
    authUserId?: string | null;
  }>();

  const { t } = useI18n();

  const maxFileSizeBytes = 10 * 1024 * 1024;
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  const documents = ref<IdentityDocument[]>([]);
  const loading = ref(false);
  const uploading = ref(false);
  const deletingId = ref<string | null>(null);
  const selectedType = ref<IdentityDocumentType>('ID_CARD');
  const selectedFile = ref<File | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  const resolvedPersonId = ref<string | null>(props.personId ?? null);
  const feedback = ref<{ type: 'success' | 'error'; message: string }>({
    type: 'success',
    message: '',
  });

  const feedbackClass = computed(() =>
    feedback.value.type === 'success'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  );

  const setFeedback = (message: string, type: 'success' | 'error') => {
    feedback.value = { message, type };
  };

  const clearSelectedFile = () => {
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const ensurePersonId = async (): Promise<string | null> => {
    if (props.personId) {
      resolvedPersonId.value = props.personId;
      return props.personId;
    }

    if (resolvedPersonId.value) {
      return resolvedPersonId.value;
    }

    if (!props.authUserId) {
      return null;
    }

    try {
      const profile = await personService.getPersonByAuthUserId(props.authUserId);
      const personId = typeof profile.id === 'string' ? profile.id : null;
      resolvedPersonId.value = personId;
      return personId;
    } catch (error) {
      setFeedback(handleApiError(error).message, 'error');
      return null;
    }
  };

  const loadDocuments = async () => {
    const personId = await ensurePersonId();

    if (!personId) {
      documents.value = [];
      return;
    }

    loading.value = true;
    try {
      documents.value = await identityDocumentService.getDocuments(personId);
    } catch (error) {
      setFeedback(handleApiError(error).message, 'error');
    } finally {
      loading.value = false;
    }
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;

    if (!file) {
      selectedFile.value = null;
      return;
    }

    if (!allowedMimeTypes.includes(file.type)) {
      clearSelectedFile();
      setFeedback(t('identityDocuments.invalidType'), 'error');
      return;
    }

    if (file.size > maxFileSizeBytes) {
      clearSelectedFile();
      setFeedback(t('identityDocuments.fileTooLarge'), 'error');
      return;
    }

    feedback.value.message = '';
    selectedFile.value = file;
  };

  const uploadDocument = async () => {
    const personId = await ensurePersonId();

    if (!personId) {
      setFeedback(t('identityDocuments.missingPerson'), 'error');
      return;
    }

    if (!selectedFile.value) {
      setFeedback(t('identityDocuments.missingFile'), 'error');
      return;
    }

    uploading.value = true;
    try {
      await identityDocumentService.uploadDocument(
        personId,
        selectedType.value,
        selectedFile.value
      );
      setFeedback(t('identityDocuments.uploadSuccess'), 'success');
      clearSelectedFile();
      await loadDocuments();
    } catch (error) {
      setFeedback(handleApiError(error).message, 'error');
    } finally {
      uploading.value = false;
    }
  };

  const deleteDocument = async (documentId: string) => {
    const personId = await ensurePersonId();
    if (!personId) {
      setFeedback(t('identityDocuments.missingPerson'), 'error');
      return;
    }

    deletingId.value = documentId;
    try {
      await identityDocumentService.deleteDocument(personId, documentId);
      setFeedback(t('identityDocuments.deleteSuccess'), 'success');
      await loadDocuments();
    } catch (error) {
      setFeedback(handleApiError(error).message, 'error');
    } finally {
      deletingId.value = null;
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resolveFileName = (document: IdentityDocument) => {
    if (document.originalFileName?.trim()) {
      return document.originalFileName;
    }

    if (!document.fileUrl) {
      return t('identityDocuments.unnamedFile');
    }

    try {
      const parsedUrl = new URL(document.fileUrl);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      return decodeURIComponent(
        pathSegments[pathSegments.length - 1] || t('identityDocuments.unnamedFile')
      );
    } catch {
      const sanitizedUrl = document.fileUrl.split('?')[0];
      const pathSegments = sanitizedUrl.split('/').filter(Boolean);
      return decodeURIComponent(
        pathSegments[pathSegments.length - 1] || t('identityDocuments.unnamedFile')
      );
    }
  };

  const resolveTypeLabel = (type: IdentityDocumentType) => t(`identityDocuments.types.${type}`);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('common.notSpecified');
    return new Date(dateStr).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  watch(
    () => [props.personId, props.authUserId],
    () => {
      resolvedPersonId.value = props.personId ?? null;
      feedback.value.message = '';
      clearSelectedFile();
      loadDocuments();
    }
  );

  onMounted(loadDocuments);
</script>
