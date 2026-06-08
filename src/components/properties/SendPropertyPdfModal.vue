<template>
  <BaseModal
    v-model="localShow"
    :title="t('propertyPdf.sendModalTitle')"
    size="md"
    :z-index="100"
    @update:modelValue="onModelValueUpdate"
  >
    <template #header-icon>
      <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
        <IconLucideMail class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    </template>

    <template #body>
      <div class="space-y-5">
        <p class="text-sm text-secondary">
          {{ t('propertyPdf.sendModalSubtitle', { title: propertyTitle }) }}
        </p>

        <!-- Recipient Section Container -->
        <div class="border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-gray-700/50">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('propertyPdf.recipientSection') }}
            </span>
          </div>

          <!-- Selection mode tabs -->
          <div class="grid grid-cols-2 gap-2 bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-lg">
            <button
              type="button"
              class="py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
              :class="!isManualMode ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              @click="setMode(false)"
            >
              {{ t('propertyPdf.modeRegistered') }}
            </button>
            <button
              type="button"
              class="py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
              :class="isManualMode ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
              @click="setMode(true)"
            >
              {{ t('propertyPdf.modeManual') }}
            </button>
          </div>

          <!-- Mode 1: Registered User -->
          <div v-if="!isManualMode" class="space-y-3">
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {{ t('propertyPdf.selectClientLabel') }}
              </label>
              <select
                v-model="selectedClientId"
                class="app-input w-full text-sm"
                :disabled="loadingClients"
                @change="onClientSelect"
              >
                <option value="">{{ t('propertyPdf.selectClientPlaceholder') }}</option>
                <template v-if="isAdmin">
                  <optgroup :label="t('propertyPdf.groupAgents')">
                    <option
                      v-for="user in agentsList"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.fullName || `${user.firstName} ${user.lastName}` }}
                    </option>
                  </optgroup>
                  <optgroup :label="t('propertyPdf.groupClientsOwners')">
                    <option
                      v-for="user in clientsAndOwnersList"
                      :key="user.id"
                      :value="user.id"
                    >
                      {{ user.fullName || `${user.firstName} ${user.lastName}` }}
                    </option>
                  </optgroup>
                </template>
                <template v-else>
                  <option
                    v-for="user in clientsAndOwnersList"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.fullName || `${user.firstName} ${user.lastName}` }}
                  </option>
                </template>
              </select>
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">
                {{ errors.email }}
              </p>
            </div>

            <!-- Selected Client Info Badge/Card -->
            <div
              v-if="selectedClientInfo"
              class="flex items-center space-x-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/30 transition-all"
            >
              <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase text-sm">
                {{ selectedClientInfo.firstName?.charAt(0) || '' }}{{ selectedClientInfo.lastName?.charAt(0) || '' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                  {{ selectedClientInfo.fullName || `${selectedClientInfo.firstName} ${selectedClientInfo.lastName}` }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center mt-0.5">
                  <IconLucideMail class="h-3 w-3 mr-1 text-gray-400" />
                  {{ selectedClientInfo.email }}
                </p>
              </div>
            </div>

            <!-- Manual Edit Checkbox when client is selected -->
            <div v-if="selectedClientId" class="flex items-center space-x-2 pt-1">
              <input
                id="manual-email-toggle"
                v-model="manualEmailInput"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <label for="manual-email-toggle" class="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                {{ t('propertyPdf.editEmailManually') }}
              </label>
            </div>
          </div>

          <!-- Mode 2: Manual Email or Edit override -->
          <div v-if="isManualMode || (selectedClientId && manualEmailInput)" class="space-y-3">
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                {{ t('propertyPdf.destinationEmail') }}
              </label>
              <input
                v-model="destinationEmail"
                type="email"
                :placeholder="t('propertyPdf.destinationEmailPlaceholder')"
                class="app-input w-full text-sm"
                :class="{ 'border-red-400 dark:border-red-500': errors.email }"
                @input="errors.email = ''"
              />
              <p v-if="errors.email && (isManualMode || manualEmailInput)" class="text-xs text-red-500 mt-1">
                {{ errors.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Optional Message Section -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('propertyPdf.message') }}
            <span class="text-xs text-gray-400 ml-1">{{
              t('common.optionalLabel')
            }}</span>
          </label>
          <textarea
            v-model="message"
            rows="4"
            :placeholder="t('propertyPdf.messagePlaceholder')"
            class="app-input w-full resize-none text-sm"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          :disabled="sending"
          @click="close"
        >
          {{ t('propertyPdf.cancel') }}
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="sending"
          @click="submit"
        >
          {{ sending ? t('propertyPdf.sending') : t('propertyPdf.send') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import IconLucideMail from '~icons/lucide/mail';
import BaseModal from '@/components/ui/BaseModal.vue';
import { propertyService } from '@/modules/properties';
import { userService } from '@/services/userService';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import { handleApiError } from '@/api/errorHandler';

const props = defineProps<{
  show: boolean;
  propertyId: string;
  propertyTitle: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', message: string): void;
  (e: 'error', message: string): void;
}>();

const { t } = useI18n();

const destinationEmail = ref('');
const message = ref('');
const sending = ref(false);
const errors = ref({ email: '' });

const clients = ref<any[]>([]);
const selectedClientId = ref('');
const loadingClients = ref(false);
const manualEmailInput = ref(false);
const isManualMode = ref(false);

const authStore = useAuthStore();

const isAdmin = computed(() => {
  const u = authStore.user as UserClaims | null;
  if (!u) return false;
  const roles = Array.isArray(u.roles) ? u.roles.map(String) : [];
  const normalizedRoles = roles.map((role) => role.toUpperCase());
  return (
    normalizedRoles.includes('ADMIN') ||
    normalizedRoles.includes('ROLE_ADMIN') ||
    String(u.role || '').toUpperCase() === 'ADMIN' ||
    u.userType === 'ADMIN'
  );
});

const agentsList = computed(() => {
  return clients.value.filter(
    (u) => u.userType === 'EMPLOYEE' || u.userType === 'ADMIN'
  );
});

const clientsAndOwnersList = computed(() => {
  return clients.value.filter(
    (u) => u.userType === 'INTERESTED_CLIENT' || u.userType === 'OWNER'
  );
});

const selectedClientInfo = computed(() => {
  if (!selectedClientId.value) return null;
  return clients.value.find((c) => c.id === selectedClientId.value) || null;
});

const localShow = computed({
  get: () => props.show,
  set: (val) => {
    if (!val) close();
  },
});

function onModelValueUpdate(val: boolean) {
  if (!val) close();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function loadClients() {
  loadingClients.value = true;
  try {
    const response = await userService.getUsers(0, 1000, 'ACTIVE');
    clients.value = response.data || [];
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    loadingClients.value = false;
  }
}

function onClientSelect() {
  const selected = clients.value.find((c) => c.id === selectedClientId.value);
  if (selected && selected.email) {
    destinationEmail.value = selected.email;
    errors.value.email = '';
  } else {
    destinationEmail.value = '';
  }
  manualEmailInput.value = false;
}

function setMode(manual: boolean) {
  isManualMode.value = manual;
  selectedClientId.value = '';
  destinationEmail.value = '';
  errors.value.email = '';
  manualEmailInput.value = false;
}

async function submit() {
  errors.value.email = '';

  if (!isManualMode.value && !selectedClientId.value) {
    errors.value.email = t('propertyPdf.clientRequired');
    return;
  }

  const email = destinationEmail.value.trim();

  if (!email) {
    errors.value.email = t('propertyPdf.emailRequired');
    return;
  }
  if (!isValidEmail(email)) {
    errors.value.email = t('propertyPdf.emailInvalid');
    return;
  }

  sending.value = true;
  try {
    const apiMessage = await propertyService.sendPropertyPdfEmail(
      props.propertyId,
      {
        destinationEmail: email,
        message: message.value.trim() || undefined,
      }
    );
    emit('success', apiMessage);
    close();
  } catch (err) {
    const errorMessage = handleApiError(err).message;
    emit('error', errorMessage);
  } finally {
    sending.value = false;
  }
}

function close() {
  emit('close');
  destinationEmail.value = '';
  message.value = '';
  errors.value.email = '';
  selectedClientId.value = '';
  manualEmailInput.value = false;
  isManualMode.value = false;
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      loadClients();
    } else {
      destinationEmail.value = '';
      message.value = '';
      errors.value.email = '';
      selectedClientId.value = '';
      manualEmailInput.value = false;
      isManualMode.value = false;
    }
  },
  { immediate: true }
);
</script>
