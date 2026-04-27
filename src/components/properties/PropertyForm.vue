<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <fwb-input
        v-model="titleModel"
        :label="t('propertyForm.title')"
        :placeholder="t('propertyForm.title')"
        :validation-status="errors.title ? 'error' : undefined"
        :validation-message="errors.title"
      />
      <fwb-input
        v-model="addressModel"
        :label="t('propertyForm.address')"
        :placeholder="t('propertyForm.address')"
        :validation-status="errors.address ? 'error' : undefined"
        :validation-message="errors.address"
      />
      <fwb-input
        v-model="zoneModel"
        :label="t('clientProperties.zoneLabel').replace(':', '')"
        :placeholder="t('clientProperties.zoneLabel').replace(':', '')"
        :validation-status="errors.zone ? 'error' : undefined"
        :validation-message="errors.zone"
      />

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.operationType') }}
        </label>
        <select
          v-model="operationTypeModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
          :class="{ 'border-red-500': errors.operationType }"
        >
          <option value="" disabled>{{ t('propertyForm.selectOption') }}</option>
          <option value="VENTA">{{ t('propertyForm.sale') }}</option>
          <option value="ALQUILER">{{ t('propertyForm.rent') }}</option>
          <option value="ANTICRETICO">{{ t('propertyForm.anticretic') }}</option>
        </select>
        <p v-if="errors.operationType" class="text-red-500 text-xs mt-1">
          {{ errors.operationType }}
        </p>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.propertyType') }}
        </label>
        <select
          v-model="typeModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="DEPARTAMENTO">{{ t('propertyForm.apartment') }}</option>
          <option value="CASA">{{ t('propertyForm.house') }}</option>
          <option value="COMERCIAL">{{ t('propertyForm.commercialSpace') }}</option>
          <option value="TERRENO">{{ t('propertyTypes.TERRENO') }}</option>
          <option value="OFICINA">{{ t('propertyTypes.OFICINA') }}</option>
          <option value="INDUSTRIAL">{{ t('propertyTypes.INDUSTRIAL') }}</option>
          <option value="OTROS">{{ t('propertyTypes.OTROS') }}</option>
        </select>
      </div>

      <div>
        <fwb-input
          v-model.number="priceModel"
          type="number"
          :label="t('common.price')"
          :disabled="isPriceDisabled"
          :validation-status="errors.price ? 'error' : undefined"
          :validation-message="errors.price"
        />
        <p v-if="isPriceDisabled" class="text-xs text-yellow-600 mt-1">
          {{ t('propertyForm.priceWarning') }}
        </p>
      </div>

      <fwb-input
        v-model.number="m2Model"
        type="number"
        :label="t('common.m2')"
        :validation-status="errors.m2 ? 'error' : undefined"
        :validation-message="errors.m2"
      />
      <fwb-input
        v-model.number="roomsModel"
        type="number"
        :label="t('propertyForm.rooms')"
        :validation-status="errors.rooms ? 'error' : undefined"
        :validation-message="errors.rooms"
      />

      <div class="col-span-2">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('propertyForm.owner') }}
        </label>
        <select
          v-model="ownerIdModel"
          class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{{ t('propertyForm.noOwnerAssigned') }}</option>
          <option v-for="owner in owners" :key="owner.id" :value="owner.id">
            {{ owner.fullName || owner.name }} - {{ owner.email }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="props.propertyId" class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        {{ t('propertyForm.images') }}
      </h3>
      <image-upload
        :property-id="props.propertyId"
        :existing-images="imageUrlsModel"
        @images-updated="handleImagesUpdated"
      />
    </div>
    <div v-else class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed">
        <p class="text-gray-500">{{ t('propertyForm.imagesLater') }}</p>
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700">
      <fwb-button color="alternative" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </fwb-button>
      <fwb-button type="submit" gradient="blue">{{ t('propertyForm.confirmRegister') }}</fwb-button>
    </div>
    <div v-if="props.propertyId" class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ubicación Geográfica</h3>
        <fwb-button
          size="xs"
          gradient="green"
          @click="handleSaveLocation"
          :disabled="savingLocation"
        >
          <div class="flex items-center gap-1">
            <IconLucideMapPin class="w-4 h-4" />
            {{ savingLocation ? 'Guardando...' : 'Guardar Ubicación' }}
          </div>
        </fwb-button>
      </div>

      <PropertyMapPicker v-model="locationModel" />
    </div>

    <!-- Global Toast -->
    <AppToast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </form>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed, reactive } from 'vue';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { propertySchema } from '@/modules/properties/schemas/propertySchema';
  import type { PropertyFormValues } from '@/modules/properties/schemas/propertySchema';
  import { FwbInput, FwbButton } from 'flowbite-vue';
  import { userService } from '@/services/userService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import ImageUpload from '@/components/properties/ImageUpload.vue';
  import type { PropertyFormPayload, OperationType } from '@/types/property';
  import { useI18n } from 'vue-i18n';
  import PropertyMapPicker from './PropertyMapPicker.vue';
  import IconLucideMapPin from '~icons/lucide/map-pin';
  import { propertyService } from '@/modules/properties';
  import { handleApiError } from '@/api/errorHandler';
  import AppToast from '@/components/ui/AppToast.vue';

  const { t } = useI18n();

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

  const emit = defineEmits(['submit', 'cancel', 'location-updated']);
  const owners = ref<OwnerUser[]>([]);
  const authStore = useAuthStore();

  // UI States
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const isAgent = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles as string[]) || [];
    const userType = u?.userType;
    return (
      (roles.includes('AGENT') || userType === 'EMPLOYEE') &&
      !(roles.includes('ADMIN') || userType === 'ADMIN')
    );
  });

  const isPriceDisabled = computed(() => {
    return isAgent.value && !!props.propertyId;
  });

  const { defineField, errors, handleSubmit, setValues } = useForm<PropertyFormValues>({
    validationSchema: toTypedSchema(propertySchema),
    initialValues: {
      title: '',
      address: '',
      zone: '',
      price: 0,
      type: 'DEPARTAMENTO',
      operationType: '' as PropertyFormValues['operationType'],
      m2: 0,
      rooms: 0,
      ownerId: '',
      imageUrls: [] as string[],
    },
    validateOnMount: false,
  });

  const [titleModel] = defineField('title');
  const [addressModel] = defineField('address');
  const [zoneModel] = defineField('zone');
  const [priceModel] = defineField('price');
  const [typeModel] = defineField('type');
  const [operationTypeModel] = defineField('operationType');
  const [m2Model] = defineField('m2');
  const [roomsModel] = defineField('rooms');
  const [ownerIdModel] = defineField('ownerId');
  const [imageUrlsModel] = defineField('imageUrls');

  const handleImagesUpdated = (urls: string[]) => {
    imageUrlsModel.value = urls;
  };

  const loadOwners = async () => {
    try {
      const res = await userService.getUsers(0, 1000);
      const users = res.data || [];
      owners.value = users.filter(
        (u: OwnerUser) => u.userType === 'OWNER' && u.status === 'ACTIVE'
      );
    } catch (error) {
      console.error('Error loading owners:', error);
    }
  };

  const onSubmit = (values: PropertyFormValues) => {
    const submitData: PropertyFormPayload = {
      title: values.title,
      address: values.address,
      zone: values.zone,
      price: !isAgent.value || !props.propertyId ? values.price : 0,
      type: values.type,
      operationType: values.operationType as OperationType,
      m2: values.m2,
      rooms: values.rooms,
      ownerId: values.ownerId || null,
      imageUrls: values.imageUrls || [],
    };

    emit('submit', submitData);
  };

  const submit = handleSubmit(onSubmit);

  watch(
    () => props.initialData,
    (data) => {
      if (data) {
        setValues({
          title: (data.title as string) || '',
          address: (data.address as string) || '',
          zone: (data.zone as string) || '',
          price: (data.price as number) || 0,
          type: (data.type as string) || 'DEPARTAMENTO',
          operationType: (data.operationType as string) || '',
          m2: (data.m2 as number) || 0,
          rooms: (data.rooms as number) || 0,
          ownerId: (data.ownerId as string) || '',
          imageUrls: (data.imageUrls as string[]) || [],
        });
      }
    },
    { immediate: true }
  );

  onMounted(loadOwners);

  const savingLocation = ref(false);
  const locationModel = ref({
    lat: (props.initialData?.latitude as number) || null,
    lng: (props.initialData?.longitude as number) || null,
  });

  const handleSaveLocation = async () => {
    const { lat, lng } = locationModel.value;

    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      toast.message = 'Por favor, ingresa coordenadas válidas o selecciona un punto en el mapa.';
      toast.type = 'error';
      toast.show = true;
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.message = 'La latitud debe estar entre -90 y 90 grados.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    if (lng < -180 || lng > 180) {
      toast.message = 'La longitud debe estar entre -180 y 180 grados.';
      toast.type = 'error';
      toast.show = true;
      return;
    }

    savingLocation.value = true;
    try {
      const updatedProperty = await propertyService.updateLocation(props.propertyId!, lat, lng);

      toast.message = t('propertyForm.locationSuccess');
      toast.type = 'success';
      toast.show = true;

      emit('location-updated', updatedProperty);
    } catch (error) {
      const appError = handleApiError(error);
      toast.message = `Error: ${appError.message}`;
      toast.type = 'error';
      toast.show = true;
      console.error('Detalle técnico:', error);
    } finally {
      savingLocation.value = false;
    }
  };
</script>
