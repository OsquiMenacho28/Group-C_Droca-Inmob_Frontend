<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('agentClients.title') }}</h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">{{ t('agentClients.subtitle') }}</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">
          {{ t('common.agent') }} {{ authStore.user?.fullName || t('common.advisor') }}
        </fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">
          <div class="flex items-center">
            <IconLucidePlus class="w-4 h-4 mr-2" />
            {{ t('agentClients.newClient') }}
          </div>
        </fwb-button>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
    >
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconLucideSearch class="w-5 h-5 text-gray-400" />
        </div>
        <input
          v-model="searchName"
          type="text"
          :placeholder="t('agentClients.searchPlaceholder')"
          class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card
        v-for="c in filteredClients"
        :key="c.id"
        class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative dark:bg-gray-800"
      >
        <button
          @click="openDetails(c)"
          class="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110"
          :title="t('clientDetails.changeHistory')"
        >
          <IconLucideClock class="w-5 h-5" />
        </button>

        <div
          class="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative"
        >
          <div
            class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black uppercase shadow-inner"
          >
            {{ c.firstName?.charAt(0) }}{{ c.lastName?.charAt(0) }}
          </div>
          <div class="absolute bottom-2 right-2">
            <fwb-badge type="indigo">
              {{ c.preferredPropertyType || t('clientDetails.notDefined') }}
            </fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {{ c.fullName || `${c.firstName} ${c.lastName}` }}
          </h5>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">{{ c.email }}</p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                {{ t('clientDetails.budget') }}
              </p>
              <p class="text-2xl font-black text-green-600">
                ${{ Number(c.budget || 0).toLocaleString() }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">
                {{ t('clientDetails.preferredZone') }}
              </p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ c.preferredZone || t('clientDetails.any') }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <fwb-button size="sm" color="alternative" @click="openEditModal(c)" class="w-full">
              {{ t('agentClients.editProfile') }}
            </fwb-button>
            <fwb-button size="sm" gradient="blue" @click="openDetails(c)" class="w-full">
              {{ t('agentClients.details') }}
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <Pagination
      v-if="!loading && totalPages > 1"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :total="totalClients"
      @change="loadClients"
    />

    <div
      v-if="!loading && filteredClients.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500 dark:text-gray-400">{{ t('agentClients.emptyText') }}</p>
    </div>

    <client-details-modal
      v-if="showDetailsModal && selectedClient"
      :show="showDetailsModal"
      :client="selectedClient"
      @close="showDetailsModal = false"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold dark:text-white">
          {{ isEditing ? t('agentClients.editTitle') : t('agentClients.createTitle') }}
        </div>
      </template>
      <template #body>
        <user-form
          v-if="showModal"
          :key="formKey"
          :initial-data="editingClient || undefined"
          :is-editing="isEditing"
          :client-only="true"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideClock from '~icons/lucide/clock';
  import { ref, computed, onMounted, watch } from 'vue';
  import { FwbButton, FwbBadge, FwbModal, FwbCard } from 'flowbite-vue';
  import { personService } from '@/services/personService';
  import { userService } from '@/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useI18n } from 'vue-i18n';
  import { handleApiError } from '@/api/errorHandler';
  import type { User } from '@/types/user';

  import UserForm from '@/components/users/UserForm.vue';
  import ClientDetailsModal from '@/components/users/ClientDetailsModal.vue';
  import Pagination from '@/components/ui/Pagination.vue';

  const { t } = useI18n();

  const authStore = useAuthStore();
  const clients = ref<User[]>([]);
  const loading = ref(false);
  const showModal = ref(false);
  const showDetailsModal = ref(false);
  const isEditing = ref(false);
  const editingClient = ref<Record<string, unknown> | null>(null);
  const selectedClient = ref<Record<string, unknown> | null>(null);
  const formKey = ref(0);
  const searchName = ref('');

  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalClients = ref(0);

  const filteredClients = computed(() => {
    if (!searchName.value.trim()) return clients.value;
    const term = searchName.value.toLowerCase();
    return clients.value.filter((c) =>
      (c.fullName || `${c.firstName} ${c.lastName}`).toLowerCase().includes(term)
    );
  });

  const loadClients = async () => {
    loading.value = true;
    try {
      const res = await userService.getUsers(currentPage.value, pageSize.value);
      const baseUsers = res.data || [];
      const u = authStore.user as UserClaims | null;
      const agentId = u?.sub || u?.userId;

      // Filter for clients assigned to this agent
      const filteredBase = baseUsers.filter((u: User) => {
        return u.userType === 'INTERESTED_CLIENT' && (!agentId || u.assignedAgentId === agentId);
      });

      // Lazy load profile details
      clients.value = await Promise.all(
        filteredBase.map(async (u: User) => {
          try {
            const profile = await personService.getPersonByAuthUserId(u.id);
            return {
              ...u,
              ...profile,
              authUserId: u.id,
              personId: profile.id as string,
            };
          } catch {
            return { ...u, authUserId: u.id, personId: undefined };
          }
        })
      );

      totalClients.value = res.meta?.total || 0;
      totalPages.value = Math.ceil(totalClients.value / pageSize.value);
    } catch (e) {
      console.error('Error loading clients:', e);
    } finally {
      loading.value = false;
    }
  };

  watch(pageSize, () => {
    currentPage.value = 0;
    loadClients();
  });

  const openEditModal = (client: User) => {
    editingClient.value = { ...client } as Record<string, unknown>;
    isEditing.value = true;
    formKey.value++;
    showModal.value = true;
  };

  const openCreateModal = () => {
    editingClient.value = null;
    isEditing.value = false;
    formKey.value++;
    showModal.value = true;
  };

  const openDetails = (client: User) => {
    selectedClient.value = client as unknown as Record<string, unknown>;
    showDetailsModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    try {
      if (isEditing.value && editingClient.value) {
        const payload = {
          firstName:
            (formData.firstName as string) || (editingClient.value.firstName as string) || '',
          lastName: (formData.lastName as string) || (editingClient.value.lastName as string) || '',
          email: (formData.email as string) || (editingClient.value.email as string) || '',
          ...formData,
        };
        await personService.updateClientForAgent(editingClient.value.id as string, payload);
      } else {
        const u = authStore.user as UserClaims | null;
        const agentId = u?.sub || u?.userId;
        await userService.createUser({
          ...formData,
          userType: 'INTERESTED_CLIENT',
          assignedAgentId: agentId,
        });
      }
      await loadClients();
      closeModal();
    } catch (e) {
      console.error(handleApiError(e).message);
    }
  };

  onMounted(loadClients);
</script>
