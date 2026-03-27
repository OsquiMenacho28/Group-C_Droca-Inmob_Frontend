<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

    <!-- ===== HEADER ===== -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div class="flex items-center gap-3">
            <router-link to="/dashboard" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendario del equipo</h1>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Visitas programadas — semana del {{ weekLabel }}
          </p>
        </div>

        <router-link to="/schedule-visit" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Programar visita
        </router-link>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      <!-- ===== SECCIÓN DE FILTROS (DROPDOWNS BUSCABLES) ===== -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-colors shadow-sm">
        <div class="flex flex-col lg:flex-row gap-4">
          
          <!-- Navegación de semana -->
          <div class="flex items-center gap-2 shrink-0">
            <button @click="prevWeek" class="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button @click="goToday" class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 font-medium dark:text-white">Hoy</button>
            <button @click="nextWeek" class="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- DROPDOWN INMUEBLE -->
          <div class="flex-1 relative" id="prop-filter-container">
            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Filtrar por Inmueble</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                v-model="searchTermProperty"
                @focus="showPropertyDropdown = true"
                placeholder="Buscar inmueble..."
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-10 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                autocomplete="off"
              />
              <button type="button" @click="showPropertyDropdown = !showPropertyDropdown" class="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg class="h-4 w-4 text-gray-400 transition-transform" :class="{'rotate-180': showPropertyDropdown}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <!-- Lista desplegable -->
            <div v-if="showPropertyDropdown" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
              <ul class="py-1">
                <li v-if="filteredProperties.length === 0" class="px-4 py-3 text-xs text-gray-500 italic">No se encontraron inmuebles</li>
                <li v-for="p in filteredProperties" :key="p.id" @click="selectProperty(p)"
                    class="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b last:border-b-0 border-gray-50 dark:border-gray-700 transition-colors">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ p.title }}</p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">{{ p.address }}</p>
                </li>
              </ul>
            </div>
          </div>

          <!-- DROPDOWN AGENTE -->
          <div class="flex-1 relative" id="agent-filter-container">
            <label class="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Filtrar por Agente</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input
                v-model="searchTermAgent"
                @focus="showAgentDropdown = true"
                placeholder="Buscar agente..."
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-10 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                autocomplete="off"
              />
              <button type="button" @click="showAgentDropdown = !showAgentDropdown" class="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg class="h-4 w-4 text-gray-400 transition-transform" :class="{'rotate-180': showAgentDropdown}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <!-- Lista desplegable -->
            <div v-if="showAgentDropdown" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
              <ul class="py-1">
                <li v-if="filteredAgents.length === 0" class="px-4 py-3 text-xs text-gray-500 italic">No se encontraron agentes</li>
                <li v-for="a in filteredAgents" :key="a.id" @click="selectAgent(a)"
                    class="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b last:border-b-0 border-gray-50 dark:border-gray-700 transition-colors">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ a.fullName }}</p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">{{ a.email }}</p>
                </li>
              </ul>
            </div>
          </div>

          <!-- Botón Limpiar -->
          <div class="flex items-end pb-0.5">
            <button
              v-if="filterPropertyId || filterAgentId"
              @click="clearFilters"
              class="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wider"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- ===== RESUMEN ===== -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" v-if="calendarData">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ calendarData?.totalEvents ?? 0 }}</p>
          <p class="text-[10px] text-gray-500 uppercase font-black">Total Citas</p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4 text-center">
          <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">{{ calendarData?.myEvents ?? 0 }}</p>
          <p class="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-black">Mis Visitas</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ teamEvents }}</p>
          <p class="text-[10px] text-gray-500 uppercase font-black">Equipo</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ uniqueProperties }}</p>
          <p class="text-[10px] text-gray-500 uppercase font-black">Inmuebles</p>
        </div>
      </div>

      <!-- ===== VISTA SEMANAL ===== -->
      <div v-if="!loading" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
        <!-- Cabecera Días -->
        <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          <div v-for="(day, idx) in weekDays" :key="idx" 
            class="py-3 px-2 text-center border-r border-gray-100 dark:border-gray-700 last:border-r-0"
            :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': isToday(day) }">
            <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{{ dayName(day) }}</p>
            <p class="text-lg font-bold mt-0.5" :class="isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'">
              {{ day.getDate() }}
            </p>
          </div>
        </div>

        <!-- Cuerpo Calendario -->
        <div class="grid grid-cols-7 min-h-[450px]">
          <div v-for="(day, idx) in weekDays" :key="idx" 
            class="border-r border-gray-100 dark:border-gray-700 last:border-r-0 p-2 space-y-2"
            :class="{ 'bg-blue-50/20 dark:bg-blue-900/5': isToday(day) }">
            
            <div v-for="ev in eventsForDay(day)" :key="ev.id" @click="selectEvent(ev)"
              class="rounded-lg p-2 cursor-pointer text-[11px] leading-tight transition-all hover:scale-[1.02] shadow-sm border-l-4"
              :class="eventCardClass(ev)">
              <div class="font-bold truncate">{{ ev.propertyName }}</div>
              <div class="opacity-80 mt-1">{{ shortTime(ev.startTime) }}</div>
            </div>
            <p v-if="eventsForDay(day).length === 0" class="text-[10px] text-gray-300 dark:text-gray-600 text-center mt-10 italic">Libre</p>
          </div>
        </div>
      </div>

    </div>

    <!-- ===== MODAL DETALLE ===== -->
    <Transition name="fade">
      <div v-if="selectedEvent" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="selectedEvent = null">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex justify-between items-start mb-5">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedEvent?.propertyName }}</h2>
              <p class="text-sm text-gray-500">{{ selectedEvent?.propertyAddress }}</p>
            </div>
            <button @click="selectedEvent = null" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-gray-500">Agente:</span><span class="font-bold dark:text-white">{{ selectedEvent?.agentName }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Horario:</span><span class="font-bold dark:text-white">{{ shortTime(selectedEvent?.startTime ?? '') }} - {{ shortTime(selectedEvent?.endTime ?? '') }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Estado:</span><span class="px-2 rounded-full text-[10px] font-black uppercase" :class="statusBadge(selectedEvent?.status ?? '')">{{ statusLabel(selectedEvent?.status ?? '') }}</span></div>
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="selectedEvent = null" class="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cerrar</button>
            <button v-if="selectedEvent?.ownEvent && selectedEvent?.status !== 'CANCELLED'" @click="handleCancel(selectedEvent!)" :disabled="cancelling" class="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
              {{ cancelling ? 'Procesando...' : 'Cancelar Visita' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getCalendar, cancelVisit } from '../services/calendarService'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import { useAuth } from '../composables/useAuth'
import type { CalendarResponse, CalendarEventResponse } from '../types/visitCalendar'

// --- AUTH & CONFIG ---
const { user } = useAuth()
const myAgentId = computed(() => user.value?.sub || user.value?.userId || '')

// --- ESTADOS PRINCIPALES ---
const loading = ref(false)
const error = ref('')
const calendarData = ref<CalendarResponse | null>(null)
const selectedEvent = ref<CalendarEventResponse | null>(null)
const cancelling = ref(false)
const currentWeekStart = ref(getMonday(new Date()))

// --- ESTADOS FILTROS (DROPDOWNS) ---
const allProperties = ref<any[]>([])
const allAgents = ref<any[]>([])
const searchTermProperty = ref('')
const showPropertyDropdown = ref(false)
const filterPropertyId = ref('')
const searchTermAgent = ref('')
const showAgentDropdown = ref(false)
const filterAgentId = ref('')

// --- LÓGICA DE SEMANA ---
function getMonday(d: Date): Date {
  const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d); m.setDate(d.getDate() + diff); m.setHours(0, 0, 0, 0)
  return m
}
const weekDays = computed(() => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(currentWeekStart.value); d.setDate(currentWeekStart.value.getDate() + i); return d
}))
const weekLabel = computed(() => {
  const from = weekDays.value[0]; const to = weekDays.value[6]
  return `${from.getDate()} ${from.toLocaleString('es-BO', { month: 'short' })} — ${to.getDate()} ${to.toLocaleString('es-BO', { month: 'short', year: 'numeric' })}`
})

// --- CARGA DE DATOS ---
const loadFilterData = async () => {
  try {
    const [p, u] = await Promise.all([propertyService.getProperties(), userService.getUsers()])
    allProperties.value = p
    allAgents.value = u.filter((x: any) => x.userType === 'EMPLOYEE' || x.userType === 'ADMIN')
  } catch (e) { console.error("Error al cargar datos de filtros", e) }
}

async function loadCalendar() {
  loading.value = true; error.value = ''
  try {
    const from = weekDays.value[0].toISOString()
    const to = new Date(weekDays.value[6]).toISOString().split('T')[0] + 'T23:59:59.999Z'
    calendarData.value = await getCalendar(from, to, myAgentId.value, filterAgentId.value || undefined, filterPropertyId.value || undefined)
  } catch (e) { error.value = 'No se pudo cargar el calendario' }
  finally { loading.value = false }
}

// --- FILTRADO LOCAL ---
const filteredProperties = computed(() => {
  const s = searchTermProperty.value.toLowerCase()
  if (!s) return allProperties.value.slice(0, 10)
  return allProperties.value.filter(p => p.title.toLowerCase().includes(s) || p.address.toLowerCase().includes(s)).slice(0, 10)
})

const filteredAgents = computed(() => {
  const s = searchTermAgent.value.toLowerCase()
  if (!s) return allAgents.value.slice(0, 10)
  return allAgents.value.filter(a => a.fullName.toLowerCase().includes(s)).slice(0, 10)
})

// --- ACCIONES DE FILTRO ---
const selectProperty = (p: any) => {
  filterPropertyId.value = p.id; searchTermProperty.value = p.title; showPropertyDropdown.value = false; loadCalendar()
}
const selectAgent = (a: any) => {
  filterAgentId.value = a.id; searchTermAgent.value = a.fullName; showAgentDropdown.value = false; loadCalendar()
}
function clearFilters() {
  filterPropertyId.value = ''; searchTermProperty.value = ''; filterAgentId.value = ''; searchTermAgent.value = ''; loadCalendar()
}

// --- HELPERS VISUALES ---
const eventsForDay = (day: Date) => calendarData.value?.events.filter(ev => new Date(ev.startTime).toDateString() === day.toDateString()) || []
const isToday = (d: Date) => d.toDateString() === new Date().toDateString()
const dayName = (d: Date) => d.toLocaleString('es-BO', { weekday: 'short' })
const shortTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : ''
const teamEvents = computed(() => (calendarData.value?.totalEvents ?? 0) - (calendarData.value?.myEvents ?? 0))
const uniqueProperties = computed(() => new Set(calendarData.value?.events.map(e => e.propertyId)).size)

function eventCardClass(ev: CalendarEventResponse) {
  if (ev.status === 'CANCELLED') return 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 line-through'
  return ev.ownEvent ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 border-blue-500' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200'
}

function statusBadge(s: string) {
  const map: any = { SCHEDULED: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' }
  return map[s] || 'bg-gray-100'
}
const statusLabel = (s: string) => ({ SCHEDULED: 'Programada', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' }[s] || s)

// --- ACCIONES NAVEGACIÓN ---
function prevWeek() { currentWeekStart.value = new Date(currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)); loadCalendar() }
function nextWeek() { currentWeekStart.value = new Date(currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)); loadCalendar() }
function goToday() { currentWeekStart.value = getMonday(new Date()); loadCalendar() }

// --- ACCIONES EVENTO ---
const selectEvent = (ev: CalendarEventResponse) => { selectedEvent.value = ev }
async function handleCancel(ev: CalendarEventResponse) {
  if (!confirm('¿Confirmas la cancelación?')) return
  cancelling.value = true
  try {
    const updated = await cancelVisit(ev.id, myAgentId.value)
    if (calendarData.value) {
      const idx = calendarData.value.events.findIndex(e => e.id === ev.id); if (idx !== -1) calendarData.value.events[idx] = updated
    }
    selectedEvent.value = null
  } catch (e: any) { alert(e.message) }
  finally { cancelling.value = false }
}

// --- EVENTOS DE CIERRE ---
const closeClickOutside = (e: any) => {
  if (!e.target.closest('#prop-filter-container')) showPropertyDropdown.value = false
  if (!e.target.closest('#agent-filter-container')) showAgentDropdown.value = false
}

onMounted(() => { loadFilterData(); loadCalendar(); window.addEventListener('click', closeClickOutside) })
onUnmounted(() => window.removeEventListener('click', closeClickOutside))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background: #475569; }
</style>