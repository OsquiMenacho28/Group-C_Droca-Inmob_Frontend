<template>
  <!--
    ScheduleVisitView.vue — HU2
    "Yo como agente inmobiliario, quiero programar una visita a un inmueble
    en un horario específico para organizar mi agenda diaria."

    PA1: La visita aparece en el calendario compartido al confirmar.
    PA2: Si hay conflicto de horario, se impide y se sugiere otro horario.
    PA3: Al crear la visita, se puede ver en la agenda del día.
  -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

    <!-- HEADER -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div class="max-w-2xl mx-auto flex items-center gap-4">
        <router-link to="/calendar" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Programar visita</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Agenda una cita para un inmueble</p>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <!-- FORMULARIO -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <form @submit.prevent="handleSubmit" novalidate class="space-y-5">

          <!-- Inmueble -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID del Inmueble <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.propertyId"
              @blur="fetchPropertyInfo"
              placeholder="Ej: 683a1f..."
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              :class="{ 'border-red-400 dark:border-red-500': errors.propertyId }"
              required
            />
            <p v-if="errors.propertyId" class="text-xs text-red-500 mt-1">{{ errors.propertyId }}</p>

            <!-- Info del inmueble cargado -->
            <div v-if="propertyInfo" class="mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-2 text-sm transition-colors">
              <p class="font-medium text-blue-800 dark:text-blue-200">{{ propertyInfo.name }}</p>
              <p class="text-blue-600 dark:text-blue-300 text-xs">{{ propertyInfo.address }} · Agente: {{ propertyInfo.agentName }}</p>
              <p class="text-xs mt-0.5">
                <span
                  class="font-medium"
                  :class="propertyInfo.status === 'Disponible' ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ propertyInfo.status }}
                </span>
              </p>
            </div>
            <p v-if="propertyError" class="text-xs text-red-500 mt-1">{{ propertyError }}</p>
          </div>

          <!-- Nombre del inmueble (auto-completado o manual) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del inmueble <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.propertyName"
              placeholder="Ej: Casa Zona Sur #12"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              :class="{ 'border-red-400 dark:border-red-500': errors.propertyName }"
              required
            />
            <p v-if="errors.propertyName" class="text-xs text-red-500 mt-1">{{ errors.propertyName }}</p>
          </div>

          <!-- Dirección (opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
            <input
              v-model="form.propertyAddress"
              placeholder="Calle, zona, ciudad..."
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <!-- Fecha y hora -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha y hora de inicio <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.startTimeLocal"
                @change="onTimeChange"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :class="{ 'border-red-400 dark:border-red-500': errors.startTime }"
                :min="minDatetime"
                required
              />
              <p v-if="errors.startTime" class="text-xs text-red-500 mt-1">{{ errors.startTime }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha y hora de fin <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.endTimeLocal"
                @change="onTimeChange"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:[color-scheme:dark]"
                :class="{ 'border-red-400 dark:border-red-500': errors.endTime }"
                :min="form.startTimeLocal || minDatetime"
                required
              />
              <p v-if="errors.endTime" class="text-xs text-red-500 mt-1">{{ errors.endTime }}</p>
            </div>
          </div>

          <!-- Notas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas adicionales</label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Observaciones, instrucciones de acceso, etc."
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </div>

          <!-- PA2: Alerta de conflicto de horario -->
          <ConflictAlert
            v-if="conflictResult"
            :conflict="conflictResult"
            :show-use-suggestion="true"
            @use-suggestion="applySuggestion"
          />

          <!-- Verificación en curso -->
          <div v-if="checkingConflict" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            Verificando disponibilidad del horario...
          </div>

          <!-- Disponible -->
          <div
            v-if="conflictResult && !conflictResult.hasConflict"
            class="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 transition-colors"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            El horario está disponible. Puedes confirmar la visita.
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-2">
            <router-link
              to="/calendar"
              class="flex-1 text-center py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="submitting || (conflictResult?.hasConflict ?? false)"
              class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Programando...' : 'Confirmar visita' }}
            </button>
          </div>
        </form>
      </div>

      <!-- PA3: Agenda del día (después de crear la visita) -->
      <div v-if="dayAgenda.length > 0" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Tu agenda para el
          {{ form.startTimeLocal ? new Date(form.startTimeLocal).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' }) : 'día seleccionado' }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="ev in dayAgenda"
            :key="ev.id"
            class="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 transition-colors"
            :class="ev.ownEvent ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''"
          >
            <div class="flex-shrink-0 w-1 self-stretch rounded-full" :class="ev.ownEvent ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ ev.propertyName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ shortTime(ev.startTime) }} – {{ shortTime(ev.endTime) }}</p>
            </div>
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="ev.ownEvent ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
            >
              {{ ev.ownEvent ? 'Yo' : ev.agentName }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Éxito -->
      <div
        v-if="successMessage"
        class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center transition-colors"
      >
        <svg class="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">¡Visita programada!</h3>
        <p class="text-sm text-green-700 dark:text-green-300 mt-1">{{ successMessage }}</p>
        <router-link
          to="/calendar"
          class="mt-4 inline-block px-6 py-2 bg-green-600 dark:bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
        >
          Ver en el calendario
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  checkConflict,
  createVisit,
  getDayAgenda,
} from '../services/calendarService'
import ConflictAlert from '../components/visits/ConflictAlert.vue'
import type { ConflictResponse, CalendarEventResponse, Property } from '../types/visitCalendar'

// ── Auth ──
const myAgentId = localStorage.getItem('agentId') || ''
const myAgentName = localStorage.getItem('agentName') || ''

// ── Formulario ──
const form = ref({
  propertyId: '',
  propertyName: '',
  propertyAddress: '',
  startTimeLocal: '',
  endTimeLocal: '',
  notes: '',
})

const errors = ref<Record<string, string>>({})
const propertyInfo = ref<Property | null>(null)
const propertyError = ref('')
const conflictResult = ref<ConflictResponse | null>(null)
const checkingConflict = ref(false)
const submitting = ref(false)
const successMessage = ref('')
const dayAgenda = ref<CalendarEventResponse[]>([])

// datetime-local mínimo: ahora
const minDatetime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  return now.toISOString().slice(0, 16)
})

// ── Cargar info del inmueble ──
async function fetchPropertyInfo() {
  if (!form.value.propertyId.trim()) return
  propertyError.value = ''
  propertyInfo.value = null
  try {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token')
    const res = await fetch(`${base}/api/properties/${form.value.propertyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Inmueble no encontrado')
    const data = await res.json()
    propertyInfo.value = data.data || data
    form.value.propertyName = propertyInfo.value!.name
    form.value.propertyAddress = propertyInfo.value!.address

    if (propertyInfo.value!.status !== 'Disponible') {
      propertyError.value = `El inmueble no está disponible (estado actual: ${propertyInfo.value!.status})`
    }
  } catch {
    propertyError.value = 'No se pudo obtener información del inmueble. Verifique el ID.'
  }
}

// ── Verificar conflicto al cambiar horario (PA2) ──
let conflictTimer: ReturnType<typeof setTimeout> | null = null
async function onTimeChange() {
  conflictResult.value = null
  if (!form.value.propertyId || !form.value.startTimeLocal || !form.value.endTimeLocal) return
  if (form.value.startTimeLocal >= form.value.endTimeLocal) return

  if (conflictTimer) clearTimeout(conflictTimer)
  conflictTimer = setTimeout(async () => {
    checkingConflict.value = true
    try {
      conflictResult.value = await checkConflict(
        form.value.propertyId,
        new Date(form.value.startTimeLocal).toISOString(),
        new Date(form.value.endTimeLocal).toISOString(),
      )
    } catch {
      // silencioso
    } finally {
      checkingConflict.value = false
    }
  }, 600)
}

// Aplicar sugerencia de horario del ConflictAlert
function applySuggestion(start?: string, end?: string) {
  if (start) form.value.startTimeLocal = new Date(start).toISOString().slice(0, 16)
  if (end) form.value.endTimeLocal = new Date(end).toISOString().slice(0, 16)
  onTimeChange()
}

// ── Validar formulario ──
function validate(): boolean {
  errors.value = {}
  if (!form.value.propertyId.trim()) errors.value.propertyId = 'El ID del inmueble es obligatorio'
  if (!form.value.propertyName.trim()) errors.value.propertyName = 'El nombre del inmueble es obligatorio'
  if (!form.value.startTimeLocal) errors.value.startTime = 'La fecha de inicio es obligatoria'
  if (!form.value.endTimeLocal) errors.value.endTime = 'La fecha de fin es obligatoria'
  if (form.value.startTimeLocal && form.value.endTimeLocal && form.value.startTimeLocal >= form.value.endTimeLocal) {
    errors.value.endTime = 'La hora de fin debe ser posterior a la de inicio'
  }
  if (propertyInfo.value && propertyInfo.value.status !== 'Disponible') {
    errors.value.propertyId = 'El inmueble no está disponible para visitas'
  }
  return Object.keys(errors.value).length === 0
}

// ── Enviar formulario ──
async function handleSubmit() {
  if (!validate()) return
  if (conflictResult.value?.hasConflict) return

  submitting.value = true
  try {
    await createVisit(
      {
        propertyId: form.value.propertyId,
        propertyName: form.value.propertyName,
        propertyAddress: form.value.propertyAddress,
        agentId: myAgentId,
        agentName: myAgentName,
        startTime: new Date(form.value.startTimeLocal).toISOString(),
        endTime: new Date(form.value.endTimeLocal).toISOString(),
        notes: form.value.notes,
      },
      myAgentId,
    )

    successMessage.value = `Visita a "${form.value.propertyName}" añadida al calendario compartido.`

    // PA3: Cargar agenda del día
    dayAgenda.value = await getDayAgenda(myAgentId, new Date(form.value.startTimeLocal).toISOString())

    // Limpiar formulario
    form.value = { propertyId: '', propertyName: '', propertyAddress: '', startTimeLocal: '', endTimeLocal: '', notes: '' }
    conflictResult.value = null
    propertyInfo.value = null
  } catch (e: any) {
    if (e.message?.includes('conflicto') || e.message?.includes('horario')) {
      // Re-chequear para mostrar el conflicto actualizado
      await onTimeChange()
    } else {
      alert('Error al programar la visita: ' + e.message)
    }
  } finally {
    submitting.value = false
  }
}

function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}
</script>