<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">{{ property.title }}</h3>
        <fwb-badge type="green">{{ property.status }}</fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Columna Izquierda: Especificaciones e Imágenes -->
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
             <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Ficha Técnica</h4>
             <div class="grid grid-cols-2 gap-y-3 text-sm">
               <span class="text-gray-500 font-medium">Ubicación:</span> 
               <span class="dark:text-white text-right">{{ property.address }}</span>
               
               <span class="text-gray-500 font-medium">Área:</span> 
               <span class="dark:text-white text-right">{{ property.m2 }} m²</span>
               
               <span class="text-gray-500 font-medium">Dormitorios:</span> 
               <span class="dark:text-white text-right">{{ property.rooms }}</span>
               
               <span class="text-gray-500 font-medium">Tipo:</span> 
               <span class="dark:text-white text-right">{{ property.type }}</span>
             </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(img, idx) in property.imageUrls" :key="idx" class="h-32 rounded-lg overflow-hidden bg-gray-200">
               <img :src="img" class="w-full h-full object-cover">
            </div>
            <div v-if="!property.imageUrls?.length" class="col-span-2 py-10 text-center bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 italic text-sm border-2 border-dashed">
              No hay fotos disponibles para este inmueble
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Auditoría Histórica -->
        <div class="space-y-6">
          
          <!-- HISTORIAL DE PRECIOS -->
          <div class="relative pl-6 border-l-2 border-yellow-400">
            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900"></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">Evolución de Precio</h4>
            
            <div v-if="property.priceHistory?.length" class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(h, i) in property.priceHistory" :key="i" class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400 line-through">${{ h.oldPrice.toLocaleString() }}</span>
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    <span class="text-sm font-bold text-green-600">${{ h.newPrice.toLocaleString() }}</span>
                  </div>
                  <span class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 font-mono">{{ formatDate(h.changedAt) }}</span>
                </div>
                <p class="text-[10px] text-gray-400">Modificado por: <span class="text-gray-600 dark:text-gray-300 font-medium">{{ h.changedBy }}</span></p>
              </div>
            </div>
            <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic">
              Precio original sin modificaciones.
            </div>
          </div>

          <!-- HISTORIAL DE RESPONSABLES -->
          <div class="relative pl-6 border-l-2 border-blue-500">
            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">Registro de Asignaciones</h4>

            <div v-if="property.assignmentHistory?.length" class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="(ah, i) in property.assignmentHistory" :key="i" class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                <p class="text-xs dark:text-gray-200">Agente previo: <span class="font-bold text-blue-600">{{ ah.agentId }}</span></p>
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <p class="text-[10px] text-gray-400">Asignado por: {{ ah.assignedBy }}</p>
                  <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(ah.assignedAt) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic">
              Se mantiene el asesor inicial.
            </div>
          </div>

        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')">Cerrar</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue'

defineProps<{ 
  show: boolean, 
  property: any 
}>()

defineEmits(['close'])

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}
</style>