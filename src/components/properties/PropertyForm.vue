<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <fwb-input v-model="form.title" label="Título" placeholder="Ej: Apto en el centro" required />
      <fwb-input v-model="form.address" label="Dirección Exacta" placeholder="Calle..." required />
      <fwb-input v-model.number="form.price" type="number" label="Precio ($)" required />
      
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo</label>
        <select v-model="form.type" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white">
          <option value="APARTAMENTO">Apartamento</option>
          <option value="CASA">Casa</option>
          <option value="COMERCIAL">Local Comercial</option>
        </select>
      </div>

      <fwb-input v-model.number="form.m2" type="number" label="Superficie (m²)" required />
      <fwb-input v-model.number="form.rooms" type="number" label="Habitaciones" required />
    </div>

    <div class="mt-4">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fotos del Inmueble (HU1)</label>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        @change="handleFiles"
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      >
      <p class="mt-1 text-xs text-gray-500">JPG, PNG o WEBP.</p>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">Cancelar</fwb-button>
      <fwb-button type="submit" gradient="blue">Confirmar Registro</fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'

const emit = defineEmits(['submit', 'cancel'])
const selectedFiles = ref<File[]>([])

const form = reactive({
  title: '',
  address: '',
  price: 0,
  type: 'APARTAMENTO',
  m2: 0,
  rooms: 0
})

const handleFiles = (e: any) => {
  selectedFiles.value = Array.from(e.target.files)
}

const submit = () => {
  emit('submit', { ...form, files: selectedFiles.value })
}
</script>