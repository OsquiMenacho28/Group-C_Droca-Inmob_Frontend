<template>
  <div class="p-6 space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Mis Favoritos</h1>
        <p class="text-gray-500 text-sm">
          Propiedades que has guardado como favoritas
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">{{ favorites.size }} favoritos</fwb-badge>
        <router-link to="/properties">
          <fwb-button gradient="blue" size="sm">
            <div class="flex items-center">
              <IconLucideSearch class="w-4 h-4 mr-2" />
              Buscar más propiedades
            </div>
          </fwb-button>
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">Cargando tus favoritos...</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400"
    >
      {{ error }}
      <button
        @click="loadFavoritesAndProperties"
        class="ml-2 underline hover:text-red-800"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="favoriteProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <IconLucideHeart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
        No tienes propiedades favoritas aún
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mb-4">
        Explora nuestras propiedades y marca las que más te gusten
      </p>
      <router-link to="/properties">
        <fwb-button gradient="blue">Explorar propiedades</fwb-button>
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
          title="Quitar de favoritos"
        >
          <IconLucideTrash class="w-4 h-4" />
        </button>

        <button
          @click.stop="viewDetails(prop)"
          class="absolute top-3 left-3 z-20 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
          title="Ver detalles"
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
            <span class="text-sm">Sin imagen</span>
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
              {{
                prop.status === 'DISPONIBLE'
                  ? 'Disponible'
                  : prop.status === 'RESERVADO'
                    ? 'Reservado'
                    : prop.status === 'VENDIDO'
                      ? 'Vendido'
                      : prop.status === 'EN_NEGOCIACION'
                        ? 'En Negociación'
                        : prop.status || 'Ocupado'
              }}
            </span>
          </div>
          <div class="absolute bottom-2 left-2">
            <fwb-badge :type="getOpTypeBadge(prop.operationType)">
              {{ prop.operationType || 'VENTA' }}
            </fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex gap-2 mb-2">
            <fwb-badge type="dark" size="xs">{{
              prop.type || 'Propiedad'
            }}</fwb-badge>
            <fwb-badge v-if="prop.m2" type="dark" size="xs"
              >{{ prop.m2 }} m²</fwb-badge
            >
          </div>

          <h5
            class="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1"
          >
            {{ prop.title }}
          </h5>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {{ prop.address }}
          </p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p
                class="text-xs text-gray-400 uppercase font-bold tracking-tighter"
              >
                Precio
              </p>
              <p class="text-2xl font-black text-blue-600">
                ${{ (prop.price || 0).toLocaleString() }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">
                Habitaciones
              </p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ prop.rooms || '—' }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <router-link
              :to="`/properties/${prop.id}/request-visit`"
              custom
              v-slot="{ navigate }"
            >
              <fwb-button
                size="sm"
                gradient="blue"
                @click="navigate"
                class="w-full"
              >
                Agendar Visita
              </fwb-button>
            </router-link>
            <fwb-button
              size="sm"
              color="alternative"
              @click="viewDetails(prop)"
              class="w-full"
            >
              Ver Detalles
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FwbCard, FwbButton, FwbBadge } from 'flowbite-vue';
import { favoriteService } from '@/services/favoriteService';
import { propertyService } from '@/services/propertyService';
import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
import type { Property } from '@/types/property';
import Swal from 'sweetalert2';
import IconLucideSearch from '~icons/lucide/search';
import IconLucideHeart from '~icons/lucide/heart';
import IconLucideTrash from '~icons/lucide/trash';
import IconLucideEye from '~icons/lucide/eye';
import IconLucideImage from '~icons/lucide/image';

const loading = ref(false);
const error = ref('');
const favorites = ref<Set<string>>(new Set());
const favoriteProperties = ref<Property[]>([]);
const showDetailsModal = ref(false);
const selectedProperty = ref<Property | null>(null);

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

    const allProperties = await propertyService.getProperties();

    const filtered = allProperties.filter((p: Property) =>
      favoriteIds.includes(p.id as string)
    );

    favoriteProperties.value = favoriteIds
      .map((id) => filtered.find((p: Property) => p.id === id))
      .filter((p): p is Property => Boolean(p));
  } catch (err: unknown) {
    console.error('Error loading favorites:', err);
    error.value =
      (err as { response?: { data?: { detail?: string } } }).response?.data
        ?.detail ||
      (err as { message?: string }).message ||
      'Error al cargar tus favoritos';
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (propertyId: string) => {
  const property = favoriteProperties.value.find((p) => p.id === propertyId);
  const propertyName = property?.title || 'esta propiedad';

  const result = await Swal.fire({
    title: '¿Quitar de favoritos?',
    text: `¿Seguro que deseas eliminar "${propertyName}" de tus favoritos?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, quitar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  });

  if (!result.isConfirmed) return;

  try {
    await favoriteService.removeFavorite(propertyId);
    favorites.value.delete(propertyId);
    favoriteProperties.value = favoriteProperties.value.filter(
      (p) => p.id !== propertyId
    );

    await Swal.fire({
      title: 'Eliminado',
      text: 'Propiedad eliminada de tus favoritos',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err: unknown) {
    console.error('Error removing favorite:', err);
    await Swal.fire({
      title: 'Error',
      text:
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || 'No se pudo eliminar de favoritos',
      icon: 'error',
      confirmButtonColor: '#dc2626',
    });
  }
};

const viewDetails = (property: Property) => {
  selectedProperty.value = property;
  showDetailsModal.value = true;
};

onMounted(() => {
  loadFavoritesAndProperties();
});
</script>
