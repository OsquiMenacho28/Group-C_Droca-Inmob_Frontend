<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <fwb-input v-model="form.title" label="Título" placeholder="Ej: Apto en el centro" required />
      <fwb-input v-model="form.address" label="Dirección Exacta" placeholder="Calle..." required />
      
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Operación *</label>
        <select v-model="form.operationType" required class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white">
          <option value="" disabled>Seleccione una opción</option>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
          <option value="ANTICRETICO">Anticrético</option>
        </select>
        <p v-if="showValidation && !form.operationType" class="text-red-500 text-xs mt-1">El tipo de operación es obligatorio</p>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Inmueble</label>
        <select v-model="form.type" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white">
          <option value="APARTAMENTO">Apartamento</option>
          <option value="CASA">Casa</option>
          <option value="COMERCIAL">Local Comercial</option>
        </select>
      </div>

      <fwb-input v-model.number="form.price" type="number" label="Precio ($)" required />
      <fwb-input v-model.number="form.m2" type="number" label="Superficie (m²)" required />
      <fwb-input v-model.number="form.rooms" type="number" label="Habitaciones" required />

      <div class="col-span-2">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Propietario (Opcional)</label>
        <select v-model="form.ownerId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white">
          <option value="">Sin propietario asignado</option>
          <option v-for="owner in owners" :key="owner.id" :value="owner.id">
            {{ owner.fullName || owner.name }} - {{ owner.email }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">Cancelar</fwb-button>
      <fwb-button type="submit" gradient="blue">Confirmar Registro</fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import { userService } from '../../services/userService'

const emit = defineEmits(['submit', 'cancel'])
const owners = ref<any[]>([])
const showValidation = ref(false)

const form = reactive({
  title: '',
  address: '',
  price: 0,
  type: 'APARTAMENTO',
  operationType: '', // Inicia vacío para PA1
  m2: 0,
  rooms: 0,
  ownerId: ''
})

const loadOwners = async () => {
  try {
    const users = await userService.getUsers()
    owners.value = users.filter((u: any) => u.userType === 'OWNER' && u.status === 'ACTIVE')
  } catch (error) {
    console.error('Error loading owners:', error)
  }
}

const submit = () => {
  showValidation.value = true
  if (!form.operationType) return // Detener si falta campo obligatorio
  
  emit('submit', { ...form, ownerId: form.ownerId || null })
}

onMounted(loadOwners)
</script>