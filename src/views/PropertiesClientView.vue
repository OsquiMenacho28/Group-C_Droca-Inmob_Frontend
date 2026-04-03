<template>
  <!--
    PropertiesClientView.vue — HU3
    "Yo como cliente buscador, quiero ver propiedades disponibles
    para agendar una cita."

    PA1: Solo se muestran propiedades con estado "Disponible".
    PA2: Al solicitar una cita, el agente responsable es notificado.
    PA3: Filtros por zona y rango de precio actualizan los resultados.
  -->
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  >
    <!-- HEADER -->
    <div
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors"
    >
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <router-link
            to="/dashboard"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
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
      <!-- ===== FILTROS ===== -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Título -->
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

          <!-- Tipo -->
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
              <option value="COMERCIAL">Local Comercial</option>
            </select>
          </div>

          <!-- Precio mínimo -->
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

          <!-- Precio máximo -->
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

          <!-- Ordenar por -->
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

          <!-- Orden -->
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
          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Mostrando solo propiedades <strong class="ml-0.5">Disponibles</strong>
        </p>
      </div>

      <!-- RESUMEN -->
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-semibold text-gray-900 dark:text-white">{{
          properties.length
        }}</span>
        propiedad{{ properties.length !== 1 ? "es" : "" }} encontrada{{
          properties.length !== 1 ? "s" : ""
        }}
      </p>

      <!-- ESTADO cargando / error -->
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
        <svg
          class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
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

      <!-- GRID DE PROPIEDADES -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          @click="openPropertyModal(prop)"
        >
          <!-- Imagen / placeholder -->
          <div
            class="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center transition-colors"
          >
            <img
              v-if="prop.imageUrl"
              :src="prop.imageUrl"
              :alt="prop.title"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="h-16 w-16 text-blue-300 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <!-- Badge Disponible -->
            <span
              class="absolute top-3 left-3 bg-green-500 dark:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
            >
              {{ prop.status }}
            </span>
            <!-- Tipo -->
            <span
              class="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ prop.type }}
            </span>
          </div>

          <!-- Info -->
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
                ${{ prop.price.toLocaleString("es-BO") }}
              </span>
              <button
                @click.stop="openRequestModal(prop)"
                class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Agendar visita
              </button>
            </div>

            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Agente: {{ prop.agentName }}
            </p>
          </div>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center gap-2 mt-6"
      >
        <button
          @click="goToPage(filters.page - 1)"
          :disabled="filters.page === 0"
          class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
        >
          ← Anterior
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Página {{ filters.page + 1 }} de {{ totalPages }}
        </span>
        <button
          @click="goToPage(filters.page + 1)"
          :disabled="filters.page >= totalPages - 1"
          class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- ===== MODAL DETALLE PROPIEDAD ===== -->
    <Transition name="fade">
      <div
        v-if="selectedProperty && !showRequestModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60"
        @click.self="selectedProperty = null"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors"
        >
          <div
            class="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center transition-colors"
          >
            <img
              v-if="selectedProperty.imageUrl"
              :src="selectedProperty.imageUrl"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="h-20 w-20 text-blue-300 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ selectedProperty.title }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ selectedProperty.address }}
                </p>
              </div>
              <button
                @click="selectedProperty = null"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div
                class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 transition-colors"
              >
                <p class="text-xs text-gray-500 dark:text-gray-400">Precio</p>
                <p class="font-bold text-blue-700 dark:text-blue-400 text-base">
                  ${{ selectedProperty.price.toLocaleString() }}
                </p>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 transition-colors"
              >
                <p class="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedProperty.type }}
                </p>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                v-if="selectedProperty.bedrooms"
              >
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Habitaciones
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedProperty.bedrooms }}
                </p>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                v-if="selectedProperty.area"
              >
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Área (m²)
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ selectedProperty.area }}
                </p>
              </div>
            </div>
            <p
              v-if="selectedProperty.description"
              class="text-sm text-gray-600 dark:text-gray-300 mt-3"
            >
              {{ selectedProperty.description }}
            </p>
            <div class="mt-5 flex gap-3">
              <button
                @click="selectedProperty = null"
                class="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                @click="openRequestModal(selectedProperty)"
                class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Agendar visita
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ===== MODAL SOLICITUD DE CITA ===== -->
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
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Formulario PA2 -->
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

            <!-- PA2: Info de notificación -->
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
                {{ requestSubmitting ? "Enviando..." : "Enviar solicitud" }}
              </button>
            </div>
          </form>

          <!-- Éxito -->
          <!-- <div
            v-if="requestSuccess"
            class="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center transition-colors"
          >
            <svg
              class="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm font-semibold text-green-800 dark:text-green-200">
              ¡Solicitud enviada!
            </p>
            <p class="text-xs text-green-700 dark:text-green-300 mt-1">
              El agente {{ requestTarget?.agentName }} ha sido notificado.
            </p>
            <button
              @click="closeRequestModal"
              class="mt-3 text-xs text-green-700 dark:text-green-300 underline"
            >
              Cerrar
            </button>
          </div> -->
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";
import { ref, computed, onMounted } from "vue";
import {
  getAvailableProperties,
  createVisitRequest,
} from "../services/visitRequestService";
import type { Property, ClientVisitRequestDTO } from "../types/visitCalendar";

// ── Auth — leer del JWT ──
import { useAuth } from "../composables/useAuth";
const { user } = useAuth();
const myClientId = computed(() => user.value?.sub || "");
const myClientEmail = computed(() => user.value?.email || "");
const myClientName = computed(() => {
  if (user.value?.name) return user.value.name;
  if (user.value?.email) return user.value.email.split("@")[0];
  return "";
});

import { useRouter } from "vue-router";
const router = useRouter();

// ── Pagination ──
const totalElements = ref(0);
const totalPages = ref(0);
const PAGE_SIZE = 9;

// ── Estado principal ──
const properties = ref<Property[]>([]);
const loading = ref(false);
const error = ref("");

// ── Filtros PA3 ──
const filters = ref({
  // zone: "",
  title: "",
  type: "",
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  sortBy: "price",
  sortOrder: "ASC",
  page: 0,
  operationType: ""
});

// ── Modales ──
const selectedProperty = ref<Property | null>(null);
const showRequestModal = ref(false);
const requestTarget = ref<Property | null>(null);
const requestSuccess = ref(false);
const requestSubmitting = ref(false);

// ── Formulario de solicitud ──
const requestForm = ref({
  clientName: myClientName.value,
  clientEmail: myClientEmail.value,
  clientPhone: "",
  preferredDateTime: "",
  alternativeDateTime: "",
  message: "",
});
const reqErrors = ref<Record<string, string>>({});

const minDatetime = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
});

const agentNames = ref<Record<string, string>>({});

function loadAgentNames(propList: any[]) {
  // El nombre del agente viene directamente de la propiedad
  // No se llama a /users porque el cliente no tiene permiso
  propList.forEach((p: any) => {
    if (p.assignedAgentId && p.agentName) {
      agentNames.value[p.assignedAgentId] = p.agentName;
    }
  });
}

// ── Cargar propiedades ──
async function loadProperties() {
  loading.value = true;
  error.value = "";
  try {
    const result = await getAvailableProperties({
      title: filters.value.title || undefined,
      type: filters.value.type || undefined,
      minPrice: filters.value.minPrice,
      maxPrice: filters.value.maxPrice,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      page: filters.value.page,
      pageSize: PAGE_SIZE,
    });

    properties.value = result.data;
    totalElements.value = result.totalElements;
    totalPages.value = result.totalPages;

    loadAgentNames(properties.value);

    // Reflejar en la URL para Postman / compartir
    router.replace({
      query: {
        status: "DISPONIBLE",
        ...(filters.value.title && { title: filters.value.title }),
        ...(filters.value.type && { type: filters.value.type }),
        ...(filters.value.minPrice !== undefined && {
          minPrice: String(filters.value.minPrice),
        }),
        ...(filters.value.maxPrice !== undefined && {
          maxPrice: String(filters.value.maxPrice),
        }),
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
        page: String(filters.value.page),
        pageSize: String(PAGE_SIZE),
      },
    });
  } catch (e: any) {
    error.value = e.message || "No se pudieron cargar las propiedades";
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
    title: "",
    type: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: "price",
    sortOrder: "ASC",
    page: 0,
    operationType: ""
  };
  loadProperties();
}

function goToPage(p: number) {
  filters.value.page = p;
  loadProperties();
}

// ── Modales ──
function openPropertyModal(prop: Property) {
  selectedProperty.value = prop;
  showRequestModal.value = false;
}
function openRequestModal(prop: any) {
  requestTarget.value = {
    ...prop,
    id: prop.id,
    name: prop.title || prop.name || "",
    agentId: prop.assignedAgentId || prop.agentId || "",
    agentName:
      agentNames.value[prop.assignedAgentId] || prop.agentName || "Agente",
  };
  showRequestModal.value = true;
  selectedProperty.value = null;
  requestSuccess.value = false;
  requestForm.value = {
    clientName: myClientName.value,
    clientEmail: myClientEmail.value,
    clientPhone: "",
    preferredDateTime: "",
    alternativeDateTime: "",
    message: "",
  };
  reqErrors.value = {};
}
function closeRequestModal() {
  showRequestModal.value = false;
  requestTarget.value = null;
}

// ── Validar solicitud ──
function validateRequest(): boolean {
  reqErrors.value = {};
  if (!requestForm.value.clientName.trim())
    reqErrors.value.clientName = "Tu nombre es obligatorio";
  if (!requestForm.value.clientEmail.trim())
    reqErrors.value.clientEmail = "El email es obligatorio";
  if (!requestForm.value.preferredDateTime)
    reqErrors.value.preferredDateTime = "El horario preferido es obligatorio";
  return Object.keys(reqErrors.value).length === 0;
}

// ── PA2: Enviar solicitud → notifica al agente ──
async function submitVisitRequest() {
  if (!validateRequest() || !requestTarget.value) return;
  requestSubmitting.value = true;
  try {
    const dto: ClientVisitRequestDTO = {
      propertyId: requestTarget.value.id || "",
      propertyName: requestTarget.value.name || "",
      agentId: requestTarget.value.agentId || "",
      agentName: requestTarget.value.agentName || "",
      clientId: myClientId.value,
      clientName: requestForm.value.clientName,
      clientEmail: requestForm.value.clientEmail,
      clientPhone: requestForm.value.clientPhone || undefined,
      preferredDateTime: new Date(
        requestForm.value.preferredDateTime,
      ).toISOString(),
      alternativeDateTime: requestForm.value.alternativeDateTime
        ? new Date(requestForm.value.alternativeDateTime).toISOString()
        : undefined,
      message: requestForm.value.message || undefined,
    };
    await createVisitRequest(dto);
    closeRequestModal();
    await Swal.fire({
      icon: "success",
      title: "¡Solicitud enviada!",
      text: `El agente ${requestTarget.value?.agentName} ha sido notificado.`,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2563eb",
    });
  } catch (e: any) {
    alert("Error al enviar la solicitud: " + e.message);
  } finally {
    requestSubmitting.value = false;
  }
}

onMounted(loadProperties);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
