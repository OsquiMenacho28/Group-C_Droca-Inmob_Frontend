<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <fwb-input
        v-model="form.title"
        label="Título"
        placeholder="Ej: Apto en el centro"
        required
      />
      <fwb-input
        v-model="form.address"
        label="Dirección Exacta"
        placeholder="Calle..."
        required
      />

      <div>
        <label
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Tipo de Operación *</label
        >
        <select
          v-model="form.operationType"
          required
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="" disabled>Seleccione una opción</option>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
          <option value="ANTICRETICO">Anticrético</option>
        </select>
        <p
          v-if="showValidation && !form.operationType"
          class="text-red-500 text-xs mt-1"
        >
          El tipo de operación es obligatorio
        </p>
      </div>

      <div>
        <label
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Tipo de Inmueble</label
        >
        <select
          v-model="form.type"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="APARTAMENTO">Apartamento</option>
          <option value="CASA">Casa</option>
          <option value="COMERCIAL">Local Comercial</option>
        </select>
      </div>

      <div>
        <fwb-input
          v-model.number="form.price"
          type="number"
          label="Precio ($)"
          required
          :disabled="isPriceDisabled"
        />
        <p v-if="isPriceDisabled" class="text-xs text-yellow-600 mt-1">
          ⚠️ Los agentes no pueden modificar el precio. Solo administradores.
        </p>
      </div>

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

      <div class="col-span-2">
        <label
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Propietario (Opcional)</label
        >
        <select
          v-model="form.ownerId"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Sin propietario asignado</option>
          <option v-for="owner in owners" :key="owner.id" :value="owner.id">
            {{ owner.fullName || owner.name }} - {{ owner.email }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="props.propertyId"
      class="border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Imágenes de la Propiedad
      </h3>
      <image-upload
        :property-id="props.propertyId"
        :existing-images="form.imageUrls"
        @images-updated="handleImagesUpdated"
      />
    </div>
    <div v-else class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div
        class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed"
      >
        <p class="text-gray-500">
          Las imágenes se pueden subir después de crear la propiedad
        </p>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')"
        >Cancelar</fwb-button
      >
      <fwb-button type="submit" gradient="blue">Confirmar Registro</fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { FwbInput, FwbButton } from 'flowbite-vue';
import { userService } from '@/services/userService';
import { useAuth } from '@/composables/useAuth';
import ImageUpload from '@/components/properties/ImageUpload.vue';
import type { PropertyFormPayload, OperationType } from '@/types/property';

interface OwnerUser {
  id: string;
  userType: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

const props = defineProps<{
  initialData?: Record<string, unknown>;
  propertyId?: string;
}>();

const emit = defineEmits(['submit', 'cancel']);
const owners = ref<OwnerUser[]>([]);
const showValidation = ref(false);
const { user } = useAuth();

const isAgent = computed(() => {
  const roles = (user.value?.roles as string[]) || [];
  const userType = user.value?.userType;
  return (
    (roles.includes('AGENT') || userType === 'EMPLOYEE') &&
    !(roles.includes('ADMIN') || userType === 'ADMIN')
  );
});

const isPriceDisabled = computed(() => {
  return isAgent.value && !!props.propertyId;
});

const form = reactive({
  title: '',
  address: '',
  price: 0,
  type: 'APARTAMENTO',
  operationType: '',
  m2: 0,
  rooms: 0,
  ownerId: '',
  imageUrls: [] as string[],
});

const handleImagesUpdated = (urls: string[]) => {
  form.imageUrls = urls;
};

const loadOwners = async () => {
  try {
    const users = await userService.getUsers();
    owners.value = users.filter(
      (u: OwnerUser) => u.userType === 'OWNER' && u.status === 'ACTIVE'
    );
  } catch (error) {
    console.error('Error loading owners:', error);
  }
};

const submit = () => {
  showValidation.value = true;
  if (!form.operationType) return;

  const submitData: PropertyFormPayload = {
    title: form.title,
    address: form.address,
    price: !isAgent.value || !props.propertyId ? form.price : 0,
    type: form.type,
    operationType: form.operationType as OperationType,
    m2: form.m2,
    rooms: form.rooms,
    ownerId: form.ownerId || null,
    imageUrls: form.imageUrls,
  };

  emit('submit', submitData);
};

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.title = (data.title as string) || '';
      form.address = (data.address as string) || '';
      form.price = (data.price as number) || 0;
      form.type = (data.type as string) || 'APARTAMENTO';
      form.operationType = (data.operationType as string) || '';
      form.m2 = (data.m2 as number) || 0;
      form.rooms = (data.rooms as number) || 0;
      form.ownerId = (data.ownerId as string) || '';
      form.imageUrls = (data.imageUrls as string[]) || [];
    }
  },
  { immediate: true }
);

onMounted(loadOwners);
</script>
