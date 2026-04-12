<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
  >
    <div
      class="p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4"
    >
      <div class="flex-1 flex items-center space-x-2">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ t.users.directory }}
        </h2>
        <span
          class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
        >
          {{ totalUsers || users.length }} {{ t.users.total }}
        </span>
      </div>
      <div class="flex-shrink-0">
        <fwb-button @click="$emit('create')" gradient="blue">
          <div class="flex items-center">
            <IconLucidePlus class="w-4 h-4 mr-2" />
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
        <fwb-table-head-cell>CI / NIT</fwb-table-head-cell>
        <fwb-table-head-cell>{{ t.users.table.role }}</fwb-table-head-cell>
        <fwb-table-head-cell>Estado</fwb-table-head-cell>
        <fwb-table-head-cell>
          <span class="sr-only">{{ t.users.table.actions }}</span>
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row v-for="u in users" :key="u.id" class="group">
          <fwb-table-cell
            class="font-medium text-gray-900 dark:text-white"
            :class="{ 'opacity-60': u.status === 'INACTIVE' }"
          >
            {{ u.fullName || u.name }}
          </fwb-table-cell>
          <fwb-table-cell :class="{ 'opacity-60': u.status === 'INACTIVE' }">{{
            u.email
          }}</fwb-table-cell>
          <fwb-table-cell :class="{ 'opacity-60': u.status === 'INACTIVE' }">{{
            u.phone || '-'
          }}</fwb-table-cell>
          <fwb-table-cell :class="{ 'opacity-60': u.status === 'INACTIVE' }">
            <span class="font-mono text-sm">
              {{ u.taxId || '-' }}
            </span>
            <span
              v-if="u.userType === 'OWNER' && u.taxId"
              class="ml-1 text-xs text-blue-500"
            >
              (CI)
            </span>
          </fwb-table-cell>
          <fwb-table-cell :class="{ 'opacity-60': u.status === 'INACTIVE' }">
            <span
              class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ resolveRoleName(u.primaryRoleIds) }}
            </span>
          </fwb-table-cell>
          <fwb-table-cell :class="{ 'opacity-60': u.status === 'INACTIVE' }">
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                u.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : u.status === 'INACTIVE'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    : u.status === 'DELETED'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : u.status === 'LOCKED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700',
              ]"
            >
              {{ statusLabel(u.status) }}
            </span>
          </fwb-table-cell>
          <fwb-table-cell class="text-right">
            <div class="flex justify-end space-x-1">
              <button
                @click="$emit('viewDetails', u)"
                class="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Ver detalles"
              >
                <IconLucideEye class="w-5 h-5" />
              </button>

              <button
                v-if="u.status !== 'DELETED'"
                @click="$emit('resend', u)"
                class="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Reenviar contraseña temporal"
              >
                <IconLucideMail class="w-5 h-5" />
              </button>

              <button
                v-if="u.status !== 'INACTIVE' && u.status !== 'DELETED'"
                @click="$emit('edit', u)"
                class="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Editar usuario"
              >
                <IconLucidePencil class="w-5 h-5" />
              </button>

              <button
                v-if="u.status === 'INACTIVE'"
                @click="$emit('reactivate', u)"
                class="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Reactivar usuario"
              >
                <IconLucideRefreshCw class="w-5 h-5" />
              </button>

              <button
                v-if="u.status !== 'INACTIVE' && u.status !== 'DELETED'"
                @click="$emit('delete', u)"
                class="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Desactivar usuario"
              >
                <IconLucideBan class="w-5 h-5" />
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
  FwbTableCell,
} from 'flowbite-vue';
import { t } from '@/locales/i18n';
import IconLucidePlus from '~icons/lucide/plus';
import IconLucideEye from '~icons/lucide/eye';
import IconLucideMail from '~icons/lucide/mail';
import IconLucidePencil from '~icons/lucide/pencil';
import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
import IconLucideBan from '~icons/lucide/ban';

interface UserRecord {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  taxId?: string;
  userType?: string;
  primaryRoleIds?: string[];
  status: string;
}

interface RoleRecord {
  id: string;
  _id?: string;
  name: string;
}

const props = defineProps<{
  users: UserRecord[];
  roles: RoleRecord[];
  totalUsers?: number;
}>();

const resolveRoleName = (roleIds: string[] | undefined) => {
  if (!roleIds || roleIds.length === 0) return 'Sin rol';
  const roleId = roleIds[0];
  const role = props.roles.find((r) => r.id === roleId || r._id === roleId);
  return role ? role.name : 'Usuario';
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo';
    case 'INACTIVE':
      return 'Inactivo';
    case 'DELETED':
      return 'Dado de baja';
    case 'LOCKED':
      return 'Bloqueado';
    case 'TERMINATED':
      return 'Terminado';
    default:
      return status || '—';
  }
};

defineEmits<{
  create: [];
  edit: [user: UserRecord];
  delete: [user: UserRecord];
  resend: [user: UserRecord];
  reactivate: [user: UserRecord];
  viewDetails: [user: UserRecord];
}>();
</script>
