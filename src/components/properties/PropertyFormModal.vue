<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEditing ? t('adminProperties.editProperty') : t('adminProperties.registerProperty')"
    size="2xl"
    :show-close-button="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #body>
      <!-- Scrollable content area for large forms -->
      <div
        class="max-h-[calc(100vh-200px)] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
      >
        <PropertyForm
          v-if="modelValue"
          :key="formKey"
          :initial-data="initialData"
          :property-id="propertyId"
          @submit="handleSubmit"
          @cancel="$emit('update:modelValue', false)"
          @location-updated="$emit('location-updated', $event)"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import BaseModal from '@/components/ui/BaseModal.vue';
  import PropertyForm from '@/components/properties/PropertyForm.vue';
  import type { Property, PropertyFormPayload } from '@/types/property';

  defineProps<{
    modelValue: boolean;
    isEditing: boolean;
    initialData?: Record<string, unknown>;
    propertyId?: string;
    formKey?: number;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [data: PropertyFormPayload];
    'location-updated': [property: Property];
  }>();

  const { t } = useI18n();

  const handleSubmit = (data: PropertyFormPayload) => {
    emit('submit', data);
  };
</script>
