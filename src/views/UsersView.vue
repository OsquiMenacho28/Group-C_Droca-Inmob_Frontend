<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Gestión de Usuarios</h1>
    </div>

    <users-table
      :users="users"
      :roles="roles"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="handleDeactivate"
      @resend="handleResend"
      @reactivate="handleReactivate"
    />

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario' }}
        </div>
      </template>
      <template #body>
        <!--
          KEY FIX: We use a :key on UserForm so Vue fully remounts it
          each time we open the modal with different data.
          This guarantees the watch({ immediate: true }) fires fresh.
        -->
        <user-form
          :key="formKey"
          :initial-data="editingUser"
          :is-editing="isEditing"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>

    <!-- Toast/Alert for feedback -->
    <div
      v-if="toast.visible"
      :class="[
        'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FwbModal } from 'flowbite-vue'
import { useUsers } from '../composables/useUsers'
import UserForm from '../components/users/UserForm.vue'
import UsersTable from '../components/users/UsersTable.vue'

const { users, roles, load, create, deactivate, reactivate, resendPassword, update } = useUsers()
const showModal = ref(false)
const isEditing = ref(false)
const editingUser = ref<any>(null)
// ✅ FIX 2: formKey forces UserForm to remount so initial data is always fresh
const formKey = ref(0)

const toast = ref({ visible: false, message: '', type: 'success' })

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { visible: true, message, type }
  setTimeout(() => { toast.value.visible = false }, 3500)
}

const openCreateModal = () => {
  editingUser.value = null
  isEditing.value = false
  formKey.value++          // force remount
  showModal.value = true
}

const openEditModal = (user: any) => {
  // 'user' is the enriched object (Identity + Person profile merged by useUsers.load)
  editingUser.value = { ...user }
  isEditing.value = true
  formKey.value++          // force remount with new data
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async (formData: any) => {
  try {
    if (isEditing.value && editingUser.value) {
      await update(editingUser.value.id, formData)
      showToast('Usuario actualizado correctamente')
    } else {
      await create(formData)
      showToast('Usuario creado correctamente')
    }
    closeModal()
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al guardar el usuario', 'error')
  }
}

// ✅ FIX 3: Logical delete (INACTIVE)
const handleDeactivate = async (user: any) => {
  if (!confirm(`¿Desactivar al usuario "${user.fullName || user.email}"? El usuario no podrá iniciar sesión.`)) return
  try {
    await deactivate(user.id)
    showToast('Usuario desactivado correctamente')
  } catch (e: any) {
    showToast(e.response?.data?.detail || 'Error al desactivar', 'error')
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

// ✅ FIX 1: Resend temp password
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