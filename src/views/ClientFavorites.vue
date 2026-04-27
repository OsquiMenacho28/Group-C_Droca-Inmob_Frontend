<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('favorites.title') }}</h1>
        <p class="text-gray-500 text-sm">{{ t('favorites.subtitle') }}</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">{{ t('favorites.badge', { n: favorites.size }) }}</fwb-badge>
        <router-link to="/properties">
          <fwb-button gradient="blue" size="sm">
            <div class="flex items-center">
              <IconLucideSearch class="w-4 h-4 mr-2" />
              {{ t('favorites.searchMore') }}
            </div>
          </fwb-button>
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('favorites.loading') }}</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400"
    >
      {{ error }}
      <button @click="loadFavoritesAndProperties" class="ml-2 underline hover:text-red-800">
        {{ t('common.retry') }}
      </button>
    </div>

    <div
      v-else-if="favoriteProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideHeart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
        {{ t('favorites.emptyTitle') }}
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mb-4">
        {{ t('favorites.emptyText') }}
      </p>
      <router-link to="/properties">
        <fwb-button gradient="blue">{{ t('favorites.explore') }}</fwb-button>
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card
        v-for="prop in favoriteProperties"
        :key="prop.id"
        class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative group"
      >
        <button
          @click.stop="removeFavorite(prop.id)"
          class="absolute top-3 right-3 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
          :title="t('favorites.removeTooltip')"
        >
          <IconLucideTrash class="w-4 h-4" />
        </button>

        <button
          @click.stop="viewDetails(prop)"
          class="absolute top-3 left-3 z-20 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
          :title="t('favorites.viewDetails')"
        >
          <IconLucideEye class="w-4 h-4" />
        </button>

        <div
          class="absolute top-3 right-3 z-10 opacity-100 group-hover:opacity-0 transition-opacity"
        >
          <div class="bg-red-500 text-white rounded-full p-1.5 shadow-md">
            <IconLucideHeart class="w-4 h-4" fill="currentColor" />
          </div>
        </div>

        <div
          class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative"
        >
          <img
            v-if="prop.imageUrls && prop.imageUrls.length > 0"
            :src="prop.imageUrls[0]"
            class="h-full w-full object-cover"
            @error="handleImageError(prop)"
          />
          <div v-else class="flex flex-col items-center">
            <IconLucideImage class="w-12 h-12 mb-2" />
            <span class="text-sm">{{ t('common.noImage') }}</span>
          </div>
          <div class="absolute bottom-2 right-2">
            <span
              class="px-2 py-1 rounded-full text-xs font-semibold shadow-md"
              :class="{
                'bg-green-500 text-white': prop.status === 'DISPONIBLE',
                'bg-yellow-500 text-white': prop.status === 'RESERVADO',
                'bg-red-500 text-white': prop.status === 'VENDIDO',
                'bg-blue-500 text-white': prop.status === 'EN_NEGOCIACION',
                'bg-gray-500 text-white': ![
                  'DISPONIBLE',
                  'RESERVADO',
                  'VENDIDO',
                  'EN_NEGOCIACION',
                ].includes(prop.status),
              }"
            >
              {{ t('status.' + prop.status) }}
            </span>
          </div>
          <div class="absolute bottom-2 left-2">
            <fwb-badge :type="getOpTypeBadge(prop.operationType)">
              {{
                prop.operationType
                  ? t('propertyOperations.' + prop.operationType)
                  : t('propertyOperations.VENTA')
              }}
            </fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex gap-2 mb-2">
            <fwb-badge type="dark" size="xs">
              {{ prop.type ? t('propertyTypes.' + prop.type) : t('common.type') }}
            </fwb-badge>
            <fwb-badge v-if="prop.m2" type="dark" size="xs">
              {{ prop.m2 }} {{ t('common.m2') }}
            </fwb-badge>
          </div>

          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {{ prop.title }}
          </h5>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {{ prop.address }}
          </p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold tracking-tighter">
                {{ t('common.price') }}
              </p>
              <p class="text-2xl font-black text-blue-600">
                ${{ (prop.price || 0).toLocaleString(getLocaleString()) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">
                {{ t('favorites.scheduleVisit') }}
              </p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ prop.rooms || '—' }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <fwb-button size="sm" gradient="blue" @click="requestVisit(prop)" class="w-full">
              {{ t('favorites.scheduleVisit') }}
            </fwb-button>
            <fwb-button size="sm" color="alternative" @click="viewDetails(prop)" class="w-full">
              {{ t('favorites.viewDetails') }}
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <property-details-modal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProperty"
      :is-client-view="true"
      @close="showDetailsModal = false"
    />

    <fwb-modal v-if="showRemoveModal" @close="showRemoveModal = false">
      <template #header>
        <span class="text-red-600 dark:text-red-400">{{ t('favorites.removeConfirmTitle') }}</span>
      </template>
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          {{
            t('favorites.removeConfirmText', {
              name: propertyToRemove?.title || t('common.noImage'),
            })
          }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" @click="showRemoveModal = false">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button color="red" @click="confirmRemove">{{ t('favorites.yesRemove') }}</fwb-button>
        </div>
      </template>
    </fwb-modal>

    <div v-if="successMessage" class="fixed top-4 right-4 z-50 max-w-sm">
      <fwb-alert type="success" class="shadow-lg">
        {{ successMessage }}
      </fwb-alert>
    </div>

    <div v-if="errorMessage" class="fixed top-4 right-4 z-50 max-w-sm">
      <fwb-alert type="danger" class="shadow-lg">
        {{ errorMessage }}
      </fwb-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { FwbCard, FwbButton, FwbBadge, FwbModal, FwbAlert } from 'flowbite-vue';
  import { favoriteService } from '@/services/favoriteService';
  import { propertyService } from '@/modules/properties';
  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import type { Property } from '@/types/property';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideHeart from '~icons/lucide/heart';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideImage from '~icons/lucide/image';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  const loading = ref(false);
  const error = ref('');
  const favorites = ref<Set<string>>(new Set());
  const favoriteProperties = ref<Property[]>([]);
  const showDetailsModal = ref(false);
  const selectedProperty = ref<Property | null>(null);
  const showRemoveModal = ref(false);
  const propertyToRemove = ref<Property | null>(null);
  const successMessage = ref('');
  const errorMessage = ref('');

  let successTimer: ReturnType<typeof setTimeout> | null = null;
  let errorTimer: ReturnType<typeof setTimeout> | null = null;

  const router = useRouter();

  const requestVisit = (prop: Property) => {
    router.push({
      path: '/properties',
      query: { openVisitPropertyId: prop.id },
    });
  };

  const getOpTypeBadge = (type: string) => {
    switch (type) {
      case 'VENTA':
        return 'indigo';
      case 'ALQUILER':
        return 'green';
      case 'ANTICRETICO':
        return 'yellow';
      default:
        return 'dark';
    }
  };

  const handleImageError = (prop: Property) => {
    prop.imageUrls = [];
  };

  const loadFavoritesAndProperties = async () => {
    loading.value = true;
    error.value = '';

    try {
      const favoriteIds = await favoriteService.getFavorites();
      favorites.value = new Set(favoriteIds);

      if (favoriteIds.length === 0) {
        favoriteProperties.value = [];
        loading.value = false;
        return;
      }

      const allPropertiesResponse = await propertyService.getProperties();
      const allProperties = allPropertiesResponse.data || [];

      const filtered = allProperties.filter((p: Property) => favoriteIds.includes(p.id as string));

      favoriteProperties.value = favoriteIds
        .map((id) => filtered.find((p: Property) => p.id === id))
        .filter((p): p is Property => Boolean(p));
    } catch (err: unknown) {
      console.error('Error loading favorites:', err);
      error.value =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        (err as { message?: string }).message ||
        t('favorites.loadError');
    } finally {
      loading.value = false;
    }
  };

  const removeFavorite = (propertyId: string) => {
    const property = favoriteProperties.value.find((p) => p.id === propertyId);
    propertyToRemove.value = property || null;
    showRemoveModal.value = true;
  };

  const confirmRemove = async () => {
    if (!propertyToRemove.value) return;

    showRemoveModal.value = false;

    try {
      await favoriteService.removeFavorite(propertyToRemove.value.id);
      favorites.value.delete(propertyToRemove.value.id);
      favoriteProperties.value = favoriteProperties.value.filter(
        (p) => p.id !== propertyToRemove.value!.id
      );

      successMessage.value = t('favorites.removedSuccess');
      errorMessage.value = '';

      if (successTimer) clearTimeout(successTimer);
      successTimer = setTimeout(() => {
        successMessage.value = '';
      }, 1500);
    } catch (err: unknown) {
      console.error('Error removing favorite:', err);
      errorMessage.value =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        t('favorites.removeError');
      successMessage.value = '';

      if (errorTimer) clearTimeout(errorTimer);
      errorTimer = setTimeout(() => {
        errorMessage.value = '';
      }, 1500);
    }

    propertyToRemove.value = null;
  };

  const viewDetails = (property: Property) => {
    selectedProperty.value = property;
    showDetailsModal.value = true;
  };

  onMounted(() => {
    loadFavoritesAndProperties();
  });
</script>
