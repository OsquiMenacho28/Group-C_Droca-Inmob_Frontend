<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="lg">
    <template #header>
      <div class="text-lg font-bold dark:text-white">
        {{ t('adminProperties.registerClosureTitle') }}
      </div>
    </template>
    <template #body>
      <div v-if="loadingUsers" class="text-center py-10">
        <fwb-spinner size="8" />
      </div>
      <div v-else class="space-y-6">
        <!-- Property Snapshot -->
        <div
          class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600"
        >
          <p class="text-xs text-gray-400 uppercase font-bold">
            {{ t('adminProperties.property') }}
          </p>
          <p class="text-sm font-semibold dark:text-white">{{ property.title }}</p>
          <div class="flex gap-4 mt-2">
            <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              {{ t('propertyTypes.' + property.type) }}
            </span>
            <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
              {{ t('propertyOperations.' + property.operationType) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fwb-input
            v-model.number="form.finalPrice"
            type="number"
            :label="t('adminProperties.finalPrice')"
            required
          />
          <fwb-select
            v-model="form.currency"
            :label="t('adminProperties.currency')"
            :options="currencyOptions"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <fwb-input
            v-model="form.closingDate"
            type="date"
            :label="t('adminProperties.closingDate')"
            required
          />
          <fwb-select
            v-model="form.agentId"
            :label="t('adminProperties.agent')"
            :options="agentOptions"
            :disabled="!isAdmin"
          />
        </div>

        <fwb-select
          v-model="form.clientId"
          :label="t('operations.client')"
          :options="clientOptions"
        />

        <fwb-textarea
          v-model="form.notes"
          :rows="3"
          :label="t('adminProperties.notes')"
          :placeholder="t('scheduleVisit.notesPlaceholder')"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button
          @click="handlePreSubmit"
          gradient="green"
          :disabled="submitting || !form.clientId"
        >
          {{ submitting ? t('common.processing') : t('adminProperties.registerClosure') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>

  <!-- Confirmation Modal -->
  <ConfirmModal
    :show="showConfirmModal"
    :title="t('common.areYouSure')"
    :message="t('operations.irreversibleWarning')"
    :confirm-text="t('operations.confirmClosure')"
    type="warning"
    :loading="submitting"
    @close="showConfirmModal = false"
    @confirm="submit"
  />

  <!-- Global Toast -->
  <AppToast
    :show="toast.show"
    :message="toast.message"
    :type="toast.type"
    @close="toast.show = false"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { FwbModal, FwbInput, FwbButton, FwbSpinner, FwbSelect, FwbTextarea } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { apiClient as api } from '@/api';
  import { userService } from '@/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import type { Property } from '@/types/property';
  import type { User } from '@/types/user';
  import type { OperationData, ClosureForm, SelectOption } from '@/types/operation';
  import ConfirmModal from '@/components/ui/ConfirmModal.vue';
  import AppToast from '@/components/ui/AppToast.vue';

  // Define specialized user types based on global User
  interface Agent extends User {
    userType: 'EMPLOYEE' | 'ADMIN';
    department: string;
  }

  interface Client extends User {
    userType: 'INTERESTED_CLIENT';
  }

  const props = defineProps<{
    show: boolean;
    property: Property;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const { t } = useI18n();
  const authStore = useAuthStore();

  const loadingUsers = ref(false);
  const submitting = ref(false);
  const agents = ref<Agent[]>([]);
  const clients = ref<Client[]>([]);

  // UI States
  const showConfirmModal = ref(false);
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const currencyOptions: SelectOption[] = [
    { value: 'USD', name: 'USD' },
    { value: 'BOB', name: 'BOB' },
  ];

  const agentOptions = computed<SelectOption[]>(() =>
    agents.value.map((agent) => ({
      value: agent.id,
      name: agent.fullName,
    }))
  );

  const clientOptions = computed<SelectOption[]>(() => [
    { value: '', name: t('adminProperties.selectClient') },
    ...clients.value.map((client) => ({
      value: client.id,
      name: client.fullName,
    })),
  ]);

  const form = reactive<ClosureForm>({
    finalPrice: props.property.price || 0,
    currency: 'USD',
    closingDate: new Date().toISOString().split('T')[0],
    agentId: props.property.assignedAgentId || '',
    clientId: '',
    notes: '',
  });

  const isAdmin = computed(() => {
    const user = authStore.user as UserClaims | null;
    return user?.roles?.includes('ADMIN') || user?.userType === 'ADMIN';
  });

  onMounted(async () => {
    loadingUsers.value = true;
    try {
      const response = await userService.getUsers(0, 1000);
      const allUsers = (response.data || []) as User[];

      agents.value = allUsers.filter(
        (user): user is Agent =>
          (user.userType === 'EMPLOYEE' || user.userType === 'ADMIN') && user.status === 'ACTIVE'
      ) as Agent[];

      clients.value = allUsers.filter(
        (user): user is Client => user.userType === 'INTERESTED_CLIENT' && user.status === 'ACTIVE'
      ) as Client[];

      // If current user is agent and not admin, force their ID
      const user = authStore.user as UserClaims | null;
      const userId = user?.userId || user?.sub;
      if (!isAdmin.value && userId) {
        form.agentId = userId;
      }
    } catch (err) {
      console.error('Error loading users for closure:', err);
    } finally {
      loadingUsers.value = false;
    }
  });

  const handlePreSubmit = () => {
    if (!form.clientId || !form.agentId) return;
    showConfirmModal.value = true;
  };

  const submit = async () => {
    submitting.value = true;
    try {
      const client = clients.value.find((c) => c.id === form.clientId);
      const agent = agents.value.find((a) => a.id === form.agentId);
      const ownerResponse = await userService.getUserById(props.property.ownerId || '');
      const owner = ownerResponse.data as User;

      const operationData: OperationData = {
        propertyId: props.property.id,
        propertyName: props.property.title,
        propertyType: props.property.type || '',
        operationType: props.property.operationType || '',

        finalPrice: form.finalPrice,
        currency: form.currency,

        clientId: form.clientId,
        clientName: client?.fullName || 'Unknown Client',

        agentId: form.agentId,
        agentName: agent?.fullName || 'Unknown Agent',
        department: agent?.department || '',

        ownerId: props.property.ownerId || '',
        ownerName: owner?.fullName || 'Unknown Owner',

        status: 'CLOSED',
        notes: form.notes,
        closureDate: new Date(form.closingDate).toISOString(),
      };

      await api.post('/operations', operationData);

      showConfirmModal.value = false;
      emit('success');
    } catch (err: unknown) {
      console.error('Error registering closure:', err);
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || error.message || t('common.error');

      toast.message = msg;
      toast.type = 'error';
      toast.show = true;
      showConfirmModal.value = false;
    } finally {
      submitting.value = false;
    }
  };
</script>
