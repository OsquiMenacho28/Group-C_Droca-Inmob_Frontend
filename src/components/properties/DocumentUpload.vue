<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
        Documentos
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
          {{ uploading ? 'Subiendo...' : 'Subir Contrato de Exclusividad' }}
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
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ doc.originalFileName }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span
                :class="statusBadge(doc.status)"
                class="text-xs px-2 py-0.5 rounded-full"
              >
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
            :disabled="
              !isAdmin &&
              (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id))
            "
            :title="
              isAdmin
                ? 'Descargar'
                : isDocumentDownloaded(doc.id)
                  ? 'Descarga ya utilizada'
                  : isDownloadExpired(doc.id)
                    ? 'Link expirado. Haz click para obtener uno nuevo'
                    : 'Descargar (expira en ' +
                      (getDownloadTimeRemaining(doc.id) || '10') +
                      's)'
            "
            :class="[
              'p-2 rounded-lg transition-colors relative',
              !isAdmin &&
              (isDownloadExpired(doc.id) || isDocumentDownloaded(doc.id))
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30',
            ]"
          >
            <div class="flex items-center gap-1">
              <IconLucideDownload class="w-5 h-5" />
              <span
                v-if="!isAdmin && getDownloadTimeRemaining(doc.id)"
                class="text-xs font-semibold"
                >{{ getDownloadTimeRemaining(doc.id) }}s</span
              >
            </div>
          </button>

          <button
            v-if="isAdmin"
            @click="deleteDocument(doc)"
            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Eliminar"
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
      <p class="text-sm text-gray-500">No hay documentos subidos</p>
      <p v-if="canUpload" class="text-xs text-gray-400 mt-1">
        Sube el contrato de exclusividad para legalizar la propiedad
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
        <div class="text-lg font-bold">Configurar Permisos de Documento</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Documento:
            <span class="font-bold">{{ selectedDoc?.originalFileName }}</span>
          </p>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Roles con acceso
            </label>
            <div class="space-y-2">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="permissionForm.roles.ADMIN"
                  value="ROLE_ADMIN"
                />
                <span>Administradores</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="permissionForm.roles.AGENT"
                  value="ROLE_AGENT"
                />
                <span>Agentes Generales</span>
              </label>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Agentes específicos (por ID)
            </label>
            <div class="flex gap-2">
              <input
                v-model="newAgentId"
                type="text"
                placeholder="authUserId del agente"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
              />
              <fwb-button size="sm" @click="addAgentPermission"
                >Agregar</fwb-button
              >
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="agent in permissionForm.specificAgents"
                :key="agent"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {{ agent }}
                <button
                  @click="removeAgentPermission(agent)"
                  class="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" @click="showPermissionModal = false"
            >Cancelar</fwb-button
          >
          <fwb-button gradient="blue" @click="savePermissions"
            >Guardar</fwb-button
          >
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { FwbButton, FwbModal } from 'flowbite-vue';
import IconLucidePlus from '~icons/lucide/plus';
import IconLucideFileText from '~icons/lucide/file-text';
import IconLucideDownload from '~icons/lucide/download';
import IconLucideTrash from '~icons/lucide/trash';
import { propertyService } from '@/services/propertyService';
import type { DocumentResponse } from '@/services/propertyService';
import { useAuth } from '@/composables/useAuth';

const props = defineProps<{
  propertyId: string;
  agentId?: string;
}>();

const { user } = useAuth();
const fileInput = ref<HTMLInputElement>();
const documents = ref<DocumentResponse[]>([]);
const uploading = ref(false);
const showPermissionModal = ref(false);
const selectedDoc = ref<DocumentResponse | null>(null);

const downloadTimers = ref<
  Record<string, { expiresAt: number; timerId: number | null }>
>({});

const permissionForm = ref({
  roles: {
    ADMIN: false,
    AGENT: false,
  },
  specificAgents: [] as string[],
});
const newAgentId = ref('');

const isAdmin = computed(() => {
  const roles = (user.value?.roles as string[]) || [];
  return roles.includes('ADMIN') || user.value?.userType === 'ADMIN';
});

const canUpload = computed(
  () => isAdmin.value || props.agentId === user.value?.sub
);

const loadDocuments = async () => {
  try {
    documents.value = await propertyService.getPropertyDocuments(
      props.propertyId
    );
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
  const isValidExt =
    fileExt === 'pdf' || fileExt === 'doc' || fileExt === 'docx';

  if (!validTypes.includes(file.type) && !isValidExt) {
    alert('Solo se permiten archivos PDF, DOC o DOCX');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo no debe exceder 10MB');
    return;
  }

  uploading.value = true;
  try {
    await propertyService.uploadExclusivityContract(props.propertyId, file);
    await loadDocuments();

    alert(
      'Contrato subido exitosamente. La propiedad ahora tiene documentación de exclusividad.'
    );
  } catch (err: unknown) {
    console.error('Error uploading document:', err);
    const errorObj = err as {
      response?: { data?: { detail?: string; message?: string } };
    };
    alert(
      errorObj.response?.data?.detail ||
        errorObj.response?.data?.message ||
        'Error al subir el documento'
    );
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
  if (!user.value?.sub) return false;
  const key = `downloaded_${user.value.sub}_${docId}`;
  return localStorage.getItem(key) === 'true';
};

const markDocumentAsDownloaded = (docId: string) => {
  if (isAdmin.value) return;
  if (!user.value?.sub) return;
  const key = `downloaded_${user.value.sub}_${docId}`;
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

    if (
      !downloadUrl ||
      doc.expiresInSeconds === 0 ||
      isDownloadExpired(doc.id)
    ) {
      const result = await propertyService.refreshDownloadUrl(doc.id);
      downloadUrl = result.temporaryDownloadUrl;
    }

    if (!isAdmin.value) {
      setDownloadExpiration(doc.id);
    }

    window.open(downloadUrl, '_blank');
  } catch (error) {
    console.error('Error downloading document:', error);
    alert('No se pudo descargar el documento. Verifica tus permisos.');
  }
};

const deleteDocument = async (doc: DocumentResponse) => {
  if (!confirm('¿Eliminar este documento permanentemente?')) return;

  try {
    await propertyService.deleteDocument(doc.id);
    await loadDocuments();
    alert('Documento eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting document:', error);
    alert('Error al eliminar el documento');
  }
};

const addAgentPermission = () => {
  if (
    newAgentId.value &&
    !permissionForm.value.specificAgents.includes(newAgentId.value)
  ) {
    permissionForm.value.specificAgents.push(newAgentId.value);
    newAgentId.value = '';
  }
};

const removeAgentPermission = (agentId: string) => {
  permissionForm.value.specificAgents =
    permissionForm.value.specificAgents.filter((a) => a !== agentId);
};

const savePermissions = async () => {
  if (!selectedDoc.value) return;

  const accessPolicy: string[] = [];
  if (permissionForm.value.roles.ADMIN) accessPolicy.push('ROLE_ADMIN');
  if (permissionForm.value.roles.AGENT) accessPolicy.push('ROLE_AGENT');
  accessPolicy.push(...permissionForm.value.specificAgents);

  try {
    await propertyService.updateDocumentPermissions(
      selectedDoc.value.id,
      accessPolicy
    );
    await loadDocuments();
    showPermissionModal.value = false;
    alert('Permisos actualizados exitosamente');
  } catch (error) {
    console.error('Error updating permissions:', error);
    alert('Error al actualizar permisos');
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
    PENDING: 'Pendiente',
    ACTIVE: 'Activo',
    EXPIRED: 'Expirado',
    REJECTED: 'Rechazado',
  };
  return labels[status] || status;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-BO');
};

onMounted(loadDocuments);
</script>
