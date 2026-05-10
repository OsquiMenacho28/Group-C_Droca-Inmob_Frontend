<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="5xl">
    <template #header>
      <div class="flex items-center space-x-4">
        <h3 class="text-2xl font-bold dark:text-white">
          {{ client.fullName }}
        </h3>
        <fwb-badge type="indigo">{{ t('clientDetails.profileBadge') }}</fwb-badge>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-4 lg:col-span-1">
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
              {{ t('clientDetails.searchPreferences') }}
            </h4>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-gray-500 mb-1">{{ t('clientDetails.preferredZone') }}</p>
                <div class="flex flex-wrap gap-1">
                  <fwb-badge v-for="z in client.preferredZones" :key="z" type="default" size="xs">
                    {{ z }}
                  </fwb-badge>
                  <span v-if="!client.preferredZones?.length" class="dark:text-white">
                    {{ t('clientDetails.any') }}
                  </span>
                </div>
              </div>

              <div class="flex justify-between border-t pt-2 dark:border-gray-700">
                <span class="text-gray-500">{{ t('users.view.rooms') }}</span>
                <span class="dark:text-white font-bold">
                  {{ client.minRooms || 0 }} - {{ client.maxRooms || '∞' }}
                </span>
              </div>

              <div class="flex justify-between border-t pt-2 dark:border-gray-700">
                <span class="text-gray-500">{{ t('clientDetails.budget') }} (Máx)</span>
                <span class="text-green-600 font-bold">
                  ${{ Number(client.maxPrice || 0).toLocaleString() }}
                </span>
              </div>
            </div>

            <fwb-button
              @click="fetchSuggestions"
              color="blue"
              size="sm"
              class="w-full mt-5 shadow-lg"
              :disabled="loadingSuggestions"
            >
              <div class="flex items-center justify-center gap-2">
                <IconLucideSearch v-if="!loadingSuggestions" class="w-4 h-4" />
                <div
                  v-else
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                {{
                  t('retirement.motivoLabel') === 'Reason *'
                    ? 'View Suggestions'
                    : 'Ver Propiedades Sugeridas'
                }}
              </div>
            </fwb-button>
          </div>

          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              {{ t('clientDetails.directContact') }}
            </h4>
            <p class="text-sm dark:text-white flex items-center gap-2">
              <IconLucideMail class="w-4 h-4 text-gray-400" />
              {{ client.email }}
            </p>
            <p class="text-sm dark:text-white mt-1 flex items-center gap-2">
              <IconLucidePhone class="w-4 h-4 text-gray-400" />
              {{ client.phone }}
            </p>
          </div>

          <IdentityDocumentsSection
            :person-id="client.personId"
            :auth-user-id="client.authUserId"
          />
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div v-if="hasSearched">
            <h4 class="font-bold dark:text-white mb-4 flex items-center gap-2">
              <IconLucideBuilding class="w-5 h-5 text-blue-500" />
              {{
                t('retirement.motivoLabel') === 'Reason *'
                  ? 'Suggested Matches'
                  : 'Inmuebles que coinciden'
              }}
            </h4>

            <div
              v-if="suggestions.length === 0"
              class="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl text-center dark:bg-yellow-900/20 dark:border-yellow-800"
            >
              <IconLucideAlertTriangle class="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p class="text-yellow-800 dark:text-yellow-200 font-bold">
                {{
                  t('retirement.motivoLabel') === 'Reason *'
                    ? 'No properties found'
                    : 'No existen inmuebles que coincidan con estas preferencias.'
                }}
              </p>
              <p class="text-xs text-yellow-600 mt-1">
                Intente ajustar los rangos de habitaciones o zonas.
              </p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="prop in suggestions"
                :key="prop.id"
                class="group p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex gap-4 hover:border-blue-500 transition-all"
              >
                <div
                  class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0"
                >
                  <img
                    v-if="prop.imageUrls?.length"
                    :src="prop.imageUrls[0]"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <IconLucideImage class="w-8 h-8" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-primary truncate">
                    {{ prop.title }}
                  </p>
                  <p class="text-[11px] text-secondary mt-1">{{ prop.zone }}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <span
                      class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-bold text-gray-600 dark:text-gray-300"
                    >
                      {{ prop.rooms }} cuartos
                    </span>
                    <p class="text-blue-600 dark:text-blue-400 font-black text-sm">
                      ${{ prop.price.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="relative pl-6 border-l-2 border-blue-500">
            <div
              class="absolute -left-2.25 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
              {{ t('clientDetails.changeHistory') }}
            </h4>
            <div
              v-if="client.auditLog?.length"
              class="space-y-4 max-h-100 overflow-y-auto pr-2 scrollbar-thin"
            >
              <div
                v-for="(entry, i) in [...client.auditLog].reverse()"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-xs"
              >
                <div class="flex justify-between text-[10px] text-gray-400 mb-2">
                  <span class="font-bold uppercase">{{ entry.changedBy }}</span>
                  <span>{{ new Date(entry.changedAt).toLocaleDateString() }}</span>
                </div>
                <div v-for="(ch, j) in entry.changes" :key="j" class="flex items-center gap-1 mt-1">
                  <span class="font-semibold text-gray-500">{{ ch.field }}:</span>
                  <span class="text-red-400 line-through">{{ ch.oldValue || 'vacio' }}</span>
                  <IconLucideArrowRight class="w-2 h-2" />
                  <span class="text-green-500 font-bold">{{ ch.newValue }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 italic">{{ t('clientDetails.noChanges') }}</p>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <fwb-button v-if="hasSearched" color="alternative" @click="hasSearched = false">
          Ver Historial
        </fwb-button>
        <fwb-button color="alternative" @click="$emit('close')">{{ t('common.close') }}</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { FwbModal, FwbBadge, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideBuilding from '~icons/lucide/building';
  import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
  import IconLucideMail from '~icons/lucide/mail';
  import IconLucidePhone from '~icons/lucide/phone';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import IdentityDocumentsSection from '@/components/users/IdentityDocumentsSection.vue';

  const { t } = useI18n();
  defineProps<{ show: boolean; client: Record<string, unknown> }>();
  defineEmits(['close']);

  const suggestions = ref([]);
  const loadingSuggestions = ref(false);
  const hasSearched = ref(false);

  const fetchSuggestions = async () => {
    loadingSuggestions.value = true;
    try {
      // Usamos el authUserId (ID de identidad) para filtrar
      const searchId = props.client.authUserId || props.client.id;
      const response = await api.get(`/properties/filtrar?buscador_id=${searchId}`);
      suggestions.value = response.data.data || [];
      hasSearched.value = true;
    } catch {
      console.error('Error al obtener sugerencias:');
    } finally {
      loadingSuggestions.value = false;
    }
  };

  // Necesitamos importar el api client si no se usa el propertyService directamente
  import { apiClient as api } from '@/api';
</script>
