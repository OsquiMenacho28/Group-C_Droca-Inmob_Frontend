<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="space-y-4">
      <fwb-input 
        v-model="form.title" 
        label="Título del Inmueble" 
        placeholder="Ej: Penthouse de Lujo" 
        required 
      />
      
      <fwb-input 
        v-model="form.address" 
        label="Dirección" 
        placeholder="Av. Principal #123" 
        required 
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fwb-input 
          v-model.number="form.price" 
          type="number" 
          label="Precio ($)" 
          placeholder="0.00"
          required 
        />
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Inmueble</label>
          <select v-model="form.type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="APARTAMENTO">Apartamento</option>
            <option value="CASA">Casa</option>
            <option value="TERRENO">Terreno</option>
            <option value="COMERCIAL">Local Comercial</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fwb-input 
          v-model.number="form.m2" 
          type="number" 
          label="Superficie (m²)" 
          required 
        />
        <fwb-input 
          v-model.number="form.rooms" 
          type="number" 
          label="Habitaciones" 
          required 
        />
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">Cancelar</fwb-button>
      <fwb-button type="submit" gradient="blue">Confirmar Registro</fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import type { PropertyFormPayload } from '../../types/property'

const emit = defineEmits(['submit', 'cancel'])

const form = reactive<PropertyFormPayload>({
  title: '',
  address: '',
  price: 0,
  type: 'APARTAMENTO',
  m2: 0,
  rooms: 0
})

const submit = () => emit('submit', { ...form })
</script>