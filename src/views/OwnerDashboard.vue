<template>
  <div class="p-6 space-y-6">
    <h1 class="text-3xl font-bold dark:text-white">{{ t('ownerDashboard.title') }}</h1>
    <p class="text-gray-500">{{ t('ownerDashboard.subtitle') }}</p>

    <div v-if="loading" class="text-center py-10">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('ownerDashboard.loading') }}</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {{ error }}
    </div>

    <div
      v-else-if="properties.length === 0"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center"
    >
      <p class="text-yellow-800">{{ t('ownerDashboard.emptyTitle') }}</p>
      <p class="text-yellow-600 text-sm mt-2">
        {{ t('ownerDashboard.emptySubtext') }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="prop in properties"
        :key="prop.id"
        @click="openDetails(prop)"
        class="cursor-pointer"
      >
        <fwb-card
          class="overflow-hidden hover:shadow-lg transition-shadow relative h-full"
        >
          <div class="absolute top-4 right-4 z-10">
            <div
              class="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 shadow-lg"
            >
              <IconLucideEye class="w-4 h-4" />
              {{ prop.visitCount || 0 }}
              {{ t('ownerDashboard.visits', { n: prop.visitCount || 0 }) }}
            </div>
          </div>

          <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
            <img
              v-if="prop.imageUrls && prop.imageUrls.length > 0"
              :src="prop.imageUrls[0]"
              class="h-full w-full object-cover"
            />
            <div v-else class="text-gray-400 flex flex-col items-center">
              <IconLucideImage class="w-12 h-12 mb-2" />
              <span class="text-sm">{{ t('common.noImage') }}</span>
            </div>
            <div class="absolute top-4 left-4">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-semibold shadow-md',
                  prop.status === 'DISPONIBLE'
                    ? 'bg-green-500 text-white'
                    : prop.status === 'RESERVADO'
                      ? 'bg-yellow-500 text-white'
                      : prop.status === 'VENDIDO'
                        ? 'bg-red-500 text-white'
                        : prop.status === 'EN_NEGOCIACION'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white',
                ]"
              >
                {{
                  prop.status === 'DISPONIBLE'
                    ? t('status.available')
                    : prop.status === 'RESERVADO'
                      ? t('status.reserved')
                      : prop.status === 'VENDIDO'
                        ? t('status.sold')
                        : prop.status === 'EN_NEGOCIACION'
                          ? t('status.negotiating')
                          : prop.status || t('status.occupied')
                }}
              </span>
            </div>
          </div>

          <div class="p-5">
            <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {{ prop.title }}
            </h5>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {{ prop.address }}
            </p>

            <div class="flex justify-between items-center mb-4">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">{{ t('common.price') }}</p>
                <p class="text-2xl font-bold text-blue-600">${{ prop.price.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">{{ t('common.type') }}</p>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ prop.type }}
                </p>
              </div>
            </div>

            <div
              class="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3"
            >
              <div class="flex items-center gap-1">
                <span>📐</span>
                {{ prop.m2 }} m²
              </div>
              <div class="flex items-center gap-1">
                <span>🛏️</span>
                {{ prop.rooms }} {{ t('users.view.rooms') }}
              </div>
              <div class="flex items-center gap-1 col-span-2">
                <span>👤</span>
                {{ t('common.agent') }}
                {{ prop.assignedAgentName || prop.assignedAgentId || t('common.unassigned') }}
              </div>
            </div>
          </div>
        </fwb-card>
      </div>
    </div>

    <!-- Property Details Modal -->
    <property-details-modal
      v-if="selectedProperty"
      :show="!!selectedProperty"
      :property="selectedProperty"
      :is-client-view="false"
      @close="selectedProperty = null"
      @status-updated="handleStatusUpdated"
    />
  </div>
</template>

<script setup lang="ts">
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideImage from '~icons/lucide/image';
  import { ref, onMounted } from 'vue';
  import { FwbCard } from 'flowbite-vue';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { propertyService } from '@/modules/properties';
  import { getVisitCountForProperty } from '@/services/visitRequestService';
  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import type { Property } from '@/types/property';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  interface PropertyWithVisits {
    id: string;
    title: string;
    address: string;
    price: number;
    type: string;
    status: string;
    m2: number;
    rooms: number;
    assignedAgentName?: string;
    assignedAgentId?: string | null;
    imageUrls?: string[];
    visitCount: number;
  }

  const authStore = useAuthStore();
  const properties = ref<PropertyWithVisits[]>([]);
  const loading = ref(false);
  const error = ref('');
  const selectedProperty = ref<Property | null>(null);

  const loadProperties = async () => {
    loading.value = true;
    error.value = '';

    try {
      const u = authStore.user as UserClaims | null;
      const ownerId = (u?.sub || u?.userId || u?.id || '') as string;

      if (!ownerId) {
        throw new Error(t('ownerDashboard.loadError'));
      }

      console.log('Loading properties for owner:', ownerId);

      const props = await propertyService.getPropertiesByOwner(ownerId);

      console.log('Properties found:', props.length);

      const propsWithVisits = await Promise.all(
        (props as PropertyWithVisits[]).map(async (prop: PropertyWithVisits) => {
          try {
            const visitCount = await getVisitCountForProperty(prop.id);
            console.log(`Property ${prop.id} (${prop.title}) has ${visitCount} visits`);
            return { ...prop, visitCount };
          } catch {
            console.error(`Error fetching visits for property ${prop.id}:`);
            return { ...prop, visitCount: 0 };
          }
        })
      );

      properties.value = propsWithVisits;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { status?: number };
        message?: string;
      };
      console.error('Error loading owner properties:', err);

      if (errorObj.response?.status === 403) {
        error.value = t('ownerDashboard.loadError');
      } else if (errorObj.response?.status === 404) {
        error.value = t('ownerDashboard.emptyTitle');
      } else if (errorObj.message === 'Network Error') {
        error.value = t('common.error') + ': ' + t('ownerDashboard.loadError');
      } else {
        error.value = errorObj.message || t('ownerDashboard.loadError');
      }
    } finally {
      loading.value = false;
    }
  };

  const openDetails = (prop: PropertyWithVisits) => {
    selectedProperty.value = prop as Property;
  };

  const handleStatusUpdated = async () => {
    await loadProperties();
  };

  onMounted(loadProperties);
</script>