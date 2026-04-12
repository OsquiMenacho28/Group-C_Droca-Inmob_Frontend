<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  >
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <router-link
            to="/dashboard"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <IconLucideArrowLeft class="h-5 w-5" />
          </router-link>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Propiedades disponibles
          </h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Encuentra tu próximo hogar y agenda una visita con un agente
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Buscar por título</label
            >
            <input
              v-model="filters.title"
              placeholder="Casa Blanca..."
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Tipo</label
            >
            <select
              v-model="filters.type"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="LOCAL">Local Comercial</option>
            </select>
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Precio mínimo ($)</label
            >
            <input
              v-model.number="filters.minPrice"
              type="number"
              min="0"
              placeholder="0"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Precio máximo ($)</label
            >
            <input
              v-model.number="filters.maxPrice"
              type="number"
              min="0"
              placeholder="Sin límite"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Ordenar por</label
            >
            <select
              v-model="filters.sortBy"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Precio</option>
              <option value="title">Título</option>
              <option value="m2">Superficie</option>
              <option value="rooms">Habitaciones</option>
            </select>
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Orden</label
            >
            <select
              v-model="filters.sortOrder"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASC">Ascendente</option>
              <option value="DESC">Descendente</option>
            </select>
          </div>

          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
              >Ver</label
            >
            <select
              v-model="filters.pageSize"
              @change="applyFilters"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="opt in PAGE_SIZE_OPTIONS" :key="opt" :value="opt">
                {{ opt }} por página
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-3">
          <button
            @click="applyFilters"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aplicar filtros
          </button>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpiar
          </button>
        </div>

        <p
          class="text-xs text-green-700 dark:text-green-400 mt-2 flex items-center gap-1"
        >
          <IconLucideCircleCheck class="h-3.5 w-3.5" />
          Mostrando solo propiedades <strong class="ml-0.5">Disponibles</strong>
        </p>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-semibold text-gray-900 dark:text-white">{{
          properties.length
        }}</span>
        propiedad{{ properties.length !== 1 ? 'es' : '' }} encontrada{{
          properties.length !== 1 ? 's' : ''
        }}
      </p>

      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-64 animate-pulse transition-colors"
        >
          <div class="h-36 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
          <div class="p-4 space-y-2">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm transition-colors"
      >
        {{ error }}
        <button
          @click="loadProperties"
          class="ml-2 underline hover:text-red-800 dark:hover:text-red-300"
        >
          Reintentar
        </button>
      </div>

      <div
        v-else-if="properties.length === 0"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors"
      >
        <IconLucideHome
          class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
        />
        <p class="text-gray-500 dark:text-gray-400 font-medium">
          No hay propiedades disponibles con esos filtros.
        </p>
        <button
          @click="clearFilters"
          class="mt-2 text-sm text-blue-600 dark:text-blue-400 underline"
        >
          Ver todas
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          @click="openPropertyModal(prop)"
        >
          <div
            class="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center transition-colors"
          >
            <img
              v-if="prop.imageUrl"
              :src="prop.imageUrl"
              :alt="prop.title"
              class="w-full h-full object-cover"
            />
            <IconLucideHome
              v-else
              class="h-16 w-16 text-blue-300 dark:text-gray-500"
            />
            <span
              class="absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
              :class="{
                'bg-green-500 dark:bg-green-600': prop.status === 'DISPONIBLE',
                'bg-yellow-500 dark:bg-yellow-600': prop.status === 'RESERVADO',
                'bg-red-500 dark:bg-red-600': prop.status === 'VENDIDO',
                'bg-orange-500 dark:bg-orange-600':
                  prop.status === 'EN_NEGOCIACION',
                'bg-gray-500 dark:bg-gray-600': ![
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
                        : prop.status
              }}
            </span>
            <span
              class="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ prop.type }}
            </span>

            <button
              @click.stop="toggleFavorite(prop.id)"
              class="absolute top-3 right-12 p-2 rounded-full backdrop-blur-md transition-all"
              :class="
                isFavorite(prop.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-400 hover:text-red-500'
              "
            >
              <IconLucideHeart
                class="w-5 h-5"
                :fill="isFavorite(prop.id) ? 'currentColor' : 'none'"
              />
            </button>
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ prop.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              📍 {{ prop.address }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Zona: {{ prop.zone }}
            </p>

            <div class="flex items-center justify-between mt-3">
              <span class="text-lg font-bold text-blue-700 dark:text-blue-400">
                ${{ prop.price.toLocaleString('es-BO') }}
              </span>
            </div>
            <button
              v-if="prop.status === 'DISPONIBLE'"
              @click.stop="openRequestModal(prop)"
              class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Agendar visita
            </button>
            <button
              v-else
              disabled
              class="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-not-allowed"
            >
              {{
                prop.status === 'VENDIDO'
                  ? 'Vendida'
                  : prop.status === 'RESERVADO'
                    ? 'Reservada'
                    : prop.status === 'EN_NEGOCIACION'
                      ? 'En Negociación'
                      : 'No disponible'
              }}
            </button>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Agente: {{ prop.agentName }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center space-x-2 mt-6 pb-10"
      >
        <button
          @click="goToPage(filters.page - 1)"
          :disabled="filters.page === 0"
          class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
        >
          Anterior
        </button>

        <template v-for="page in totalPages" :key="page">
          <button
            @click="goToPage(page - 1)"
            :class="[
              'px-4 py-2 rounded-lg border transition-colors',
              filters.page === page - 1
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </template>

        <button
          @click="goToPage(filters.page + 1)"
          :disabled="filters.page >= totalPages - 1"
          class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
        >
          Siguiente
        </button>
      </div>
    </div>

    <client-property-details-modal
      v-if="selectedProperty && !showRequestModal"
      :show="!!selectedProperty"
      :property="selectedProperty as unknown as PropertyType"
      @close="selectedProperty = null"
      @schedule-visit="handleScheduleVisit"
    />

    <Transition name="fade">
      <div
        v-if="showRequestModal && requestTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60"
        @click.self="closeRequestModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh] transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                Solicitar visita
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ requestTarget.name }}
              </p>
            </div>
            <button
              @click="closeRequestModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <IconLucideX class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="submitVisitRequest" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              El * indica que el campo es obligatorio.
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >Tu nombre <strong class="text-red-500">*</strong></label
                >
                <input
                  v-model="requestForm.clientName"
                  placeholder="Nombre completo"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  :class="{
                    'border-red-400 dark:border-red-500': reqErrors.clientName,
                  }"
                  required
                />
                <p
                  v-if="reqErrors.clientName"
                  class="text-xs text-red-500 mt-0.5"
                >
                  {{ reqErrors.clientName }}
                </p>
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                  >Email <strong class="text-red-500">*</strong></label
                >
                <input
                  v-model="requestForm.clientEmail"
                  type="email"
                  placeholder="tu@email.com"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  :class="{
                    'border-red-400 dark:border-red-500': reqErrors.clientEmail,
                  }"
                  required
                />
                <p
                  v-if="reqErrors.clientEmail"
                  class="text-xs text-red-500 mt-0.5"
                >
                  {{ reqErrors.clientEmail }}
                </p>
              </div>
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                >Teléfono (opcional)</label
              >
              <input
                v-model="requestForm.clientPhone"
                placeholder="+591 7XXXXXXX"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                >Horario preferido
                <strong class="text-red-500">*</strong></label
              >
              <input
                v-model="requestForm.preferredDateTime"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :class="{
                  'border-red-400 dark:border-red-500':
                    reqErrors.preferredDateTime,
                }"
                :min="minDatetime"
                required
              />
              <p
                v-if="reqErrors.preferredDateTime"
                class="text-xs text-red-500 mt-0.5"
              >
                {{ reqErrors.preferredDateTime }}
              </p>
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                >Horario alternativo (opcional)</label
              >
              <input
                v-model="requestForm.alternativeDateTime"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :min="requestForm.preferredDateTime || minDatetime"
              />
            </div>

            <div>
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                >Mensaje para el agente</label
              >
              <textarea
                v-model="requestForm.message"
                rows="3"
                placeholder="Preguntas, observaciones o requisitos especiales..."
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              />
            </div>

            <p
              class="text-xs text-gray-500 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2"
            >
              📨 Al enviar esta solicitud,
              <strong class="dark:text-amber-200">{{
                requestTarget.agentName
              }}</strong>
              recibirá una notificación y se pondrá en contacto contigo.
            </p>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="closeRequestModal"
                class="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="requestSubmitting"
                class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {{ requestSubmitting ? 'Enviando...' : 'Enviar solicitud' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import IconLucideArrowLeft from '~icons/lucide/arrow-left';
import IconLucideCircleCheck from '~icons/lucide/circle-check';
import IconLucideHome from '~icons/lucide/home';
import IconLucideHeart from '~icons/lucide/heart';
import IconLucideX from '~icons/lucide/x';
import Swal from 'sweetalert2';
import { ref, computed, onMounted } from 'vue';
import {
  getAvailableProperties,
  createVisitRequest,
} from '@/services/visitRequestService';
import type { Property, ClientVisitRequestDTO } from '@/types/visitCalendar';
import type { Property as PropertyType } from '@/types/property';
import ClientPropertyDetailsModal from '@/components/properties/ClientPropertyDetailsModal.vue';

import { useAuth } from '@/composables/useAuth';
const { user } = useAuth();
const myClientId = computed(() => (user.value?.sub || '') as string);
const myClientEmail = computed(() => (user.value?.email || '') as string);
const myClientName = computed(() => {
  if (user.value?.name) return user.value.name;
  if (user.value?.email)
    return ((user.value?.email as string) || '').split('@')[0];
  return '';
});

import { useRouter } from 'vue-router';
import { favoriteService } from '@/services/favoriteService';
const router = useRouter();

const totalElements = ref(0);
const totalPages = ref(0);
const PAGE_SIZE_OPTIONS = [9, 18, 27, 45];

const properties = ref<Property[]>([]);
const loading = ref(false);
const error = ref('');

const filters = ref({
  title: '',
  type: '',
  operationType: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  sortBy: 'price',
  sortOrder: 'ASC',
  page: 0,
  pageSize: 9,
});

const selectedProperty = ref<Property | null>(null);
const showRequestModal = ref(false);
const requestTarget = ref<Property | null>(null);
const requestSuccess = ref(false);
const requestSubmitting = ref(false);

const requestForm = ref({
  clientName: myClientName.value as string,
  clientEmail: myClientEmail.value as string,
  clientPhone: '',
  preferredDateTime: '',
  alternativeDateTime: '',
  message: '',
});
const reqErrors = ref<Record<string, string>>({});

const minDatetime = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
});

const agentNames = ref<Record<string, string>>({});

function loadAgentNames(propList: Property[]) {
  propList.forEach((p: Property) => {
    if (p.assignedAgentId && p.agentName) {
      agentNames.value[p.assignedAgentId] = p.agentName;
    }
  });
}

const favorites = ref<Set<string>>(new Set());

const toggleFavorite = async (propertyId: string) => {
  try {
    if (favorites.value.has(propertyId)) {
      favorites.value.delete(propertyId);
      await favoriteService.removeFavorite(propertyId);
    } else {
      favorites.value.add(propertyId);
      await favoriteService.addFavorite(propertyId);
    }
  } catch (error: unknown) {
    if (favorites.value.has(propertyId)) {
      favorites.value.delete(propertyId);
    } else {
      favorites.value.add(propertyId);
    }
    const err = error as {
      response?: { data?: { message?: string; detail?: string } };
    };
    const msg =
      err.response?.data?.message ||
      err.response?.data?.detail ||
      'Error al actualizar favorito';
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      confirmButtonColor: '#dc2626',
    });
  }
};

const loadFavorites = async () => {
  try {
    const ids = await favoriteService.getFavorites();
    favorites.value = new Set(ids);
  } catch (e) {
    console.error('Error loading favorites:', e);
    favorites.value = new Set();
  }
};

const isFavorite = (id: string) => favorites.value.has(id);

async function loadProperties() {
  loading.value = true;
  error.value = '';
  try {
    const result = await getAvailableProperties({
      title: filters.value.title || undefined,
      type: filters.value.type || undefined,
      operationType: filters.value.operationType || undefined,
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      page: filters.value.page,
      pageSize: filters.value.pageSize,
    });

    properties.value = result.data;
    totalElements.value = result.totalElements;
    totalPages.value = result.totalPages;

    loadAgentNames(properties.value);

    router.replace({
      query: {
        status: 'DISPONIBLE',
        ...(filters.value.title && { title: filters.value.title }),
        ...(filters.value.type && { type: filters.value.type }),
        ...(filters.value.operationType && {
          operationType: filters.value.operationType,
        }),
        ...(filters.value.minPrice !== undefined && {
          minPrice: String(filters.value.minPrice),
        }),
        ...(filters.value.maxPrice !== undefined && {
          maxPrice: String(filters.value.maxPrice),
        }),
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        page: String(filters.value.page),
        pageSize: String(filters.value.pageSize),
      },
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    error.value = err.message || 'No se pudieron cargar las propiedades';
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  filters.value.page = 0;
  loadProperties();
}

function clearFilters() {
  filters.value = {
    title: '',
    type: '',
    operationType: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'price',
    sortOrder: 'ASC',
    page: 0,
    pageSize: 9,
  };
  loadProperties();
}

function goToPage(p: number) {
  filters.value.page = p;
  loadProperties();
}

function openPropertyModal(prop: Property) {
  selectedProperty.value = prop;
  showRequestModal.value = false;
}

function handleScheduleVisit(_propertyId: string | undefined) {
  if (selectedProperty.value) {
    openRequestModal(selectedProperty.value);
  }
}

function openRequestModal(prop: Property) {
  const agentId = prop.assignedAgentId || prop.agentId || '';
  requestTarget.value = {
    ...prop,
    id: prop.id,
    name: prop.title || prop.name || '',
    agentId: agentId,
    agentName:
      (agentId ? agentNames.value[agentId] : undefined) ||
      prop.agentName ||
      'Agente',
  };
  showRequestModal.value = true;
  selectedProperty.value = null;
  requestSuccess.value = false;
  requestForm.value = {
    clientName: myClientName.value as string,
    clientEmail: myClientEmail.value as string,
    clientPhone: '',
    preferredDateTime: '',
    alternativeDateTime: '',
    message: '',
  };
  reqErrors.value = {};
}

function closeRequestModal() {
  showRequestModal.value = false;
  requestTarget.value = null;
}

function validateRequest(): boolean {
  reqErrors.value = {};
  if (!String(requestForm.value.clientName).trim())
    reqErrors.value.clientName = 'Tu nombre es obligatorio';
  if (!String(requestForm.value.clientEmail).trim())
    reqErrors.value.clientEmail = 'El email es obligatorio';
  if (!requestForm.value.preferredDateTime)
    reqErrors.value.preferredDateTime = 'El horario preferido es obligatorio';
  return Object.keys(reqErrors.value).length === 0;
}

async function submitVisitRequest() {
  if (!validateRequest() || !requestTarget.value) return;
  requestSubmitting.value = true;
  try {
    const dto: ClientVisitRequestDTO = {
      propertyId: requestTarget.value.id || '',
      propertyName: requestTarget.value.name || '',
      agentId: requestTarget.value.agentId || '',
      agentName: requestTarget.value.agentName || '',
      clientId: myClientId.value as string,
      clientName: String(requestForm.value.clientName),
      clientEmail: requestForm.value.clientEmail as string,
      clientPhone: requestForm.value.clientPhone || undefined,
      preferredDateTime: new Date(
        requestForm.value.preferredDateTime
      ).toISOString(),
      alternativeDateTime: requestForm.value.alternativeDateTime
        ? new Date(requestForm.value.alternativeDateTime).toISOString()
        : undefined,
      message: requestForm.value.message || undefined,
    };
    await createVisitRequest(dto);
    closeRequestModal();
    await Swal.fire({
      icon: 'success',
      title: '¡Solicitud enviada!',
      text: `El agente ${requestTarget.value?.agentName} ha sido notificado.`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2563eb',
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    alert(
      'Error al enviar la solicitud: ' + (err.message || 'Error desconocido')
    );
  } finally {
    requestSubmitting.value = false;
  }
}

onMounted(() => {
  loadProperties();
  loadFavorites();
});
</script>
