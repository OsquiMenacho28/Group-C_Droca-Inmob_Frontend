<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="4xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ property?.title }}
        </h3>
        <fwb-badge :color="getStatusColor(property?.status || '')">{{
          property?.status
        }}</fwb-badge>
      </div>
    </template>

    <template #body>
      <div
        class="grid grid-cols-1 gap-8"
        :class="{ 'lg:grid-cols-2': !isClientView }"
      >
        <div class="space-y-4">
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4
              class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3"
            >
              Ficha Técnica
            </h4>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <span class="text-gray-500 font-medium">Ubicación:</span>
              <span class="dark:text-white text-right">{{
                property?.address
              }}</span>

              <span class="text-gray-500 font-medium">Área:</span>
              <span class="dark:text-white text-right"
                >{{ property?.m2 }} m²</span
              >

              <span class="text-gray-500 font-medium">Dormitorios:</span>
              <span class="dark:text-white text-right">{{
                property?.rooms
              }}</span>

              <span class="text-gray-500 font-medium">Tipo:</span>
              <span class="dark:text-white text-right">{{
                property?.type
              }}</span>

              <span class="text-gray-500 font-medium">Estado actual:</span>
              <div class="flex justify-end">
                <select
                  v-if="!isClientView"
                  v-model="localStatus"
                  @change="handleStatusChange"
                  :disabled="
                    updatingStatus ||
                    (property?.status === 'VENDIDO' && !isAdmin)
                  "
                  class="text-xs font-bold rounded-lg border-gray-300 py-1 px-2 dark:bg-gray-700 dark:text-white"
                  :class="statusColorClass(localStatus)"
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="RESERVADO">RESERVADO</option>
                  <option value="EN_NEGOCIACION">EN NEGOCIACIÓN</option>
                  <option value="VENDIDO">VENDIDO</option>
                </select>
                <span
                  v-else
                  class="dark:text-white text-right"
                  :class="statusTextClass(property?.status)"
                >
                  {{ property?.status }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="property?.imageUrls?.length"
            class="rounded-xl overflow-hidden bg-gray-200 shadow-sm"
          >
            <img
              :src="property.imageUrls[0]"
              class="w-full h-64 object-cover"
              alt="Imagen principal de la propiedad"
            />
          </div>
          <div
            v-else
            class="h-64 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
          >
            <div class="text-center">
              <IconLucideImage class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                No hay fotos disponibles
              </p>
            </div>
          </div>

          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <h4
              class="text-xs font-black text-green-600 uppercase tracking-widest mb-3"
            >
              Responsable de la Propiedad
            </h4>

            <div
              v-if="loadingOwner"
              class="flex items-center justify-center py-8"
            >
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"
              ></div>
              <span class="ml-2 text-sm text-gray-500">Cargando...</span>
            </div>

            <div v-else-if="owner" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-bold text-lg">
                    {{ owner.firstName?.charAt(0)
                    }}{{ owner.lastName?.charAt(0) }}
                  </span>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h5
                  class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                >
                  {{ owner.firstName }} {{ owner.lastName }}
                </h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Propietario
                </p>

                <div class="space-y-1">
                  <div
                    v-if="owner.email"
                    class="flex items-center text-xs text-gray-600 dark:text-gray-300"
                  >
                    <IconLucideMail class="w-3 h-3 mr-1 flex-shrink-0" />
                    <span class="truncate">{{ owner.email }}</span>
                  </div>

                  <div
                    v-if="owner.phone"
                    class="flex items-center text-xs text-gray-600 dark:text-gray-300"
                  >
                    <IconLucidePhone class="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{{ owner.phone }}</span>
                  </div>
                </div>

                <div class="flex gap-2 mt-3">
                  <fwb-button
                    v-if="owner.phone"
                    @click="contactViaWhatsApp"
                    size="xs"
                    color="green"
                    class="flex-1"
                  >
                    <IconLucideMessageSquare class="w-3 h-3 mr-1" />
                    WhatsApp
                  </fwb-button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <IconLucideUser class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-xs text-gray-500 dark:text-gray-400">
                No hay propietario asignado
              </p>
            </div>
          </div>
        </div>

        <div v-if="!isClientView" class="space-y-6">
          <div class="relative pl-6 border-l-2 border-yellow-400">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              Evolución de Precio
            </h4>

            <div
              v-if="property?.priceHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="(h, i) in property!.priceHistory"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400 line-through"
                      >${{ h.oldPrice.toLocaleString() }}</span
                    >
                    <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
                    <span class="text-sm font-bold text-green-600"
                      >${{ h.newPrice.toLocaleString() }}</span
                    >
                  </div>
                  <span
                    class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 font-mono"
                    >{{ formatDate(h.changedAt) }}</span
                  >
                </div>
                <p class="text-[10px] text-gray-400">
                  Modificado por:
                  <span class="text-gray-600 dark:text-gray-300 font-medium">{{
                    h.changedBy
                  }}</span>
                </p>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              Precio original sin modificaciones.
            </div>
          </div>

          <div class="relative pl-6 border-l-2 border-blue-500">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              Registro de Asignaciones
            </h4>

            <div
              v-if="property?.assignmentHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="(ah, i) in property!.assignmentHistory"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <p class="text-xs dark:text-gray-200">
                  Agente previo:
                  <span class="font-bold text-blue-600">{{ ah.agentId }}</span>
                </p>
                <div
                  class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-700"
                >
                  <p class="text-[10px] text-gray-400">
                    Asignado por: {{ ah.assignedBy }}
                  </p>
                  <span class="text-[10px] text-gray-400 font-mono">{{
                    formatDate(ah.assignedAt)
                  }}</span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              Se mantiene el asesor inicial.
            </div>
          </div>

          <div class="relative pl-6 border-l-2 border-red-500">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              Historial de Estados
            </h4>

            <div
              v-if="property?.statusHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div
                v-for="(h, i) in [...(property!.statusHistory || [])].reverse()"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-1">
                    <span class="text-[10px] font-bold text-gray-400">{{
                      h.oldStatus
                    }}</span>
                    <IconLucideArrowRight class="w-2 h-2 text-gray-400" />
                    <span
                      class="text-[10px] font-bold"
                      :class="statusTextClass(h.newStatus)"
                      >{{ h.newStatus }}</span
                    >
                  </div>
                  <span class="text-[9px] text-gray-400 font-mono">{{
                    formatDate(h.changedAt)
                  }}</span>
                </div>
                <p class="text-[9px] text-gray-500">
                  Cambiado por: {{ h.changedBy }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              Sin cambios de estado registrados.
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="alternative" @click="$emit('close')"
          >Cerrar</fwb-button
        >
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue';
import { propertyService } from '@/services/propertyService';
import { personService } from '@/services/personService';
import { useAuth } from '@/composables/useAuth';
import type { Property } from '@/types/property';
import IconLucideImage from '~icons/lucide/image';
import IconLucideMail from '~icons/lucide/mail';
import IconLucidePhone from '~icons/lucide/phone';
import IconLucideMessageSquare from '~icons/lucide/message-square';
import IconLucideUser from '~icons/lucide/user';
import IconLucideArrowRight from '~icons/lucide/arrow-right';

interface PersonOwner {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

const props = defineProps<{
  show: boolean;
  property: Property | null;
  isClientView?: boolean;
}>();

const emit = defineEmits(['close', 'status-updated']);
const { user } = useAuth();

const localStatus = ref(props.property?.status || '');
const updatingStatus = ref(false);
const owner = ref<PersonOwner | null>(null);
const loadingOwner = ref(false);

const isAdmin = computed(
  () =>
    ((user.value?.roles as string[]) || [])?.includes('ADMIN') ||
    user.value?.userType === 'ADMIN'
);

const loadOwnerInfo = async () => {
  if (!props.property?.ownerId) {
    owner.value = null;
    return;
  }

  loadingOwner.value = true;
  try {
    owner.value = await personService.getPersonByAuthUserId(
      props.property.ownerId
    );
  } catch (error) {
    console.error('Error loading owner info:', error);
    owner.value = null;
  } finally {
    loadingOwner.value = false;
  }
};

watch(
  () => props.property,
  (newProperty) => {
    if (newProperty) {
      localStatus.value = newProperty.status;
      loadOwnerInfo();
    }
  },
  { immediate: true }
);

const handleStatusChange = async () => {
  if (!props.property || localStatus.value === props.property.status) return;

  updatingStatus.value = true;
  try {
    await propertyService.updateStatus(props.property.id, localStatus.value);
    alert('Estado actualizado correctamente');
    emit('status-updated');
  } catch (err: unknown) {
    localStatus.value = props.property.status;
    const errorObj = err as { response?: { data?: { detail?: string } } };
    alert(
      errorObj.response?.data?.detail ||
        'No tienes permisos para realizar este cambio'
    );
  } finally {
    updatingStatus.value = false;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DISPONIBLE':
      return 'green';
    case 'RESERVADO':
      return 'yellow';
    case 'VENDIDO':
      return 'red';
    case 'EN_NEGOCIACION':
      return 'blue';
    default:
      return 'gray';
  }
};

const statusColorClass = (status: string) => {
  const map: Record<string, string> = {
    DISPONIBLE: 'text-green-600 border-green-200 bg-green-50',
    RESERVADO: 'text-yellow-600 border-yellow-200 bg-yellow-50',
    VENDIDO: 'text-red-600 border-red-200 bg-red-50',
    EN_NEGOCIACION: 'text-blue-600 border-blue-200 bg-blue-50',
  };
  return map[status] || '';
};

const statusTextClass = (status?: string) => {
  const map: Record<string, string> = {
    DISPONIBLE: 'text-green-600',
    RESERVADO: 'text-yellow-600',
    VENDIDO: 'text-red-600',
    EN_NEGOCIACION: 'text-blue-600',
  };
  return map[status || ''] || '';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const contactViaWhatsApp = () => {
  if (!owner.value?.phone || !props.property) return;

  const cleanPhone = owner.value.phone.replace(/\D/g, '');

  const firstName = owner.value.firstName || '';
  const title = props.property.title || '';
  const address = props.property.address || '';
  const message = encodeURIComponent(
    `Hola ${firstName}, me contacto por la propiedad "${title}" ubicada en ${address}. ¿Podríamos coordinar una visita?`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

watch(
  () => props.property?.status,
  (newStatus) => {
    if (newStatus) {
      localStatus.value = newStatus;
    }
  }
);
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
