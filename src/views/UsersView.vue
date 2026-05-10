<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold dark:text-white">{{ t('users.view.title') }}</h1>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4"
    >
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IconLucideSearch class="w-5 h-5 text-secondary" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              :placeholder="t('users.view.searchPlaceholder')"
              @input="handleSearch"
            />
          </div>
          <p
            v-if="searchQuery && filteredUsers.length === 0 && users.length > 0"
            class="mt-2 text-sm text-yellow-600 dark:text-yellow-400"
          >
            ⚠️ {{ t('users.view.noResults', { ci: searchQuery }) }}
          </p>
          <p
            v-if="searchQuery && filteredUsers.length > 0"
            class="mt-2 text-sm text-green-600 dark:text-green-400"
          >
            ✓ {{ t('users.view.resultsCount', { n: filteredUsers.length, ci: searchQuery }) }}
          </p>
        </div>
        <div class="flex gap-2">
          <fwb-button v-if="searchQuery" @click="clearSearch" color="alternative" size="sm">
            {{ t('users.view.clearSearch') }}
          </fwb-button>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('users.view.showLabel') }}
            </label>
            <fwb-button
              :color="statusFilter === 'ALL' ? 'blue' : 'alternative'"
              size="sm"
              @click="statusFilter = 'ALL'"
            >
              {{ t('users.view.filterAll') }}
            </fwb-button>
            <fwb-button
              :color="statusFilter === 'ACTIVE' ? 'blue' : 'alternative'"
              size="sm"
              @click="statusFilter = 'ACTIVE'"
            >
              {{ t('users.view.filterActive') }}
            </fwb-button>
            <fwb-button
              :color="statusFilter === 'INACTIVE' ? 'blue' : 'alternative'"
              size="sm"
              @click="statusFilter = 'INACTIVE'"
            >
              {{ t('users.view.filterInactive') }}
            </fwb-button>
          </div>
        </div>
      </div>
    </div>

    <users-table
      :users="filteredUsers"
      :roles="roles"
      :total-users="filteredUsers.length"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="handleDeactivate"
      @resend="handleResend"
      @reactivate="handleReactivate"
      @viewDetails="openDetailsModal"
    />

    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :total="totalUsers"
      @change="load"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? t('users.view.editTitle') : t('users.view.createTitle') }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingUser || undefined"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <fwb-modal v-if="showDetailsModal" @close="closeDetailsModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ t('users.view.detailsTitle') }}
          {{ selectedUser?.fullName || selectedUser?.email }}
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.view.ownerInfo') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.fullName || t('common.notAvailable') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.table.email') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.email || t('common.notAvailable') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.table.phone') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.phone || t('common.notAvailable') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.table.ciNit') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.taxId || t('common.notAvailable') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.table.role') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.userType || t('common.notAvailable') }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('users.table.status') }}
              </label>
              <p class="mt-1 text-sm text-primary">
                {{ selectedUser?.status || t('common.notAvailable') }}
              </p>
            </div>
          </div>

          <div v-if="selectedUser?.userType === 'OWNER'" class="border-t pt-4">
            <h3 class="text-md font-semibold mb-2">{{ t('users.view.ownerInfo') }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.address') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{ selectedUser?.address || t('common.notAvailable') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.properties') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{
                    t('users.view.propertiesCount', { n: selectedUser?.propertyIds?.length || 0 })
                  }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedUser?.userType === 'INTERESTED_CLIENT'" class="border-t pt-4">
            <h3 class="text-md font-semibold mb-2">{{ t('users.view.clientPrefs') }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.budget') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{ selectedUser?.budget ? `$${selectedUser.budget}` : t('common.notAvailable') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.preferredZone') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{ selectedUser?.preferredZone || t('common.notAvailable') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.preferredPropertyType') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{ selectedUser?.preferredPropertyType || t('common.notAvailable') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('users.view.rooms') }}
                </label>
                <p class="mt-1 text-sm text-primary">
                  {{ selectedUser?.preferredRooms || t('common.notAvailable') }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedUser?.status === 'INACTIVE'" class="border-t pt-4 flex justify-end">
            <fwb-button @click="handleRemove(selectedUser)" color="red">
              <div class="flex items-center">
                <IconLucideTrash class="w-4 h-4 mr-2" />
                {{ t('users.view.deactivate') }}
              </div>
            </fwb-button>
          </div>
        </div>
      </template>
    </fwb-modal>

    <fwb-alert
      v-if="toast.visible"
      :type="toast.type === 'success' ? 'success' : 'danger'"
      class="fixed bottom-4 right-4 z-50 max-w-md"
    >
      {{ toast.message }}
    </fwb-alert>

    <fwb-modal v-if="showDeactivateModal" @close="cancelDeactivate">
      <template #header>
        <div class="text-lg font-semibold">{{ t('users.view.deactivateModalTitle') }}</div>
      </template>
      <template #body>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{
            t('users.view.deactivateModalText', {
              name: userToDeactivate?.fullName || userToDeactivate?.email || '',
            })
          }}
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <fwb-button @click="cancelDeactivate" color="alternative">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button @click="confirmDeactivate" color="yellow">
            {{ t('users.view.yesDeactivate') }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showRemoveModal" @close="cancelRemove">
      <template #header>
        <div class="text-lg font-semibold">{{ t('users.view.removeModalTitle') }}</div>
      </template>
      <template #body>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{
            t('users.view.removeModalText', {
              name: userToRemove?.fullName || userToRemove?.email || '',
            })
          }}
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <fwb-button @click="cancelRemove" color="alternative">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button @click="confirmRemove" color="red">
            {{ t('users.view.yesRemove') }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideTrash from '~icons/lucide/trash';
  import { onMounted, ref, computed, watch } from 'vue';
  import { FwbModal, FwbButton, FwbAlert } from 'flowbite-vue';
  import { useUsers } from '@/composables/useUsers';
  import UserForm from '@/components/users/UserForm.vue';
  import UsersTable from '@/components/users/UsersTable.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import { useI18n } from 'vue-i18n';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  interface UserRecord {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
    phone?: string;
    taxId?: string;
    userType?: string;
    primaryRoleIds?: string[];
    status: string;
    budget?: number;
    preferredZone?: string;
    preferredPropertyType?: string;
    preferredRooms?: number | string;
    address?: string;
    propertyIds?: string[];
  }

  const {
    users,
    roles,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    statusFilter,
    load,
    create,
    remove,
    deactivate,
    reactivate,
    resendPassword,
    update,
    fetchUserProfile,
  } = useUsers();

  // Initialize status filter
  statusFilter.value = 'ALL';

  const showModal = ref(false);
  const isEditing = ref(false);
  const editingUser = ref<UserRecord | null>(null);
  const formKey = ref(0);

  const searchQuery = ref('');
  const searchTimeout = ref<ReturnType<typeof setTimeout>>();

  const toast = ref({ visible: false, message: '', type: 'success' });

  const showDetailsModal = ref(false);
  const selectedUser = ref<UserRecord | null>(null);

  const showDeactivateModal = ref(false);
  const showRemoveModal = ref(false);
  const userToDeactivate = ref<UserRecord | null>(null);
  const userToRemove = ref<UserRecord | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { visible: true, message, type };
    setTimeout(() => {
      toast.value.visible = false;
    }, 5000);
  };

  const filteredUsers = computed(() => {
    let filtered = users.value;

    if (searchQuery.value && searchQuery.value.trim() !== '') {
      const searchTerm = searchQuery.value.trim().toLowerCase();
      filtered = filtered.filter((user) => {
        const fullName = user.fullName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    return filtered;
  });

  watch(statusFilter, () => {
    currentPage.value = 0;
    load();
  });

  watch(pageSize, () => {
    currentPage.value = 0;
    load();
  });

  const handleSearch = () => {
    currentPage.value = 0;
    clearTimeout(searchTimeout.value);
    searchTimeout.value = setTimeout(() => {
      load(searchQuery.value);
    }, 300);
  };

  const clearSearch = () => {
    searchQuery.value = '';
    currentPage.value = 0;
    load();
  };

  const openCreateModal = () => {
    editingUser.value = null;
    isEditing.value = false;
    formKey.value++;
    showModal.value = true;
  };

  const openEditModal = async (user: UserRecord) => {
    loading.value = true;
    try {
      const profile = await fetchUserProfile(user.id);
      editingUser.value = { ...user, ...profile };
      isEditing.value = true;
      formKey.value++;
      showModal.value = true;
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    } finally {
      loading.value = false;
    }
  };

  const closeModal = () => {
    showModal.value = false;
    editingUser.value = null;
  };

  const openDetailsModal = async (user: UserRecord) => {
    loading.value = true;
    try {
      const profile = await fetchUserProfile(user.id);
      selectedUser.value = { ...user, ...profile };
      showDetailsModal.value = true;
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    } finally {
      loading.value = false;
    }
  };

  const closeDetailsModal = () => {
    showDetailsModal.value = false;
    selectedUser.value = null;
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const taxId = formData.taxId?.toString().trim().toLowerCase();
    if (formData.userType === 'OWNER' && taxId) {
      const duplicateOwner = users.value.find(
        (user) =>
          user.taxId?.toString().trim().toLowerCase() === taxId && user.id !== editingUser.value?.id
      );
      if (duplicateOwner) {
        showToast(t('users.view.duplicateCiWarning'), 'error');
        return;
      }
    }
    try {
      if (isEditing.value && editingUser.value) {
        await update(editingUser.value.id as string, formData);
        showToast(t('users.view.userUpdated'));
      } else {
        await create(formData);
        showToast(t('users.view.userCreated'));
      }
      closeModal();
      clearSearch();
    } catch (e: unknown) {
      const appError = handleApiError(e);
      let errorMessage = appError.message;

      if (errorMessage.includes('TaxId already exists')) {
        errorMessage = t('users.view.duplicateCiWarning');
      } else if (errorMessage.includes('Email already exists')) {
        errorMessage = `⚠️ ${t('users.view.duplicateEmail')}`;
      }

      showToast(errorMessage, 'error');
      console.error('Error submitting user:', e);
    }
  };

  const handleDeactivate = (user: UserRecord) => {
    userToDeactivate.value = user;
    showDeactivateModal.value = true;
  };

  const confirmDeactivate = async () => {
    if (!userToDeactivate.value) return;
    try {
      await deactivate(userToDeactivate.value.id as string);
      showToast(t('users.view.userUpdated'));
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    } finally {
      showDeactivateModal.value = false;
      userToDeactivate.value = null;
    }
  };

  const cancelDeactivate = () => {
    showDeactivateModal.value = false;
    userToDeactivate.value = null;
  };

  const handleRemove = (user: UserRecord) => {
    userToRemove.value = user;
    showRemoveModal.value = true;
  };

  const confirmRemove = async () => {
    if (!userToRemove.value) return;
    try {
      await remove(userToRemove.value.id as string);
      showToast(t('users.view.userUpdated'));
      closeDetailsModal();
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    } finally {
      showRemoveModal.value = false;
      userToRemove.value = null;
    }
  };

  const cancelRemove = () => {
    showRemoveModal.value = false;
    userToRemove.value = null;
  };

  const handleReactivate = async (user: UserRecord) => {
    try {
      await reactivate(user.id as string);
      showToast(t('users.view.userUpdated'));
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    }
  };

  const handleResend = async (user: UserRecord) => {
    try {
      await resendPassword(user.email as string);
      showToast(t('users.view.resendSuccess', { email: user.email }));
    } catch (e) {
      showToast(handleApiError(e).message, 'error');
    }
  };

  onMounted(load);
</script>
