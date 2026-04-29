<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('vehicleAdmin.title') }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('vehicleAdmin.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <fwb-badge type="indigo">{{ t('vehicleAdmin.adminMode') }}</fwb-badge>
        <div
          class="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
        >
          {{ t('vehicleAdmin.totalVehicles') }}: {{ vehicles.length }}
        </div>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('vehicleAdmin.createTitle') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('vehicleAdmin.createDescription') }}
          </p>
        </div>

        <div
          v-if="feedback.message"
          class="mb-4 rounded-xl border px-4 py-3 text-sm"
          :class="
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
          "
        >
          {{ feedback.message }}
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('vehicleAdmin.plate') }}
            </label>
            <input
              v-model.trim="form.licensePlate"
              type="text"
              class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :placeholder="t('vehicleAdmin.platePlaceholder')"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('vehicleAdmin.brand') }}
              </label>
              <input
                v-model.trim="form.brand"
                type="text"
                class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :placeholder="t('vehicleAdmin.brandPlaceholder')"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('vehicleAdmin.model') }}
              </label>
              <input
                v-model.trim="form.model"
                type="text"
                class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :placeholder="t('vehicleAdmin.modelPlaceholder')"
              />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('vehicleAdmin.capacity') }}
              </label>
              <input
                v-model.number="form.passengerCapacity"
                type="number"
                min="1"
                class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :placeholder="t('vehicleAdmin.capacityPlaceholder')"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('vehicleAdmin.status') }}
              </label>
              <select
                v-model="form.status"
                class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{{ t('vehicleAdmin.selectStatus') }}</option>
                <option value="AVAILABLE">{{ t('vehicleAdmin.statusAvailable') }}</option>
                <option value="IN_USE">{{ t('vehicleAdmin.statusInUse') }}</option>
                <option value="MAINTENANCE">{{ t('vehicleAdmin.statusMaintenance') }}</option>
              </select>
            </div>
          </div>

          <div
            class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
          >
            {{ t('vehicleAdmin.availabilityHint') }}
          </div>

          <div class="flex justify-end">
            <fwb-button :disabled="submitting" gradient="blue" type="submit">
              {{ submitting ? t('common.saving') : t('vehicleAdmin.submit') }}
            </fwb-button>
          </div>
        </form>
      </section>

      <section
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('vehicleAdmin.fleetTitle') }}
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t('vehicleAdmin.fleetSubtitle') }}
            </p>
          </div>
          <fwb-button color="alternative" @click="loadVehicles">
            {{ t('common.refresh') }}
          </fwb-button>
        </div>

        <div
          v-if="loadingVehicles"
          class="py-16 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          {{ t('vehicleAdmin.loadingFleet') }}
        </div>

        <div
          v-else-if="fleetError"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
        >
          {{ fleetError }}
        </div>

        <div
          v-else-if="vehicles.length === 0"
          class="rounded-xl border-2 border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
        >
          {{ t('vehicleAdmin.emptyFleet') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('vehicleAdmin.plate') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('vehicleAdmin.brand') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('vehicleAdmin.model') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('vehicleAdmin.capacity') }}
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ t('vehicleAdmin.status') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <td class="px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ vehicle.licensePlate }}
                </td>
                <td class="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                  {{ vehicle.brand }}
                </td>
                <td class="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                  {{ vehicle.model }}
                </td>
                <td class="px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                  {{ vehicle.passengerCapacity }}
                </td>
                <td class="px-3 py-4 text-sm">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="statusClasses(vehicle.status)"
                  >
                    {{ statusLabel(vehicle.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';
  import { FwbBadge, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import vehicleService from '@/services/vehicleService';
  import type { CreateVehicleRequest, Vehicle, VehicleStatus } from '@/types/visitCalendar';

  const { t } = useI18n();

  const vehicles = ref<Vehicle[]>([]);
  const loadingVehicles = ref(false);
  const submitting = ref(false);
  const fleetError = ref('');
  const feedback = ref<{ type: 'success' | 'error'; message: string }>({
    type: 'success',
    message: '',
  });

  const initialForm = (): CreateVehicleRequest => ({
    licensePlate: '',
    brand: '',
    model: '',
    passengerCapacity: 1,
    status: 'AVAILABLE',
  });

  const form = reactive<CreateVehicleRequest>(initialForm());

  const resetForm = () => {
    Object.assign(form, initialForm());
  };

  const loadVehicles = async () => {
    loadingVehicles.value = true;
    fleetError.value = '';
    try {
      vehicles.value = await vehicleService.getVehicles();
    } catch {
      fleetError.value = t('vehicleAdmin.loadError');
    } finally {
      loadingVehicles.value = false;
    }
  };

  const validateForm = () => {
    if (!form.licensePlate || !form.brand || !form.model || !form.status) {
      feedback.value = { type: 'error', message: t('vehicleAdmin.requiredFields') };
      return false;
    }

    if (!Number.isFinite(form.passengerCapacity) || form.passengerCapacity <= 0) {
      feedback.value = { type: 'error', message: t('vehicleAdmin.invalidCapacity') };
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    feedback.value.message = '';

    if (!validateForm()) {
      return;
    }

    submitting.value = true;
    try {
      const created = await vehicleService.createVehicle({
        ...form,
        licensePlate: form.licensePlate.toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
      });
      vehicles.value = [created, ...vehicles.value.filter((vehicle) => vehicle.id !== created.id)];
      resetForm();
      feedback.value = { type: 'success', message: t('vehicleAdmin.successMessage') };
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: string }).message || '')
          : '';
      feedback.value = {
        type: 'error',
        message: message || t('vehicleAdmin.errorMessage'),
      };
    } finally {
      submitting.value = false;
    }
  };

  const statusLabel = (status: VehicleStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return t('vehicleAdmin.statusAvailable');
      case 'IN_USE':
        return t('vehicleAdmin.statusInUse');
      case 'MAINTENANCE':
        return t('vehicleAdmin.statusMaintenance');
      default:
        return status;
    }
  };

  const statusClasses = (status: VehicleStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200';
      case 'IN_USE':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  onMounted(() => {
    loadVehicles();
  });
</script>
