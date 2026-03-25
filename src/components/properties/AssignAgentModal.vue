<!-- FILE: src/components/properties/AssignAgentModal.vue -->
<template>
  <fwb-modal v-if="show" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">Asignar Responsable</div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Inmueble: <span class="font-bold">{{ property?.title }}</span></p>
        <select v-model="selectedId" class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white">
          <option :value="null" disabled>Seleccione un empleado...</option>
          <option v-for="a in agents" :key="a.id" :value="a.id">
            {{ a.fullName }} ({{ a.userType }})
          </option>
        </select>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <fwb-button color="alternative" @click="$emit('close')">Cancelar</fwb-button>
        <fwb-button :disabled="!selectedId" gradient="blue" @click="confirm">Confirmar</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FwbModal, FwbButton } from 'flowbite-vue'
const props = defineProps<{ show: boolean, property: any, agents: any[] }>()
const emit = defineEmits(['close', 'confirm'])
const selectedId = ref(null)

const confirm = () => {
  if (selectedId.value) {
    emit('confirm', selectedId.value)
    selectedId.value = null
  }
}
</script>