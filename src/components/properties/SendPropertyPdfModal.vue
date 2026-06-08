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
      <div class="space-y-4">
        <p class="text-sm text-secondary">
          {{ t('propertyPdf.sendModalSubtitle', { title: propertyTitle }) }}
        </p>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('propertyPdf.destinationEmail') }}
          </label>
          <input
            v-model="destinationEmail"
            type="email"
            :placeholder="t('propertyPdf.destinationEmailPlaceholder')"
            class="app-input w-full"
            :class="{ 'border-red-400 dark:border-red-500': errors.email }"
            @input="errors.email = ''"
          />
          <p v-if="errors.email" class="text-xs text-red-500 mt-1">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
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
            class="app-input w-full resize-none"
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

async function submit() {
  errors.value.email = '';
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
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) {
      destinationEmail.value = '';
      message.value = '';
      errors.value.email = '';
    }
  }
);
</script>
