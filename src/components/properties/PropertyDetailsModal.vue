<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">{{ property.title }}</h3>
        <fwb-badge type="green">{{ property.status }}</fwb-badge>
      </div>
    </template>
    <template #body>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Detalles del Inmueble</h4>
            <ul class="text-sm space-y-2 dark:text-gray-300">
              <li><strong>Dirección:</strong> {{ property.address }}</li>
              <li><strong>Tipo:</strong> {{ property.type }}</li>
              <li><strong>Superficie:</strong> {{ property.m2 }} m²</li>
              <li><strong>Habitaciones:</strong> {{ property.rooms }}</li>
            </ul>
          </div>
          <div class="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 italic">
            Galería de imágenes (HU 1)
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Historial de Precios (HU 2)</h4>
            <div class="max-h-32 overflow-y-auto space-y-2">
              <div v-for="(h, i) in property.priceHistory" :key="i" class="text-[10px] p-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded">
                <span class="text-red-500">${{ h.oldPrice }}</span> ➔ <span class="text-green-500">${{ h.newPrice }}</span>
                <p class="text-gray-400">{{ new Date(h.changedAt).toLocaleDateString() }} por {{ h.changedBy }}</p>
              </div>
              <p v-if="!property.priceHistory?.length" class="text-xs text-gray-500 italic">Sin cambios de precio.</p>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Historial de Agentes (HU 3)</h4>
            <div class="space-y-2">
              <div v-for="(ah, i) in property.assignmentHistory" :key="i" class="text-[10px] p-2 border-l-2 border-blue-500 bg-blue-50 dark:bg-gray-900/50">
                Anterior: {{ ah.agentId }} <br>
                <span class="text-gray-400">Fecha: {{ new Date(ah.assignedAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { FwbModal, FwbBadge } from 'flowbite-vue'
defineProps<{ show: boolean, property: any }>()
defineEmits(['close'])
</script>