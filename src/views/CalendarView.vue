<template>
  <!--
    CalendarView.vue — HU1
    "Yo como agente inmobiliario, quiero visualizar un calendario compartido
    con el resto del equipo para evitar cruces de horarios."

    PA1: Ver visitas de todo el equipo; las propias están destacadas en azul.
    PA2: Al clic en "Programar visita" se valida el horario antes de confirmar.
    PA3: Filtro por propiedad → solo muestra eventos de ese inmueble.
  -->
  <div class="min-h-screen bg-gray-50">

    <!-- ===== HEADER ===== -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div class="flex items-center gap-3">
            <router-link to="/dashboard"
              class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">Calendario del equipo</h1>
          </div>
          <p class="text-sm text-gray-500 mt-0.5">
            Visitas programadas — semana del {{ weekLabel }}
          </p>
        </div>

        <!-- Botón programar visita -->
        <router-link
          to="/schedule-visit"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Programar visita
        </router-link>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      <!-- ===== FILTROS ===== -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row gap-3">

          <!-- Navegación de semana -->
          <div class="flex items-center gap-2">
            <button
              @click="prevWeek"
              class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Semana anterior"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              @click="goToday"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
            >
              Hoy
            </button>
            <button
              @click="nextWeek"
              class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Próxima semana"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- PA3: Filtro por propiedad -->
          <input
            v-model="filterPropertyId"
            @input="loadCalendar"
            placeholder="Filtrar por ID de propiedad..."
            class="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <!-- Filtro por agente -->
          <input
            v-model="filterAgentId"
            @input="loadCalendar"
            placeholder="Filtrar por ID de agente..."
            class="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <!-- Limpiar filtros -->
          <button
            v-if="filterPropertyId || filterAgentId"
            @click="clearFilters"
            class="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        </div>

        <!-- PA1: Leyenda de colores -->
        <div class="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
          <span class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="h-3 w-3 rounded-full bg-blue-500 inline-block"></span>
            Mis visitas
          </span>
          <span class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="h-3 w-3 rounded-full bg-gray-400 inline-block"></span>
            Visitas del equipo
          </span>
          <span class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
            Confirmada
          </span>
          <span class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="h-3 w-3 rounded-full bg-yellow-400 inline-block"></span>
            Programada
          </span>
        </div>
      </div>

      <!-- ===== RESUMEN ===== -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" v-if="calendarData">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ calendarData.totalEvents }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Visitas esta semana</p>
        </div>
        <div class="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p class="text-2xl font-bold text-blue-700">{{ calendarData.myEvents }}</p>
          <p class="text-xs text-blue-600 mt-0.5">Mis visitas</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ teamEvents }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Visitas del equipo</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ uniqueProperties }}</p>
          <p class="text-xs text-gray-500 mt-0.5">Inmuebles</p>
        </div>
      </div>

      <!-- ===== ESTADO: cargando / error / vacío ===== -->
      <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-500 mt-3 text-sm">Cargando calendario...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        {{ error }}
        <button @click="loadCalendar" class="ml-2 underline">Reintentar</button>
      </div>

      <!-- ===== VISTA SEMANAL ===== -->
      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">

        <!-- Cabecera días de la semana -->
        <div class="grid grid-cols-7 border-b border-gray-200">
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="py-3 px-2 text-center border-r border-gray-100 last:border-r-0"
            :class="{ 'bg-blue-50': isToday(day) }"
          >
            <p class="text-xs font-semibold text-gray-500 uppercase">{{ dayName(day) }}</p>
            <p
              class="text-lg font-bold mt-0.5"
              :class="isToday(day) ? 'text-blue-600' : 'text-gray-800'"
            >
              {{ day.getDate() }}
            </p>
          </div>
        </div>

        <!-- Celdas de eventos por día -->
        <div class="grid grid-cols-7 min-h-[400px]">
          <div
            v-for="(day, idx) in weekDays"
            :key="idx"
            class="border-r border-gray-100 last:border-r-0 p-2 space-y-1.5"
            :class="{ 'bg-blue-50/30': isToday(day) }"
          >
            <!-- Sin eventos -->
            <p v-if="eventsForDay(day).length === 0" class="text-xs text-gray-300 text-center mt-8">
              Sin visitas
            </p>

            <!-- Tarjeta de evento -->
            <div
              v-for="ev in eventsForDay(day)"
              :key="ev.id"
              @click="selectEvent(ev)"
              class="rounded-md px-2 py-1.5 cursor-pointer text-xs leading-tight transition-all hover:shadow-md"
              :class="eventCardClass(ev)"
            >
              <!-- PA1: Borde izquierdo más grueso para eventos propios -->
              <div class="flex items-start gap-1">
                <span class="font-semibold truncate">{{ ev.propertyName }}</span>
              </div>
              <div class="text-[10px] opacity-80 mt-0.5">
                {{ shortTime(ev.startTime) }} – {{ shortTime(ev.endTime) }}
              </div>
              <div class="text-[10px] opacity-70 truncate">{{ ev.agentName }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MODAL DETALLE EVENTO ===== -->
      <Transition name="fade">
        <div
          v-if="selectedEvent"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          @click.self="selectedEvent = null"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-lg font-bold text-gray-900">{{ selectedEvent.propertyName }}</h2>
                <p class="text-sm text-gray-500">{{ selectedEvent.propertyAddress }}</p>
              </div>
              <button @click="selectedEvent = null" class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <dl class="space-y-3 text-sm">
              <div class="flex gap-2">
                <dt class="font-medium text-gray-600 w-20">Agente:</dt>
                <dd class="text-gray-900">{{ selectedEvent.agentName }}</dd>
              </div>
              <div class="flex gap-2">
                <dt class="font-medium text-gray-600 w-20">Inicio:</dt>
                <dd class="text-gray-900">{{ formatFull(selectedEvent.startTime) }}</dd>
              </div>
              <div class="flex gap-2">
                <dt class="font-medium text-gray-600 w-20">Fin:</dt>
                <dd class="text-gray-900">{{ formatFull(selectedEvent.endTime) }}</dd>
              </div>
              <div class="flex gap-2" v-if="selectedEvent.clientName">
                <dt class="font-medium text-gray-600 w-20">Cliente:</dt>
                <dd class="text-gray-900">{{ selectedEvent.clientName }}</dd>
              </div>
              <div class="flex gap-2">
                <dt class="font-medium text-gray-600 w-20">Estado:</dt>
                <dd>
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="statusBadge(selectedEvent.status)"
                  >
                    {{ statusLabel(selectedEvent.status) }}
                  </span>
                </dd>
              </div>
              <div class="flex gap-2" v-if="selectedEvent.notes">
                <dt class="font-medium text-gray-600 w-20">Notas:</dt>
                <dd class="text-gray-900">{{ selectedEvent.notes }}</dd>
              </div>
            </dl>

            <!-- Cancelar (solo visita propia y no cancelada) -->
            <div
              v-if="selectedEvent.ownEvent && selectedEvent.status !== 'CANCELLED'"
              class="mt-5 flex justify-end"
            >
              <button
                @click="cancelEvent(selectedEvent!)"
                :disabled="cancelling"
                class="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {{ cancelling ? 'Cancelando...' : 'Cancelar visita' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getCalendar,
  getWeekRange,
  cancelVisit,
} from '../services/calendarService'
import type { CalendarResponse, CalendarEventResponse } from '../types/visitCalendar'

// ── Auth (adaptar al store de autenticación del proyecto) ──
const myAgentId = localStorage.getItem('agentId') || ''

// ── Estado ──
const loading = ref(false)
const error = ref('')
const calendarData = ref<CalendarResponse | null>(null)
const selectedEvent = ref<CalendarEventResponse | null>(null)
const cancelling = ref(false)
const currentWeekStart = ref(getMonday(new Date()))
const filterPropertyId = ref('')
const filterAgentId = ref('')

// ── Semana ──
function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

const weekDays = computed<Date[]>(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart.value)
    d.setDate(currentWeekStart.value.getDate() + i)
    return d
  })
})

const weekLabel = computed(() => {
  const from = weekDays.value[0]
  const to = weekDays.value[6]
  return `${from.getDate()} ${from.toLocaleString('es-BO', { month: 'short' })} — ${to.getDate()} ${to.toLocaleString('es-BO', { month: 'short', year: 'numeric' })}`
})

function prevWeek() { currentWeekStart.value = new Date(currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)); loadCalendar() }
function nextWeek() { currentWeekStart.value = new Date(currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)); loadCalendar() }
function goToday() { currentWeekStart.value = getMonday(new Date()); loadCalendar() }

// ── Carga de datos ──
async function loadCalendar() {
  loading.value = true
  error.value = ''
  try {
    const from = weekDays.value[0].toISOString()
    const to = new Date(weekDays.value[6].setHours(23, 59, 59, 999)).toISOString()
    calendarData.value = await getCalendar(
      from, to,
      myAgentId,
      filterAgentId.value || undefined,
      filterPropertyId.value || undefined,
    )
  } catch (e: any) {
    error.value = e.message || 'No se pudo cargar el calendario'
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filterPropertyId.value = ''
  filterAgentId.value = ''
  loadCalendar()
}

// ── Helpers visuales ──
function eventsForDay(day: Date): CalendarEventResponse[] {
  if (!calendarData.value) return []
  return calendarData.value.events.filter(ev => {
    const d = new Date(ev.startTime)
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate()
    )
  })
}

function isToday(d: Date): boolean {
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

function dayName(d: Date): string {
  return d.toLocaleString('es-BO', { weekday: 'short' })
}

function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// PA1: Color diferenciado para mis eventos vs los del equipo
function eventCardClass(ev: CalendarEventResponse): string {
  if (ev.status === 'CANCELLED') return 'bg-gray-100 text-gray-400 line-through border-l-4 border-gray-300'
  if (ev.ownEvent) return 'bg-blue-100 text-blue-900 border-l-4 border-blue-500 hover:bg-blue-200'
  if (ev.status === 'CONFIRMED') return 'bg-green-50 text-green-900 border-l-4 border-green-400 hover:bg-green-100'
  return 'bg-gray-50 text-gray-700 border-l-4 border-gray-300 hover:bg-gray-100'
}

function statusBadge(s: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
  }
  return map[s] ?? 'bg-gray-100 text-gray-700'
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'Programada', CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada', COMPLETED: 'Completada',
  }
  return map[s] ?? s
}

// ── Computed ──
const teamEvents = computed(() => (calendarData.value?.totalEvents ?? 0) - (calendarData.value?.myEvents ?? 0))
const uniqueProperties = computed(() => {
  if (!calendarData.value) return 0
  return new Set(calendarData.value.events.map(e => e.propertyId)).size
})

// ── Acciones ──
function selectEvent(ev: CalendarEventResponse) { selectedEvent.value = ev }

async function cancelEvent(ev: CalendarEventResponse) {
  if (!confirm('¿Confirmas que deseas cancelar esta visita?')) return
  cancelling.value = true
  try {
    const updated = await cancelVisit(ev.id, myAgentId)
    // Actualizar lista local
    if (calendarData.value) {
      const idx = calendarData.value.events.findIndex(e => e.id === ev.id)
      if (idx !== -1) calendarData.value.events[idx] = updated
    }
    selectedEvent.value = null
  } catch (e: any) {
    alert('Error: ' + e.message)
  } finally {
    cancelling.value = false
  }
}

onMounted(loadCalendar)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
