<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="3xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() }}
        </h3>
        <fwb-badge type="yellow">{{ t('ownerDetails.profileBadge') }}</fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">
              {{ t('ownerDetails.ownerInfo') }}
            </h4>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <span class="text-gray-500">{{ t('ownerDetails.email') }}</span>
                <span class="text-right dark:text-white">
                  {{ owner.email || t('common.notSpecified') }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-gray-500">{{ t('ownerDetails.phone') }}</span>
                <span class="text-right dark:text-white">
                  {{ owner.phone || t('common.notSpecified') }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-gray-500">{{ t('ownerDetails.taxId') }}</span>
                <span class="text-right dark:text-white">
                  {{ owner.taxId || t('common.notSpecified') }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-gray-500">{{ t('ownerDetails.status') }}</span>
                <span
                  class="text-right font-semibold"
                  :class="
                    owner.status === 'ACTIVE'
                      ? 'text-green-600'
                      : 'text-gray-500 dark:text-gray-300'
                  "
                >
                  {{
                    owner.status === 'ACTIVE'
                      ? t('users.status.active')
                      : owner.status === 'INACTIVE'
                        ? t('users.status.inactive')
                        : owner.status || t('common.notSpecified')
                  }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              {{ t('ownerDetails.summary') }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
              {{ t('ownerDetails.summaryText') }}
            </p>
          </div>
        </div>

        <IdentityDocumentsSection :person-id="owner.personId" :auth-user-id="owner.authUserId" />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')">{{ t('common.close') }}</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { FwbBadge, FwbButton, FwbModal } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IdentityDocumentsSection from '@/components/users/IdentityDocumentsSection.vue';

  interface OwnerRecord {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    taxId?: string;
    status?: string;
    personId?: string;
    authUserId?: string;
    [key: string]: unknown;
  }

  defineProps<{ show: boolean; owner: OwnerRecord }>();
  defineEmits(['close']);

  const { t } = useI18n();
</script>
