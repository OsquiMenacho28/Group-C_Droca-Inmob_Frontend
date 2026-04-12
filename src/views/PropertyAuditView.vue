<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          Auditoría de Inmuebles
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Historial de cambios de estado y modificaciones en propiedades
        </p>
      </div>
      <fwb-badge type="indigo">Admin Mode</fwb-badge>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          v-model="filters.userId"
          :items="userOptions"
          label="Agente / Usuario"
          placeholder="Buscar por nombre del agente..."
          :loading="loadingUsers"
          show-clear-button
        />

        <SearchableSelect
          v-model="filters.propertyId"
          :items="propertyOptions"
          label="Propiedad"
          placeholder="Buscar por título o dirección..."
          :loading="loadingProperties"
          show-clear-button
        />

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
            >
              Desde
            </label>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
            >
              Hasta
            </label>
            <input
              v-model="filters.to"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="fetchLogs" gradient="blue">
          <div class="flex items-center gap-2">
            <IconLucideSearch class="w-4 h-4" />
            Filtrar
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative">
          Limpiar filtros
        </fwb-button>
        <fwb-button @click="fetchLogs" color="alternative" size="sm">
          <IconLucideRefreshCw class="w-4 h-4 mr-2" />
          Actualizar
        </fwb-button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
      <span class="text-xs text-gray-500">Filtros activos:</span>
      <span
        v-if="filters.userId"
        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
      >
        Agente: {{ getUserName(filters.userId) }}
        <button @click="filters.userId = ''" class="hover:text-blue-600">
          ×
        </button>
      </span>
      <span
        v-if="filters.propertyId"
        class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
      >
        Propiedad: {{ getPropertyName(filters.propertyId) }}
        <button @click="filters.propertyId = ''" class="hover:text-green-600">
          ×
        </button>
      </span>
      <span
        v-if="filters.from"
        class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
      >
        Desde: {{ formatDateShort(filters.from) }}
      </span>
      <span
        v-if="filters.to"
        class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
      >
        Hasta: {{ formatDateShort(filters.to) }}
      </span>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">Cargando registros de auditoría...</p>
    </div>

    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Fecha y Hora</fwb-table-head-cell>
          <fwb-table-head-cell>Agente</fwb-table-head-cell>
          <fwb-table-head-cell>Acción</fwb-table-head-cell>
          <fwb-table-head-cell>Propiedad</fwb-table-head-cell>
          <fwb-table-head-cell>Cambio</fwb-table-head-cell>
          <fwb-table-head-cell>
            <span class="sr-only">Detalles</span>
          </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id">
            <fwb-table-cell class="whitespace-nowrap">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <span class="text-[10px] font-bold text-blue-600">
                    {{ getUserInitials(log.userId) }}
                  </span>
                </div>
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ getUserName(log.userId) }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-yellow-100 text-yellow-800':
                    log.action === 'STATUS_CHANGE',
                  'bg-blue-100 text-blue-800': log.action === 'PRICE_UPDATE',
                  'bg-purple-100 text-purple-800':
                    log.action === 'AGENT_ASSIGN',
                  'bg-gray-100 text-gray-800': ![
                    'STATUS_CHANGE',
                    'PRICE_UPDATE',
                    'AGENT_ASSIGN',
                  ].includes(log.action),
                }"
              >
                {{ formatAction(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex flex-col">
                <span
                  class="text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  {{ getPropertyName(log.propertyId) }}
                </span>
                <span class="text-[10px] text-gray-400 font-mono">
                  ID: {{ log.propertyId }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-red-500 line-through">{{
                  log.previousValue || '—'
                }}</span>
                <IconLucideArrowRight class="w-4 h-4 text-gray-400" />
                <span class="text-green-600 font-semibold">{{
                  log.newValue || '—'
                }}</span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell class="text-right">
              <button
                @click="openModal(log)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
              >
                Ver Detalles
              </button>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <div
      v-else-if="!loading && logs.length === 0 && !hasSearched"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideClipboardList class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
        No hay registros de auditoría
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">
        Los cambios de estado en propiedades aparecerán aquí automáticamente
      </p>
    </div>

    <div
      v-else-if="!loading && logs.length === 0 && hasSearched"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideSearch class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
        No se encontraron resultados
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">
        Prueba con otros filtros o limpia la búsqueda
      </p>
    </div>

    <fwb-modal v-if="selectedLog" @close="selectedLog = null" size="lg">
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="{
              'bg-yellow-100': selectedLog.action === 'STATUS_CHANGE',
              'bg-blue-100': selectedLog.action === 'PRICE_UPDATE',
              'bg-purple-100': selectedLog.action === 'AGENT_ASSIGN',
            }"
          >
            <IconLucideCheckCircle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold dark:text-white">
              Detalle del Cambio
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatAction(selectedLog.action) }} ·
              {{ formatDateTime(selectedLog.timestamp) }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-6">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h4
              class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
            >
              Información del Agente
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Agente:</span>
                <p class="font-semibold dark:text-white mt-1">
                  {{ getUserName(selectedLog.userId) }}
                </p>
              </div>
              <div>
                <span class="text-gray-500">Propiedad:</span>
                <p class="font-semibold dark:text-white mt-1">
                  {{ getPropertyName(selectedLog.propertyId) }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div v-if="selectedLog.changes && selectedLog.changes.length > 0">
              <h4
                class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
              >
                Campos Modificados
              </h4>
              <div class="space-y-2">
                <div
                  v-for="change in selectedLog.changes"
                  :key="change.field"
                  class="flex flex-col p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm"
                >
                  <span
                    class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase"
                    >{{ change.field }}</span
                  >
                  <div class="flex items-center gap-3 mt-1">
                    <span
                      class="text-sm text-red-500 line-through decoration-red-300"
                      >{{ change.oldValue || '(vacío)' }}</span
                    >
                    <IconLucideArrowRight class="w-4 h-4 text-gray-300" />
                    <span
                      class="text-sm font-bold text-green-600 dark:text-green-400"
                      >{{ change.newValue }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-2 gap-6">
              <div
                class="p-5 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-center"
              >
                <p
                  class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3"
                >
                  Valor Anterior
                </p>
                <p class="text-2xl font-black text-red-700 dark:text-red-300">
                  {{ selectedLog.previousValue || '—' }}
                </p>
              </div>
              <div
                class="p-5 rounded-xl border-2 border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 text-center"
              >
                <p
                  class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3"
                >
                  Valor Nuevo
                </p>
                <p
                  class="text-2xl font-black text-green-700 dark:text-green-300"
                >
                  {{ selectedLog.newValue || '—' }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-center">
            <div class="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
              <IconLucideArrowDownToLine class="w-6 h-6 text-gray-500" />
            </div>
          </div>

          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Cambio realizado por el agente
              <span class="font-semibold text-gray-700 dark:text-gray-300">{{
                getUserName(selectedLog.userId)
              }}</span>
            </p>
            <p class="text-xs mt-2">
              Fecha: {{ formatDateTime(selectedLog.timestamp) }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <fwb-button @click="selectedLog = null" color="alternative"
            >Cerrar</fwb-button
          >
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/services/api';
import { userService } from '@/services/userService';
import { propertyService } from '@/services/propertyService';
import SearchableSelect, {
  type SelectItem,
} from '@/components/common/SearchableSelect.vue';
import {
  FwbTable,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableBody,
  FwbTableRow,
  FwbTableCell,
  FwbModal,
  FwbButton,
  FwbBadge,
} from 'flowbite-vue';
import IconLucideSearch from '~icons/lucide/search';
import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
import IconLucideArrowRight from '~icons/lucide/arrow-right';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucideCheckCircle from '~icons/lucide/check-circle';
import IconLucideArrowDownToLine from '~icons/lucide/arrow-down-to-line';

interface ChangeDetail {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

interface AuditLog {
  id: string | number;
  timestamp: string;
  userId: string;
  action: string;
  propertyId: string;
  previousValue: string | null;
  newValue: string | null;
  changes?: ChangeDetail[];
}

const logs = ref<AuditLog[]>([]);
const loading = ref(false);
const selectedLog = ref<AuditLog | null>(null);
const hasSearched = ref(false);

const users = ref<
  {
    id: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }[]
>([]);
const properties = ref<{ id: string; title: string; address: string }[]>([]);
const loadingUsers = ref(false);
const loadingProperties = ref(false);

const userOptions = computed<SelectItem[]>(() => {
  return users.value.map((user) => ({
    value: user.id as string,
    label: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`,
    subtitle: user.email as string,
  }));
});

const propertyOptions = computed<SelectItem[]>(() => {
  return properties.value.map((prop) => ({
    value: prop.id as string,
    label: prop.title as string,
    subtitle: prop.address as string,
  }));
});

const filters = ref({
  userId: '',
  propertyId: '',
  from: '',
  to: '',
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.userId ||
    filters.value.propertyId ||
    filters.value.from ||
    filters.value.to
  );
});

const getUserName = (userId: string) => {
  const user = users.value.find((u) => u.id === userId);
  if (user) return user.fullName || `${user.firstName} ${user.lastName}`;
  return userId.substring(0, 8) + '...';
};

const getUserInitials = (userId: string) => {
  const user = users.value.find((u) => u.id === userId);
  if (user) {
    const firstName = (user.firstName as string)?.charAt(0) || '';
    const lastName = (user.lastName as string)?.charAt(0) || '';
    return (firstName + lastName).toUpperCase() || 'A';
  }
  return 'A';
};

const getPropertyName = (propertyId: string) => {
  const prop = properties.value.find((p) => p.id === propertyId);
  return prop ? prop.title : propertyId.substring(0, 8) + '...';
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    users.value = await userService.getUsers();
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const loadProperties = async () => {
  loadingProperties.value = true;
  try {
    const props = await propertyService.getProperties();
    properties.value = props;
  } catch (error) {
    console.error('Error loading properties:', error);
  } finally {
    loadingProperties.value = false;
  }
};

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
};

const formatAction = (action: string) => {
  const actions: Record<string, string> = {
    STATUS_CHANGE: 'Cambio de Estado',
    PRICE_UPDATE: 'Actualización de Precio',
    AGENT_ASSIGN: 'Reasignación de Agente',
    OWNER_ASSIGN: 'Asignación de Propietario',
    PROPERTY_CREATE: 'Registro de Propiedad',
    PROPERTY_UPDATE: 'Edición de Datos',
    PROPERTY_DELETE: 'Eliminación (Baja)',
  };
  return actions[action] || action;
};

const fetchLogs = async () => {
  loading.value = true;
  hasSearched.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.userId) params.append('userId', filters.value.userId);
    if (filters.value.propertyId)
      params.append('propertyId', filters.value.propertyId);

    if (filters.value.from) {
      const [year, month, day] = filters.value.from.split('-').map(Number);
      const fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      params.append('from', fromDate.toISOString());
    }

    if (filters.value.to) {
      const [year, month, day] = filters.value.to.split('-').map(Number);
      const toDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      params.append('to', toDate.toISOString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/properties/audit?${queryString}`
      : '/properties/audit';
    const response = await api.get(url);
    logs.value = response.data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    userId: '',
    propertyId: '',
    from: '',
    to: '',
  };
  fetchLogs();
};

const openModal = (log: AuditLog) => {
  selectedLog.value = log;
};

onMounted(async () => {
  await Promise.all([loadUsers(), loadProperties()]);
  await fetchLogs();
});
</script>
