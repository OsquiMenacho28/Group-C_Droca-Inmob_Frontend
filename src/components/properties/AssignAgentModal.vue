<template>
  <fwb-modal v-if="show" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-semibold">Asignar Agente Responsable</div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Selecciona un agente activo para gestionar el inmueble: <strong>{{ property?.title }}</strong></p>
        
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccionar Agente</label>
          <select v-model="selectedAgentId" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option :value="null" disabled>Seleccione un agente...</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">
              {{ agent.fullName }} ({{ agent.email }})
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <fwb-button color="alternative" @click="$emit('close')">Cancelar</fwb-button>
        <fwb-button :disabled="!selectedAgentId" gradient="blue" @click="confirm">Confirmar Asignación</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FwbModal, FwbButton } from 'flowbite-vue'

const props = defineProps<{
  show: boolean,
  property: any,
  agents: any[]
}>()

const emit = defineEmits(['close', 'confirm'])
const selectedAgentId = ref<string | null>(null)

const confirm = () => {
  if (selectedAgentId.value) {
    emit('confirm', selectedAgentId.value)
    selectedAgentId.value = null
  }
}
</script>