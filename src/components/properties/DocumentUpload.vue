<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ t('documentUpload.title') }}
      </h4>
      <fwb-button
        v-if="canUpload"
        size="xs"
        gradient="blue"
        @click="triggerFileInput"
        :disabled="uploading"
      >
        <div class="flex items-center gap-1">
          <IconLucidePlus v-if="!uploading" class="w-4 h-4" />
          <div
            v-else
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          {{ uploading ? t('documentUpload.uploading') : t('documentUpload.uploadContract') }}
        </div>
      </fwb-button>
    </div>

    <div v-if="documents.length > 0" class="space-y-2">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <IconLucideFileText class="w-8 h-8 text-red-500 shrink-0" />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ doc.originalFileName }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span :class="statusBadge(doc.status)" class="text-xs px-2 py-0.5 rounded-full">
                {{ statusLabel(doc.status) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatFileSize(doc.fileSize) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(doc.uploadedAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="downloadDocument(doc)"
            :disabled="!isAdmin && (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id))"
            :title="
              isAdmin
                ? t('documentUpload.download')
                : isDocumentDownloaded(doc.id)
                  ? t('documentUpload.downloadAlreadyUsed')
                  : isDownloadExpired(doc.id)
                    ? t('documentUpload.downloadExpired')
                    : t('documentUpload.downloadExpires', {
                        n: getDownloadTimeRemaining(doc.id) || '10',
                      })
            "
            :class="[
              'p-2 rounded-lg transition-colors relative',
              !isAdmin && (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id))
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30',
            ]"
          >
            <div class="flex items-center gap-1">
              <IconLucideDownload class="w-5 h-5" />
              <span
                v-if="!isAdmin && getDownloadTimeRemaining(doc.id)"
                class="text-xs font-semibold"
              >
                {{ getDownloadTimeRemaining(doc.id) }}s
              </span>
            </div>
          </button>

          <button
            v-if="isAdmin"
            @click="deleteDocument(doc)"
            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            :title="t('documentUpload.delete')"
          >
            <IconLucideTrash class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed"
    >
      <p class="text-sm text-gray-500">{{ t('documentUpload.noDocuments') }}</p>
      <p v-if="canUpload" class="text-xs text-gray-400 mt-1">
        {{ t('documentUpload.emptyText') }}
      </p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.doc,.docx"
      class="hidden"
      @change="handleFileSelect"
    />

    <fwb-modal v-if="showPermissionModal" @close="showPermissionModal = false">
      <template #header>
        <div class="text-lg font-bold">{{ t('documentUpload.configurePermissions') }}</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('documentUpload.documentLabel') }}
            <span class="font-bold">{{ selectedDoc?.originalFileName }}</span>
          </p>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('documentUpload.accessRoles') }}
            </label>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="permissionForm.roles.ADMIN" value="ROLE_ADMIN" />
                <span>{{ t('documentUpload.admins') }}</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="permissionForm.roles.AGENT" value="ROLE_AGENT" />
                <span>{{ t('documentUpload.generalAgents') }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('documentUpload.specificAgents') }}
            </label>
            <div class="flex gap-2">
              <input
                v-model="newAgentId"
                type="text"
                :placeholder="t('documentUpload.agentIdPlaceholder')"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              <fwb-button size="sm" @click="addAgentPermission">
                {{ t('documentUpload.add') }}
              </fwb-button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="agent in permissionForm.specificAgents"
                :key="agent"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {{ agent }}
                <button @click="removeAgentPermission(agent)" class="hover:text-red-600">×</button>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" @click="showPermissionModal = false">
            {{ t('documentUpload.cancel') }}
          </fwb-button>
          <fwb-button gradient="blue" @click="savePermissions">
            {{ t('documentUpload.save') }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <!-- Global Toast -->
    <AppToast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, reactive } from 'vue';
  import { FwbButton, FwbModal } from 'flowbite-vue';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideDownload from '~icons/lucide/download';
  import IconLucideTrash from '~icons/lucide/trash';
  import { propertyService } from '@/modules/properties';
  import type { DocumentResponse } from '@/modules/properties';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import AppToast from '@/components/ui/AppToast.vue';

  const { t } = useI18n();

  const props = defineProps<{
    propertyId: string;
    agentId?: string;
  }>();

  const authStore = useAuthStore();
  const fileInput = ref<HTMLInputElement>();
  const documents = ref<DocumentResponse[]>([]);
  const uploading = ref(false);
  const showPermissionModal = ref(false);
  const selectedDoc = ref<DocumentResponse | null>(null);

  // UI States
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const downloadTimers = ref<Record<string, { expiresAt: number; timerId: number | null }>>({});

  const permissionForm = reactive({
    roles: {
      ADMIN: false,
      AGENT: false,
    },
    specificAgents: [] as string[],
  });
  const newAgentId = ref('');

  const isAdmin = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles as string[]) || [];
    return roles.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  const canUpload = computed(
    () => isAdmin.value || props.agentId === (authStore.user as UserClaims | null)?.sub
  );

  const loadDocuments = async () => {
    try {
      documents.value = await propertyService.getPropertyDocuments(props.propertyId);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = fileExt === 'pdf' || fileExt === 'doc' || fileExt === 'docx';

    if (!validTypes.includes(file.type) && !isValidExt) {
      toast.message = t('documentUpload.onlyPdfDoc');
      toast.type = 'error';
      toast.show = true;
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.message = t('documentUpload.maxFileSize');
      toast.type = 'error';
      toast.show = true;
      return;
    }

    uploading.value = true;
    try {
      await propertyService.uploadExclusivityContract(props.propertyId, file);
      await loadDocuments();

      toast.message = t('documentUpload.uploadSuccessMessage');
      toast.type = 'success';
      toast.show = true;
    } catch (err: unknown) {
      console.error('Error uploading document:', err);
      const errorObj = err as {
        response?: { data?: { detail?: string; message?: string } };
      };

      toast.message =
        errorObj.response?.data?.detail ||
        errorObj.response?.data?.message ||
        t('documentUpload.uploadError');
      toast.type = 'error';
      toast.show = true;
    } finally {
      uploading.value = false;
      if (fileInput.value) fileInput.value.value = '';
    }
  };

  const getDownloadTimeRemaining = (docId: string): number | null => {
    if (isAdmin.value) return null;
    const timer = downloadTimers.value[docId];
    if (!timer) return null;

    const now = Date.now();
    const remaining = Math.ceil((timer.expiresAt - now) / 1000);

    return remaining > 0 ? remaining : null;
  };

  const isDownloadExpired = (docId: string): boolean => {
    if (isAdmin.value) return false;
    const timer = downloadTimers.value[docId];
    if (!timer) return false;

    return Date.now() >= timer.expiresAt;
  };

  const isDocumentDownloaded = (docId: string): boolean => {
    if (isAdmin.value) return false;
    const u = authStore.user as UserClaims | null;
    if (!u?.sub) return false;
    const key = `downloaded_${u.sub}_${docId}`;
    return localStorage.getItem(key) === 'true';
  };

  const markDocumentAsDownloaded = (docId: string) => {
    if (isAdmin.value) return;
    const u = authStore.user as UserClaims | null;
    if (!u?.sub) return;
    const key = `downloaded_${u.sub}_${docId}`;
    localStorage.setItem(key, 'true');
  };

  const setDownloadExpiration = (docId: string) => {
    if (isAdmin.value) return;
    const existingTimer = downloadTimers.value[docId];
    if (existingTimer && existingTimer.timerId !== null) {
      clearInterval(existingTimer.timerId);
    }

    const expiresAt = Date.now() + 900 * 1000;
    const timerId = window.setInterval(() => {
      if (downloadTimers.value[docId]) {
        downloadTimers.value[docId] = {
          ...downloadTimers.value[docId],
          expiresAt,
        };
      }
    }, 100);

    downloadTimers.value[docId] = { expiresAt, timerId };

    setTimeout(() => {
      markDocumentAsDownloaded(docId);

      const timer = downloadTimers.value[docId];
      if (timer && timer.timerId !== null) {
        clearInterval(timer.timerId);
      }
    }, 10000);
  };

  const downloadDocument = async (doc: DocumentResponse) => {
    try {
      let downloadUrl = doc.temporaryDownloadUrl;

      if (!downloadUrl || doc.expiresInSeconds === 0 || isDownloadExpired(doc.id)) {
        const result = await propertyService.refreshDownloadUrl(doc.id);
        downloadUrl = result.temporaryDownloadUrl;
      }

      if (!isAdmin.value) {
        setDownloadExpiration(doc.id);
      }

      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.message = t('documentUpload.downloadError');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const deleteDocument = async (doc: DocumentResponse) => {
    if (!confirm(t('documentUpload.confirmDelete'))) return;

    try {
      await propertyService.deleteDocument(doc.id);
      await loadDocuments();

      toast.message = t('documentUpload.deleteSuccess');
      toast.type = 'success';
      toast.show = true;
    } catch (error) {
      console.error('Error deleting document:', error);

      toast.message = t('documentUpload.deleteError');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const addAgentPermission = () => {
    if (newAgentId.value && !permissionForm.specificAgents.includes(newAgentId.value)) {
      permissionForm.specificAgents.push(newAgentId.value);
      newAgentId.value = '';
    }
  };

  const removeAgentPermission = (agentId: string) => {
    permissionForm.specificAgents = permissionForm.specificAgents.filter((a) => a !== agentId);
  };

  const savePermissions = async () => {
    if (!selectedDoc.value) return;

    const accessPolicy: string[] = [];
    if (permissionForm.roles.ADMIN) accessPolicy.push('ROLE_ADMIN');
    if (permissionForm.roles.AGENT) accessPolicy.push('ROLE_AGENT');
    accessPolicy.push(...permissionForm.specificAgents);

    try {
      await propertyService.updateDocumentPermissions(selectedDoc.value.id, accessPolicy);
      await loadDocuments();
      showPermissionModal.value = false;

      toast.message = t('documentUpload.permissionsSuccess');
      toast.type = 'success';
      toast.show = true;
    } catch (error) {
      console.error('Error updating permissions:', error);

      toast.message = t('documentUpload.permissionsError');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: t('documentUpload.status.pending'),
      ACTIVE: t('documentUpload.status.active'),
      EXPIRED: t('documentUpload.status.expired'),
      REJECTED: t('documentUpload.status.rejected'),
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' ' + t('common.units.bytes');
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' ' + t('common.units.kb');
    return (bytes / (1024 * 1024)).toFixed(1) + ' ' + t('common.units.mb');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(getLocaleString());
  };

  onMounted(loadDocuments);
</script>
