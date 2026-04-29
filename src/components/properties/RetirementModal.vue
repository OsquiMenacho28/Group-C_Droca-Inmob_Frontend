<template>
  <fwb-modal v-if="show" @close="close" size="md">
    <template #header>
      <div class="text-xl font-bold text-gray-900 dark:text-white">
        {{ t('retirement.title') }}
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('retirement.subtitle') }}
        </p>

        <!-- Motivo selector -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('retirement.motivo') }}
          </label>
          <div v-if="loadingReasons" class="flex items-center gap-2 text-sm text-gray-500">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            {{ t('common.loading') }}
          </div>
          <div v-else-if="reasonsError" class="text-sm text-red-500">
            {{ reasonsError }}
            <button @click="loadReasons" class="ml-2 underline">Reintentar</button>
          </div>
          <select
            v-else
            v-model="selectedReason"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            :class="{ 'border-red-400 dark:border-red-500': errors.reason }"
            @change="errors.reason = ''"
          >
            <option value="" disabled>{{ t('common.selectOption') }}</option>
            <option v-for="reason in reasons" :key="reason" :value="reason">
              {{ getReasonLabel(reason) }}
            </option>
          </select>
          <p v-if="errors.reason" class="text-xs text-red-500 mt-1">{{ errors.reason }}</p>
        </div>

        <!-- Detalle adicional -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('retirement.detalle') }}
            <span class="text-xs text-gray-400 ml-1">({{ t('common.optionalLabel') }})</span>
          </label>
          <textarea
            v-model="detail"
            rows="2"
            :placeholder="t('retirement.detallePlaceholder')"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            :class="{ 'border-red-400 dark:border-red-500': errors.detail }"
            @input="errors.detail = ''"
          />
          <p v-if="errors.detail" class="text-xs text-red-500 mt-1">{{ errors.detail }}</p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <fwb-button color="alternative" @click="close">
          {{ t('retirement.cancel') }}
        </fwb-button>
        <fwb-button gradient="red" @click="submit" :disabled="submitting || loadingReasons">
          {{ submitting ? t('common.processing') : t('retirement.confirm') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { apiClient as api } from '@/api';
  import { handleApiError } from '@/api/errorHandler';

  const props = defineProps<{
    show: boolean;
    propertyId: string;
    propertyTitle: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const { t } = useI18n();

  const reasons = ref<string[]>([]);
  const loadingReasons = ref(false);
  const reasonsError = ref<string | null>(null);
  const selectedReason = ref('');
  const detail = ref('');
  const submitting = ref(false);
  const errors = ref({ reason: '', detail: '' });

  function getReasonLabel(reason: string): string {
    const key = `retirement.reason${reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase()}`;
    const translation = t(key);
    return translation !== key ? translation : reason;
  }

  async function loadReasons() {
    loadingReasons.value = true;
    reasonsError.value = null;
    try {
      const response = await api.get('/catalogos/motivos-retiro');
      reasons.value = response.data.data || [];
    } catch (err) {
      console.warn('API de catálogo no disponible, usando valores por defecto');
      // Fallback: valores del enum
      reasons.value = ['VENTA_EXTERNA', 'DECISION_PROPIETARIO', 'OTRO'];
    } finally {
      loadingReasons.value = false;
    }
  }

  async function submit() {
    errors.value = { reason: '', detail: '' };
    
    if (!selectedReason.value) {
      errors.value.reason = t('retirement.motivoRequired');
      return;
    }
    
    if (selectedReason.value === 'OTRO' && !detail.value.trim()) {
      errors.value.detail = t('retirement.detalleRequired');
      return;
    }

    submitting.value = true;
    try {
      await api.post(`/properties/${props.propertyId}/retirar`, {
        motivoRetiro: selectedReason.value,
        detalleRetiro: detail.value.trim() || null,
      });
      emit('success');
      close();
    } catch (err) {
      const errorMsg = handleApiError(err).message;
      alert(errorMsg);
    } finally {
      submitting.value = false;
    }
  }

  function close() {
    emit('close');
    selectedReason.value = '';
    detail.value = '';
    errors.value = { reason: '', detail: '' };
  }

  // Cargar motivos cuando el modal se abre
  watch(
    () => props.show,
    (newVal) => {
      if (newVal) {
        loadReasons();
      }
    },
    { immediate: true }
  );
</script>