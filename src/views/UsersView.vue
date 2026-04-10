<!-- FILE: Frontend/Frontend/src/views/UsersView.vue -->

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Gestión de Usuarios</h1>
    </div>

    <!-- Barra de búsqueda por CI -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="searchCI"
              type="text"
              class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Buscar por CI/NIT (ej: 1234567)"
              @input="handleSearch"
            />
          </div>
          <p v-if="searchCI && filteredUsers.length === 0 && users.length > 0" class="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ No se encontraron usuarios con CI: "{{ searchCI }}"
          </p>
          <p v-if="searchCI && filteredUsers.length > 0" class="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ Se encontraron {{ filteredUsers.length }} usuario(s) con CI que contiene "{{ searchCI }}"
          </p>
        </div>
        <div class="flex gap-2">
          <fwb-button v-if="searchCI" @click="clearSearch" color="alternative" size="sm">
            Limpiar búsqueda
          </fwb-button>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar:</label>
            <fwb-button
              :color="statusFilter === 'ALL' ? 'blue' : 'gray'"
              size="sm"
              @click="statusFilter = 'ALL'"
            >
              Todos
            </fwb-button>
            <fwb-button
              :color="statusFilter === 'ACTIVE' ? 'blue' : 'gray'"
              size="sm"
              @click="statusFilter = 'ACTIVE'"
            >
              Activos
            </fwb-button>
            <fwb-button
              :color="statusFilter === 'INACTIVE' ? 'blue' : 'gray'"
              size="sm"
              @click="statusFilter = 'INACTIVE'"
            >
              Inactivos
            </fwb-button>
          </div>

        </div>
      </div>
    </div>

    <!-- Tabla de usuarios con datos filtrados -->
    <users-table
      :users="filteredUsers"
      :roles="roles"
      :total-users="filteredUsers.length"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="handleDeactivate"
      @resend="handleResend"
      @reactivate="handleReactivate"
      @viewDetails="openDetailsModal"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario' }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingUser"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <fwb-modal v-if="showDetailsModal" @close="closeDetailsModal">
      <template #header>
        <div class="text-lg font-semibold">
          Detalles del Cliente: {{ selectedUser?.fullName || selectedUser?.email }}
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.fullName || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.email || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.phone || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">CI / NIT</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.taxId || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Usuario</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.userType || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.status || 'N/A' }}</p>
            </div>
          </div>

          <!-- Mostrar campos específicos según el tipo -->
          <div v-if="selectedUser?.userType === 'OWNER'" class="border-t pt-4">
            <h3 class="text-md font-semibold mb-2">Información del Propietario</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.address || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Propiedades</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.propertyIds?.length || 0 }} propiedades</p>
              </div>
            </div>
          </div>

          <div v-if="selectedUser?.userType === 'INTERESTED_CLIENT'" class="border-t pt-4">
            <h3 class="text-md font-semibold mb-2">Preferencias del Cliente</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Presupuesto</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.budget ? `$${selectedUser.budget}` : 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Zona Preferida</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.preferredZone || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Propiedad</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.preferredPropertyType || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Habitaciones</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser?.preferredRooms || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Botón de dar de baja solo si está inactivo -->
          <div v-if="selectedUser?.status === 'INACTIVE'" class="border-t pt-4 flex justify-end">
            <fwb-button @click="handleRemove(selectedUser)" color="red">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Dar de baja
              </div>
            </fwb-button>
          </div>
        </div>
      </template>
    </fwb-modal>

    <!-- Toast/Alert for feedback -->
    <div
      v-if="toast.visible"
      :class="[
        'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all max-w-md',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { FwbModal, FwbButton } from 'flowbite-vue'
import Swal from 'sweetalert2'
import { useUsers } from '../composables/useUsers'
import UserForm from '../components/users/UserForm.vue'
import UsersTable from '../components/users/UsersTable.vue'

const { users, roles, load, create, remove, deactivate, reactivate, resendPassword, update } = useUsers()
const showModal = ref(false)
const isEditing = ref(false)
const editingUser = ref<any>(null)
const formKey = ref(0)

//Estado para búsqueda por CI
const searchCI = ref('')
const searchTimeout = ref<ReturnType<typeof setTimeout>>()

//Estado para filtro de estado
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

const toast = ref({ visible: false, message: '', type: 'success' })

const showDetailsModal = ref(false)
const selectedUser = ref<any>(null)

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 5000)
}

// ✅ NUEVO: Filtrar usuarios por CI y estado
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtro por CI
  if (searchCI.value && searchCI.value.trim() !== '') {
    const searchTerm = searchCI.value.trim().toLowerCase()
    filtered = filtered.filter(user => {
      const taxId = user.taxId?.toLowerCase() || ''
      return taxId.includes(searchTerm)
    })
  }

  // Filtro por estado
  if (statusFilter.value !== 'ALL') {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  return filtered
})

// ✅ NUEVO: Manejar búsqueda con debounce
const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // La búsqueda ya se maneja con el computed filteredUsers
    // Solo mostramos feedback visual
  }, 300)
}

// ✅ NUEVO: Limpiar búsqueda
const clearSearch = () => {
  searchCI.value = ''
}

const openCreateModal = () => {
  editingUser.value = null
  isEditing.value = false
  formKey.value++
  showModal.value = true
}

const openEditModal = (user: any) => {
  editingUser.value = { ...user }
  isEditing.value = true
  formKey.value++
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const openDetailsModal = (user: any) => {
  selectedUser.value = user
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedUser.value = null
}

const handleSubmit = async (formData: any) => {
  // Validación local: no permitir crear o actualizar un propietario con CI duplicado
  const taxId = formData.taxId?.toString().trim().toLowerCase()
  if (formData.userType === 'OWNER' && taxId) {
    const duplicateOwner = users.value.find(user =>
      user.taxId?.toString().trim().toLowerCase() === taxId &&
      user.id !== editingUser.value?.id
    )
    if (duplicateOwner) {
      showToast('⚠️ El CI ya está registrado en el sistema. No se puede guardar un propietario duplicado.', 'error')
      return
    }
  }
  try {
    if (isEditing.value && editingUser.value) {
      await update(editingUser.value.id, formData)
      showToast('Usuario actualizado correctamente')
    } else {
      await create(formData)
      showToast('Usuario creado correctamente')
    }
    closeModal()
    // Limpiar búsqueda al crear/editar para mostrar la lista completa actualizada
    clearSearch()
  } catch (e: any) {
    let errorMessage = 'Error al guardar el usuario'
    
    if (e.response?.data) {
      const errorData = e.response.data
      
      if (errorData.detail?.includes('An owner with CI') || 
          errorData.detail?.includes('taxId already exists') ||
          errorData.detail?.includes('already exists')) {
        errorMessage = '⚠️ El número de CI/NIT ya está registrado en el sistema. Un propietario no puede tener el mismo CI que otro.'
      }
      else if (errorData.detail?.includes('Email already exists') || 
               errorData.detail?.includes('email already exists') ||
               errorData.message?.includes('Email already exists')) {
        errorMessage = '⚠️ El correo electrónico ya está registrado. Por favor, use otro email.'
      }
      else if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    }
    
    showToast(errorMessage, 'error')
    console.error('Error submitting user:', e)
  }
}

const handleDeactivate = async (user: any) => {
  const result = await Swal.fire({
    title: '¿Desactivar cliente?',
    text: `¿Estás seguro de desactivar a "${user.fullName || user.email}"? El usuario no podrá iniciar sesión, pero podrá ser reactivado después.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    await deactivate(user.id)
    showToast('Cliente desactivado correctamente')
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al desactivar', 'error')
  }
}

const handleRemove = async (user: any) => {
  const result = await Swal.fire({
    title: '¿Dar de baja cliente?',
    text: `¿Estás seguro de dar de baja definitivamente a "${user.fullName || user.email}"? Esta acción no se puede deshacer.`,
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, dar de baja',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    await remove(user.id)
    showToast('Cliente dado de baja correctamente')
    closeDetailsModal()
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al dar de baja', 'error')
  }
}

const handleReactivate = async (user: any) => {
  try {
    await reactivate(user.id)
    showToast('Usuario reactivado correctamente')
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al reactivar', 'error')
  }
}

const handleResend = async (user: any) => {
  try {
    await resendPassword(user.email)
    showToast(`Contraseña temporal reenviada a ${user.email}`)
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al reenviar correo', 'error')
  }
}

onMounted(load)
</script>