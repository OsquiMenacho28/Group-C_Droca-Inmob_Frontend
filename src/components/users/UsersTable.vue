<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
    <div class="p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
      <div class="flex-1 flex items-center space-x-2">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ t.users.directory }}</h2>
        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
          {{ users.length }} {{ t.users.total }}
        </span>
      </div>
      <div class="flex-shrink-0">
        <fwb-button @click="$emit('create')" gradient="blue">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            {{ t.users.addNew }}
          </div>
        </fwb-button>
      </div>
    </div>

    <fwb-table hoverable>
      <fwb-table-head>
        <fwb-table-head-cell>{{ t.users.table.name }}</fwb-table-head-cell>
        <fwb-table-head-cell>{{ t.users.table.email }}</fwb-table-head-cell>
        <fwb-table-head-cell>{{ t.users.table.phone }}</fwb-table-head-cell>
        <fwb-table-head-cell>{{ t.users.table.role }}</fwb-table-head-cell>
        <fwb-table-head-cell>Estado</fwb-table-head-cell>
        <fwb-table-head-cell>
          <span class="sr-only">{{ t.users.table.actions }}</span>
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row
          v-for="u in users"
          :key="u.id"
          class="group"
          :class="{ 'opacity-60': u.status === 'INACTIVE' }"
        >
          <fwb-table-cell class="font-medium text-gray-900 dark:text-white">
            {{ u.fullName || u.name }}
          </fwb-table-cell>
          <fwb-table-cell>{{ u.email }}</fwb-table-cell>
          <fwb-table-cell>{{ u.phone || '-' }}</fwb-table-cell>
          <fwb-table-cell>
            <span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {{ resolveRoleName(u.primaryRoleIds) }}
            </span>
          </fwb-table-cell>
          <fwb-table-cell>
            <!-- ✅ Status badge -->
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                u.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : u.status === 'INACTIVE'
                  ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  : u.status === 'LOCKED'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-700'
              ]"
            >
              {{ statusLabel(u.status) }}
            </span>
          </fwb-table-cell>
          <fwb-table-cell class="text-right">
            <div class="flex justify-end space-x-1">
              <!-- Resend temp password -->
              <button
                @click="$emit('resend', u)"
                class="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Reenviar contraseña temporal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </button>

              <!-- Edit (only if active) -->
              <button
                v-if="u.status !== 'INACTIVE'"
                @click="$emit('edit', u)"
                class="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Editar usuario"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>

              <!-- Reactivate (only if inactive) -->
              <button
                v-if="u.status === 'INACTIVE'"
                @click="$emit('reactivate', u)"
                class="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Reactivar usuario"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>

              <!-- Deactivate (logical delete, only if active) -->
              <button
                v-if="u.status !== 'INACTIVE'"
                @click="$emit('delete', u)"
                class="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Desactivar usuario"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
              </button>
            </div>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
  </div>
</template>

<script setup lang="ts">
import {
  FwbButton,
  FwbTable,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableBody,
  FwbTableRow,
  FwbTableCell
} from 'flowbite-vue'
import { t } from '../../locales/i18n'

const props = defineProps<{
  users: any[],
  roles: any[]
}>()

const resolveRoleName = (roleIds: string[]) => {
  if (!roleIds || roleIds.length === 0) return 'Sin rol'
  const roleId = roleIds[0]
  const role = props.roles.find(r => r.id === roleId || r._id === roleId)
  return role ? role.name : 'Usuario'
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Activo'
    case 'INACTIVE': return 'Inactivo'
    case 'LOCKED': return 'Bloqueado'
    case 'TERMINATED': return 'Terminado'
    default: return status || '—'
  }
}

defineEmits<{
  create: []
  edit: [user: any]
  delete: [user: any]      // triggers deactivate (logical)
  resend: [user: any]
  reactivate: [user: any]
}>()
</script>