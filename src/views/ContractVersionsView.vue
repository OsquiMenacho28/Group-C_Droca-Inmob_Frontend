<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Encabezado -->
    <div class="mb-6">
      <!-- Back button -->
      <div>
        <fwb-button
          tag="router-link"
          :to="`/dashboard/operations/${operationId}`"
          color="light"
          size="xs"
          class="px-2.5! py-1! text-xs dark:bg-gray-800 dark:border-gray-700"
        >
          <template #prefix>
            <IconLucideArrowLeft class="w-3 h-3" />
          </template>
          {{ t('operations.backToOperation') }}
        </fwb-button>
      </div>

      <div class="flex justify-between items-center mt-5 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('operationContractVersions.title') }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ t('operationContractVersions.operation') }}
            <span class="font-medium text-blue-600 dark:text-blue-400">{{ operationId }}</span>
          </p>
        </div>

        <!-- Botón crear nueva versión (solo ADMINISTRADOR) -->
        <fwb-button v-if="isAdmin" @click="openCreateModal" color="green">
          <template #prefix>
            <IconLucidePlus class="w-4 h-4" />
          </template>
          {{ t('operationContractVersions.newVersion') }}
        </fwb-button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <fwb-spinner size="10" />
    </div>

    <!-- Sin versiones -->
    <div
      v-else-if="versions.length === 0"
      class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600"
    >
      <IconLucideFileText class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 font-medium">
        {{ t('operationContractVersions.noVersions') }}
      </p>
      <p v-if="isAdmin" class="text-sm text-gray-400 dark:text-gray-500 mt-1">
        {{ t('operationContractVersions.createFirstVersion') }}
      </p>
    </div>

    <!-- Tabla de versiones -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th class="px-6 py-3">{{ t('operationContractVersions.version') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.versionTitle') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.changeDescription') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.author') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.date') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.status') }}</th>
            <th class="px-6 py-3">{{ t('operationContractVersions.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="version in versions"
            :key="version.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm dark:bg-blue-900 dark:text-blue-300"
              >
                v{{ version.versionNumber }}
              </span>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
              {{ version.title }}
            </td>
            <td class="px-6 py-4 max-w-xs truncate">
              {{ version.changeDescription || '—' }}
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ version.authorName }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ version.authorRole }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDateTime(version.createdAt) }}
            </td>
            <td class="px-6 py-4">
              <span :class="statusBadgeClass(version.status)">
                {{ version.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <fwb-button
                @click="viewVersion(version)"
                color="light"
                size="sm"
                class="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {{ t('operationContractVersions.viewContent') }}
              </fwb-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ============================================================ -->
    <!-- Modal: Crear nueva versión -->
    <!-- ============================================================ -->
    <fwb-modal v-if="showCreateModal" @close="closeCreateModal" size="2xl" :persistent="submitting">
      <template #header>
        <div class="text-lg font-bold dark:text-white">
          {{ t('operationContractVersions.newContractVersion') }}
        </div>
      </template>
      <template #body>
        <form @submit.prevent="submitNewVersion" class="space-y-5">
          <!-- Número de versión (readonly, calculado) -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('operationContractVersions.versionNumber') }}
            </label>
            <fwb-input v-model="contractVersionNumber" :disabled="true" type="text" />
          </div>

          <!-- Título -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('operationContractVersions.titleLabel') }}
              <span class="text-red-500">*</span>
            </label>
            <fwb-input
              v-model="form.title"
              type="text"
              :placeholder="t('operationContractVersions.titlePlaceholder')"
              required
            />
          </div>

          <!-- Descripción del cambio -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('operationContractVersions.changeDescriptionLabel') }}
            </label>
            <fwb-input
              v-model="form.changeDescription"
              type="text"
              :placeholder="t('operationContractVersions.changeDescriptionPlaceholder')"
            />
          </div>

          <!-- Editor de contenido -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('operationContractVersions.contractContent') }}
              <span class="text-red-500">*</span>
            </label>
            <fwb-textarea
              v-model="form.content"
              :rows="10"
              required
              :placeholder="t('operationContractVersions.contentPlaceholder')"
            />
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {{ form.content.length }}
              {{ t('operationContractVersions.characters') }}
            </p>
          </div>

          <!-- Error -->
          <div
            v-if="createError"
            class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
          >
            {{ createError }}
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <fwb-button color="alternative" @click="closeCreateModal" :disabled="submitting">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button @click="submitNewVersion" gradient="blue" :disabled="submitting">
            <IconLucideSave v-if="!submitting" class="w-4 h-4 mr-2" />
            {{
              submitting
                ? t('operationContractVersions.saving')
                : t('operationContractVersions.saveVersion')
            }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <!-- ============================================================ -->
    <!-- Modal: Ver contenido de una versión -->
    <!-- ============================================================ -->
    <fwb-modal v-if="selectedVersion" @close="selectedVersion = null" size="3xl">
      <template #header>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold dark:bg-blue-900 dark:text-blue-300"
          >
            v{{ selectedVersion.versionNumber }}
          </span>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedVersion.title }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{
                selectedVersion.changeDescription ||
                t('operationContractVersions.noChangeDescription')
              }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <!-- Metadata -->
        <div class="px-3 py-2 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <span class="font-medium">{{ t('operationContractVersions.authorLabel') }}</span>
              {{ selectedVersion.authorName }} ({{ selectedVersion.authorRole }})
            </span>
            <span>
              <span class="font-medium">{{ t('operationContractVersions.dateLabel') }}</span>
              {{ formatDateTime(selectedVersion.createdAt) }}
            </span>
            <span :class="statusBadgeClass(selectedVersion.status)">
              {{ selectedVersion.status }}
            </span>
          </div>
        </div>

        <!-- Contenido scrolleable -->
        <div class="max-h-96 overflow-y-auto">
          <pre
            class="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-gray-200 leading-relaxed p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >{{ selectedVersion.content }}</pre
          >
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { contractVersionService } from '@/services/contractVersionService';
  import { handleApiError } from '@/api/errorHandler';
  import type {
    ContractVersionResponse,
    CreateContractVersionRequest,
  } from '@/types/contractVersion';
  import { formatDateTime } from '@/utils/dateTime';
  import { useI18n } from 'vue-i18n';
  import { FwbButton, FwbModal, FwbInput, FwbTextarea, FwbSpinner } from 'flowbite-vue';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideSave from '~icons/lucide/save';

  // ----------------------------------------------------------------
  // Language, router & params
  // ----------------------------------------------------------------
  const { t } = useI18n();
  const route = useRoute();
  const operationId = computed(() => route.params.operationId as string);

  // ----------------------------------------------------------------
  // Estado general
  // ----------------------------------------------------------------
  const versions = ref<ContractVersionResponse[]>([]);
  const loading = ref(false);
  const selectedVersion = ref<ContractVersionResponse | null>(null);

  // ----------------------------------------------------------------
  // Rol del usuario
  // ----------------------------------------------------------------
  const authStore = useAuthStore();
  const user = computed(() => authStore.user as UserClaims | null);

  const isAdmin = computed(() => {
    const roles = (user.value?.roles || []) as string[];
    return roles.includes('ADMIN') || user.value?.userType === 'ADMIN';
  });

  // ----------------------------------------------------------------
  // Modal de creación
  // ----------------------------------------------------------------
  const showCreateModal = ref(false);
  const submitting = ref(false);
  const createError = ref('');
  const form = ref<CreateContractVersionRequest>({
    content: '',
    title: '',
    changeDescription: '',
  });

  const nextVersionNumber = computed(() =>
    versions.value.length > 0 ? Math.max(...versions.value.map((v) => v.versionNumber)) + 1 : 1
  );

  const contractVersionNumber = ref('v' + nextVersionNumber.value);

  function openCreateModal() {
    form.value = { content: '', title: '', changeDescription: '' };
    createError.value = '';
    showCreateModal.value = true;
  }

  function closeCreateModal() {
    showCreateModal.value = false;
  }

  async function submitNewVersion() {
    if (!form.value.title.trim() || !form.value.content.trim()) {
      createError.value = t('operationContractVersions.requiredFields');
      return;
    }

    submitting.value = true;
    createError.value = '';
    try {
      const created = await contractVersionService.createContractVersion(
        operationId.value,
        form.value,
        user.value?.id || '',
        user.value?.roles?.[0] || '',
        user.value?.name || ''
      );
      versions.value.push(created);
      // Reordenar por número de versión
      versions.value.sort((a, b) => a.versionNumber - b.versionNumber);
      closeCreateModal();
    } catch (err: unknown) {
      createError.value = handleApiError(err).message ?? t('operationContractVersions.createError');
    } finally {
      submitting.value = false;
    }
  }

  // ----------------------------------------------------------------
  // Ver detalle de una versión
  // ----------------------------------------------------------------
  function viewVersion(version: ContractVersionResponse) {
    selectedVersion.value = version;
  }

  function statusBadgeClass(status: string): string {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold';
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'DRAFT':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'SUPERSEDED':
        return `${base} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400`;
      default:
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
    }
  }

  // ----------------------------------------------------------------
  // Cargar versiones al montar
  // ----------------------------------------------------------------
  onMounted(async () => {
    loading.value = true;
    try {
      versions.value = await contractVersionService.getContractVersions(operationId.value);
    } catch (e) {
      console.error(t('operationContractVersions.loadError'), e);
    } finally {
      loading.value = false;
    }
  });
</script>
