<template>
  <div class="app-page p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary dark:text-white">
          {{ t('availability.title', 'Disponibilidad de Agentes') }}
        </h1>
        <p class="text-sm text-secondary">
          {{ t('availability.subtitle', 'Administrar horarios de trabajo y plantillas para el equipo') }}
        </p>
      </div>
      <div class="flex gap-2">
        <fwb-button @click="openTemplateModal" color="alternative" class="inline-flex items-center gap-2">
          <IconLucideSettings class="w-4 h-4" />
          {{ t('availability.manageTemplates', 'Gestionar Plantillas') }}
        </fwb-button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Agent Selection Panel -->
      <div class="lg:col-span-1 space-y-4">
        <div class="app-card p-4 space-y-4">
          <h2 class="font-bold text-lg text-primary dark:text-white flex items-center gap-2">
            <IconLucideUsers class="w-5 h-5 text-blue-500" />
            {{ t('availability.selectAgent', 'Seleccionar Agente') }}
          </h2>
          <div class="space-y-2">
            <select
              v-model="selectedAgentId"
              @change="loadAvailability"
              class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>-- {{ t('availability.chooseAgent', 'Seleccione un agente') }} --</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                {{ agent.fullName }} ({{ agent.email }})
              </option>
            </select>
          </div>

          <div v-if="selectedAgent" class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <p class="text-sm font-semibold text-secondary">
              {{ t('availability.quickActions', 'Acciones Rápidas') }}
            </p>
            <fwb-button @click="applyStandardHours" color="blue" size="sm" class="w-full justify-center">
              {{ t('availability.applyStandardHours', 'Aplicar Horas de Oficina Estándar') }}
            </fwb-button>
            <p class="text-xs text-gray-500 italic">
              {{ t('availability.standardHoursInfo', 'Lunes a Viernes de 08:30–12:30 y 14:30–18:30') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Weekly View Panel -->
      <div class="lg:col-span-3 space-y-4">
        <div v-if="!selectedAgentId" class="app-card p-12 text-center text-secondary">
          <IconLucideInfo class="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p class="text-lg font-semibold">{{ t('availability.noAgentSelected', 'Seleccione un agente para ver y gestionar su disponibilidad.') }}</p>
        </div>

        <div v-else class="space-y-4">
          <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div class="flex items-center gap-2">
              <span class="inline-block w-3.5 h-3.5 bg-green-500 rounded-full"></span>
              <span class="text-sm font-medium">{{ t('availability.legendAvailable', 'Horas Laborables') }}</span>
              <span class="inline-block w-3.5 h-3.5 bg-red-500 rounded-full ml-4"></span>
              <span class="text-sm font-medium">{{ t('availability.legendUnavailable', 'No Disponible / Feriado') }}</span>
            </div>
            <fwb-button @click="openAddModal" color="blue" size="sm" class="inline-flex items-center gap-2">
              <IconLucidePlus class="w-4 h-4" />
              {{ t('availability.addSlot', 'Agregar Horario') }}
            </fwb-button>
          </div>

          <div v-if="loading" class="text-center p-12">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p class="text-sm text-secondary">{{ t('common.loading', 'Cargando...') }}</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div v-for="day in daysOfWeek" :key="day" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-[400px]">
              <h3 class="font-bold text-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 text-primary uppercase text-xs tracking-wider">
                {{ dayNames[day] }}
              </h3>
              
              <!-- Recurring slots for this day -->
              <div class="space-y-2 flex-1">
                <div v-if="getRecurringForDay(day).length === 0" class="text-center py-6 text-xs text-gray-400 italic">
                  {{ t('availability.noHours', 'Sin horas recurrentes') }}
                </div>
                <div
                  v-for="slot in getRecurringForDay(day)"
                  :key="slot.id"
                  @click="openEditModal(slot)"
                  class="p-2.5 rounded-lg border cursor-pointer hover:shadow-md transition-all text-xs border-l-4"
                  :class="slot.isAvailable ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 border-l-green-500' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 border-l-red-500'"
                >
                  <p class="font-bold">{{ slot.startTime }} - {{ slot.endTime }}</p>
                  <p v-if="slot.notes" class="text-[10px] text-gray-500 truncate mt-1">{{ slot.notes }}</p>
                </div>
              </div>

              <!-- Exceptions for this day -->
              <div class="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                <h4 class="text-[10px] font-bold uppercase text-gray-400 tracking-tighter mb-2">
                  {{ t('availability.exceptions', 'Excepciones') }}
                </h4>
                <div class="space-y-1.5">
                  <div
                    v-for="slot in getExceptionsForDay(day)"
                    :key="slot.id"
                    @click="openEditModal(slot)"
                    class="p-2 rounded border cursor-pointer hover:shadow transition-all text-[10px] border-l-4"
                    :class="slot.isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-800 border-l-emerald-500' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/10 dark:border-rose-800 border-l-rose-500'"
                  >
                    <p class="font-semibold">{{ slot.startTime }} - {{ slot.endTime }}</p>
                    <p class="text-[9px] font-bold">{{ slot.specificDate }}</p>
                    <p v-if="slot.notes" class="text-[9px] text-gray-500 truncate mt-0.5">{{ slot.notes }}</p>
                  </div>
                  <div v-if="getExceptionsForDay(day).length === 0" class="text-[9px] text-gray-400 italic text-center py-2">
                    -
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Slot Modal -->
    <fwb-modal v-if="showSlotModal" @close="showSlotModal = false">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ isEditing ? t('availability.editSlotTitle', 'Editar Horario') : t('availability.addSlotTitle', 'Agregar Horario') }}
        </h3>
      </template>
      <template #body>
        <form class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.typeLabel', 'Tipo de Horario') }}
              </label>
              <select v-model="formSlot.type" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white">
                <option value="RECURRING">{{ t('availability.typeRecurring', 'Recurrente Semanal') }}</option>
                <option value="EXCEPTION">{{ t('availability.typeException', 'Excepción de Fecha') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.availabilityLabel', 'Estado') }}
              </label>
              <select v-model="formSlot.isAvailable" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white">
                <option :value="true">{{ t('availability.stateAvailable', 'Laborable') }}</option>
                <option :value="false">{{ t('availability.stateUnavailable', 'No laborable / Bloqueo') }}</option>
              </select>
            </div>
          </div>

          <div v-if="formSlot.type === 'RECURRING'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('availability.dayOfWeekLabel', 'Día de la Semana') }}
            </label>
            <select v-model="formSlot.dayOfWeek" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white">
              <option v-for="day in daysOfWeek" :key="day" :value="day">{{ dayNames[day] }}</option>
            </select>
          </div>

          <div v-else>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('availability.specificDateLabel', 'Fecha Específica') }}
            </label>
            <input type="date" v-model="formSlot.specificDate" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.startTimeLabel', 'Hora Inicio') }}
              </label>
              <input type="time" v-model="formSlot.startTime" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.endTimeLabel', 'Hora Fin') }}
              </label>
              <input type="time" v-model="formSlot.endTime" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('availability.notesLabel', 'Notas / Observaciones') }}
            </label>
            <input type="text" v-model="formSlot.notes" :placeholder="t('availability.notesPlaceholder', 'Ej: Feriado Nacional, Turno Mañana')" class="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white" />
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-between w-full">
          <div>
            <fwb-button v-if="isEditing" color="red" size="sm" @click="deleteSlot" class="inline-flex items-center gap-2">
              <IconLucideTrash2 class="w-4 h-4" />
              {{ t('common.delete', 'Eliminar') }}
            </fwb-button>
          </div>
          <div class="flex space-x-2">
            <fwb-button color="alternative" size="sm" @click="showSlotModal = false">
              {{ t('common.cancel', 'Cancelar') }}
            </fwb-button>
            <fwb-button color="blue" size="sm" @click="saveSlot">
              {{ t('common.save', 'Guardar') }}
            </fwb-button>
          </div>
        </div>
      </template>
    </fwb-modal>

    <!-- Templates Management Modal -->
    <fwb-modal v-if="showTemplateModal" @close="showTemplateModal = false" size="lg">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ templateMode === 'LIST' ? t('availability.templatesModalTitle', 'Administrar Plantillas de Disponibilidad') : (editingTemplate.id ? t('availability.editTemplateTitle', 'Editar Plantilla') : t('availability.createTemplateTitle', 'Crear Nueva Plantilla')) }}
        </h3>
      </template>
      <template #body>
        <div v-if="templateMode === 'LIST'" class="space-y-6">
          <div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
            <h4 class="font-semibold text-sm">{{ t('availability.applyTemplateTitle', 'Aplicar Plantilla a Agentes') }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ t('availability.selectTemplate', 'Seleccionar Plantilla') }}</label>
                <select v-model="applyTemplateForm.templateId" class="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:text-white">
                  <option value="" disabled>-- {{ t('availability.chooseTemplate', 'Seleccione plantilla') }} --</option>
                  <option v-for="t in templates" :key="t.id" :value="t.id">
                    {{ t.name }}
                  </option>
                </select>
              </div>
              <div class="flex items-center mt-4">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="applyTemplateForm.overwrite" class="sr-only peer" />
                  <div class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span class="ms-3 text-xs font-medium text-gray-950 dark:text-gray-300">{{ t('availability.overwriteExisting', 'Sobrescribir horarios recurrentes') }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1.5">{{ t('availability.selectTargetAgents', 'Agentes Destinatarios') }}</label>
              <div class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2.5 rounded bg-white dark:bg-gray-800 dark:border-gray-700">
                <div v-for="agent in agents" :key="agent.id" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="'cb-agent-' + agent.id"
                    :value="agent.id"
                    v-model="applyTemplateForm.agentIds"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label :for="'cb-agent-' + agent.id" class="ms-2 text-xs text-gray-900 dark:text-gray-300">
                    {{ agent.fullName }}
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <fwb-button
                @click="applyTemplateToGroup"
                :disabled="!applyTemplateForm.templateId || applyTemplateForm.agentIds.length === 0"
                color="blue"
                size="xs"
              >
                {{ t('availability.applyTemplateBtn', 'Aplicar a Selección') }}
              </fwb-button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-sm">{{ t('availability.existingTemplates', 'Plantillas Registradas') }}</h4>
              <fwb-button @click="startCreateTemplate" color="blue" size="xs" class="inline-flex items-center gap-1">
                <IconLucidePlus class="w-3.5 h-3.5" />
                {{ t('availability.newTemplate', 'Nueva Plantilla') }}
              </fwb-button>
            </div>
            <div v-if="templates.length === 0" class="text-xs text-gray-500 italic">
              {{ t('availability.noTemplates', 'No hay plantillas creadas') }}
            </div>
            <div v-else class="space-y-2 max-h-60 overflow-y-auto">
              <div v-for="tmpl in templates" :key="tmpl.id" class="p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 flex justify-between items-center text-xs">
                <div class="min-w-0 flex-1 mr-4">
                  <p class="font-bold text-primary flex items-center gap-1.5 flex-wrap">
                    {{ tmpl.name }}
                    <span v-if="tmpl.isStandard || (tmpl as any).standard" class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[9px] font-medium">{{ t('availability.standardBadge', 'Estándar') }}</span>
                  </p>
                  <p class="text-secondary text-[11px] mt-0.5 truncate">{{ tmpl.description }}</p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                    {{ tmpl.slots?.length || 0 }} {{ t('availability.slotsCount', 'intervalos') }}
                  </span>
                  <div class="flex gap-1.5">
                    <button
                      v-if="!(tmpl.isStandard || (tmpl as any).standard)"
                      @click="startEditTemplate(tmpl)"
                      class="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      :title="t('common.edit', 'Editar')"
                    >
                      <IconLucidePencil class="w-4 h-4" />
                    </button>
                    <button
                      v-if="!(tmpl.isStandard || (tmpl as any).standard)"
                      @click="deleteTemplate(tmpl.id!)"
                      class="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      :title="t('common.delete', 'Eliminar')"
                    >
                      <IconLucideTrash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <!-- Template Edit/Create Form -->
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.templateNameLabel', 'Nombre de la Plantilla') }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                v-model="editingTemplate.name"
                class="w-full border rounded-lg p-2 text-sm dark:bg-gray-700 dark:text-white"
                :placeholder="t('availability.templateNamePlaceholder', 'Ej: Turno Tarde')"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ t('availability.templateDescLabel', 'Descripción') }}
              </label>
              <input
                type="text"
                v-model="editingTemplate.description"
                class="w-full border rounded-lg p-2 text-sm dark:bg-gray-700 dark:text-white"
                :placeholder="t('availability.templateDescPlaceholder', 'Ej: Horarios de 14:00 a 20:00')"
              />
            </div>
          </div>

          <div class="border-t border-gray-100 dark:border-gray-700 pt-3">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-bold text-xs uppercase text-gray-400 tracking-wider">
                {{ t('availability.templateSlots', 'Intervalos Semanales') }}
              </h4>
              <fwb-button @click="addTemplateSlot" color="alternative" size="xs" class="inline-flex items-center gap-1">
                <IconLucidePlus class="w-3.5 h-3.5" />
                {{ t('availability.addInterval', 'Agregar Intervalo') }}
              </fwb-button>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-if="!editingTemplate.slots || editingTemplate.slots.length === 0" class="text-center py-6 text-xs text-gray-400 italic">
                {{ t('availability.noIntervals', 'No hay intervalos agregados. Esta plantilla estará vacía.') }}
              </div>
              <div
                v-for="(slot, index) in editingTemplate.slots"
                :key="index"
                class="grid grid-cols-12 gap-2 p-2 bg-gray-50 dark:bg-gray-900/30 rounded border dark:border-gray-700 items-center text-xs"
              >
                <div class="col-span-3">
                  <select v-model="slot.dayOfWeek" class="w-full border rounded p-1.5 text-xs dark:bg-gray-700 dark:text-white">
                    <option v-for="day in daysOfWeek" :key="day" :value="day">{{ dayNames[day] }}</option>
                  </select>
                </div>
                <div class="col-span-3">
                  <input type="time" v-model="slot.startTime" class="w-full border rounded p-1.5 text-xs dark:bg-gray-700 dark:text-white" />
                </div>
                <div class="col-span-3">
                  <input type="time" v-model="slot.endTime" class="w-full border rounded p-1.5 text-xs dark:bg-gray-700 dark:text-white" />
                </div>
                <div class="col-span-2">
                  <select v-model="slot.isAvailable" class="w-full border rounded p-1.5 text-xs dark:bg-gray-700 dark:text-white">
                    <option :value="true">{{ t('availability.stateAvailable', 'Laborable') }}</option>
                    <option :value="false">{{ t('availability.stateUnavailable', 'Bloqueo') }}</option>
                  </select>
                </div>
                <div class="col-span-1 flex justify-center">
                  <button
                    @click="removeTemplateSlot(index)"
                    class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <IconLucideTrash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between w-full">
          <div>
            <fwb-button
              v-if="templateMode === 'FORM'"
              color="alternative"
              size="sm"
              @click="templateMode = 'LIST'"
            >
              {{ t('common.cancel', 'Cancelar') }}
            </fwb-button>
          </div>
          <div class="flex space-x-2">
            <fwb-button
              v-if="templateMode === 'LIST'"
              color="alternative"
              size="sm"
              @click="showTemplateModal = false"
            >
              {{ t('common.close', 'Cerrar') }}
            </fwb-button>
            <fwb-button
              v-else
              color="blue"
              size="sm"
              @click="saveTemplate"
            >
              {{ t('common.save', 'Guardar') }}
            </fwb-button>
          </div>
        </div>
      </template>
    </fwb-modal>

    <!-- Toasts / Alerts -->
    <div v-if="toast.visible" class="fixed bottom-5 right-5 z-50">
      <fwb-alert :type="toast.type" class="shadow-lg">
        {{ toast.message }}
      </fwb-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { userService } from '@/services/userService';
import {
  getAgentAvailability,
  saveAgentAvailability,
  updateAgentAvailability,
  deleteAgentAvailability,
  getAvailabilityTemplates,
  applyAvailabilityTemplate,
  createAvailabilityTemplate,
  updateAvailabilityTemplate,
  deleteAvailabilityTemplate,
} from '@/services/calendarService';
import type { AgentAvailability, AvailabilityTemplate, SlotType } from '@/types/visitCalendar';
import { FwbButton, FwbModal, FwbAlert } from 'flowbite-vue';

import IconLucideUsers from '~icons/lucide/users';
import IconLucideSettings from '~icons/lucide/settings';
import IconLucidePlus from '~icons/lucide/plus';
import IconLucideInfo from '~icons/lucide/info';
import IconLucideTrash2 from '~icons/lucide/trash-2';
import IconLucidePencil from '~icons/lucide/pencil';

const { t } = useI18n();

// Days list (1-7 = Monday-Sunday)
const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayNames: Record<string, string> = {
  MONDAY: t('days.monday', 'Lunes'),
  TUESDAY: t('days.tuesday', 'Martes'),
  WEDNESDAY: t('days.wednesday', 'Miércoles'),
  THURSDAY: t('days.thursday', 'Jueves'),
  FRIDAY: t('days.friday', 'Viernes'),
  SATURDAY: t('days.saturday', 'Sábado'),
  SUNDAY: t('days.sunday', 'Domingo'),
};

const loading = ref(false);
const agents = ref<any[]>([]);
const selectedAgentId = ref('');
const availability = ref<AgentAvailability[]>([]);
const templates = ref<AvailabilityTemplate[]>([]);

const showSlotModal = ref(false);
const isEditing = ref(false);
const showTemplateModal = ref(false);

const templateMode = ref<'LIST' | 'FORM'>('LIST');
const editingTemplate = ref<Partial<AvailabilityTemplate>>({
  id: '',
  name: '',
  description: '',
  isStandard: false,
  slots: [],
});

const toast = ref({ visible: false, message: '', type: 'success' as 'success' | 'danger' });

const formSlot = ref({
  id: '',
  type: 'RECURRING' as SlotType,
  dayOfWeek: 'MONDAY',
  specificDate: '',
  startTime: '08:30',
  endTime: '12:30',
  isAvailable: true,
  notes: '',
});

const applyTemplateForm = ref({
  templateId: '',
  agentIds: [] as string[],
  overwrite: true,
});

const selectedAgent = computed(() => {
  return agents.value.find((a) => a.id === selectedAgentId.value) || null;
});

const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
  toast.value = { visible: true, message, type };
  setTimeout(() => {
    toast.value.visible = false;
  }, 5000);
};

const loadAgents = async () => {
  try {
    const res = await userService.getUsers(0, 100, 'ACTIVE');
    // Filter only employees/agents
    agents.value = (res.data || []).filter(
      (user: any) =>
        user.userType === 'EMPLOYEE' ||
        (user.roles && user.roles.includes('AGENT'))
    );
  } catch (e) {
    console.error('Error loading agents:', e);
  }
};

const loadAvailability = async () => {
  if (!selectedAgentId.value) return;
  loading.value = true;
  try {
    availability.value = await getAgentAvailability(selectedAgentId.value);
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.loadError', 'Error al cargar disponibilidad'), 'danger');
  } finally {
    loading.value = false;
  }
};

const loadTemplates = async () => {
  try {
    templates.value = await getAvailabilityTemplates();
  } catch (e) {
    console.error('Error loading templates:', e);
  }
};

const getRecurringForDay = (day: string) => {
  return availability.value
    .filter((a) => a.type === 'RECURRING' && a.dayOfWeek === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const getExceptionsForDay = (day: string) => {
  return availability.value.filter((a) => {
    if (a.type !== 'EXCEPTION' || !a.specificDate) return false;
    const dateObj = new Date(a.specificDate + 'T00:00:00Z');
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[dateObj.getUTCDay()] === day;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const applyStandardHours = async () => {
  if (!selectedAgentId.value) return;
  
  const standard = templates.value.find((t) => t.isStandard || (t as any).standard);
  if (!standard || !standard.id) {
    showToast(t('availability.noStandardTemplate', 'No se encontró la plantilla estándar en el sistema.'), 'danger');
    return;
  }

  loading.value = true;
  try {
    await applyAvailabilityTemplate(standard.id, [selectedAgentId.value], true);
    showToast(t('availability.standardHoursApplied', 'Horario estándar aplicado exitosamente.'));
    await loadAvailability();
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.applyError', 'Error al aplicar plantilla'), 'danger');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  formSlot.value = {
    id: '',
    type: 'RECURRING',
    dayOfWeek: 'MONDAY',
    specificDate: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '12:30',
    isAvailable: true,
    notes: '',
  };
  showSlotModal.value = true;
};

const openEditModal = (slot: AgentAvailability) => {
  isEditing.value = true;
  formSlot.value = {
    id: slot.id || '',
    type: slot.type,
    dayOfWeek: slot.dayOfWeek || 'MONDAY',
    specificDate: slot.specificDate || new Date().toISOString().split('T')[0],
    startTime: slot.startTime.substring(0, 5),
    endTime: slot.endTime.substring(0, 5),
    isAvailable: slot.isAvailable,
    notes: slot.notes || '',
  };
  showSlotModal.value = true;
};

const saveSlot = async () => {
  if (!selectedAgentId.value) return;

  const payload: Partial<AgentAvailability> = {
    type: formSlot.value.type,
    startTime: formSlot.value.startTime + ':00',
    endTime: formSlot.value.endTime + ':00',
    isAvailable: formSlot.value.isAvailable === true || String(formSlot.value.isAvailable) === 'true',
    notes: formSlot.value.notes,
  };

  if (formSlot.value.type === 'RECURRING') {
    payload.dayOfWeek = formSlot.value.dayOfWeek;
  } else {
    payload.specificDate = formSlot.value.specificDate;
  }

  try {
    if (isEditing.value) {
      await updateAgentAvailability(selectedAgentId.value, formSlot.value.id, payload);
      showToast(t('availability.slotUpdated', 'Horario de disponibilidad actualizado.'));
    } else {
      await saveAgentAvailability(selectedAgentId.value, payload);
      showToast(t('availability.slotCreated', 'Horario de disponibilidad creado.'));
    }
    showSlotModal.value = false;
    await loadAvailability();
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.saveError', 'Error al guardar el horario (compruebe solapamientos)'), 'danger');
  }
};

const deleteSlot = async () => {
  if (!selectedAgentId.value || !formSlot.value.id) return;
  
  if (!confirm(t('availability.confirmDelete', '¿Está seguro de que desea eliminar este bloque de horario?'))) {
    return;
  }

  try {
    await deleteAgentAvailability(selectedAgentId.value, formSlot.value.id);
    showToast(t('availability.slotDeleted', 'Horario eliminado correctamente.'));
    showSlotModal.value = false;
    await loadAvailability();
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.deleteError', 'Error al eliminar el horario'), 'danger');
  }
};

const openTemplateModal = async () => {
  await loadTemplates();
  applyTemplateForm.value = {
    templateId: '',
    agentIds: [],
    overwrite: true,
  };
  templateMode.value = 'LIST';
  showTemplateModal.value = true;
};

const applyTemplateToGroup = async () => {
  if (!applyTemplateForm.value.templateId || applyTemplateForm.value.agentIds.length === 0) return;

  loading.value = true;
  try {
    await applyAvailabilityTemplate(
      applyTemplateForm.value.templateId,
      applyTemplateForm.value.agentIds,
      applyTemplateForm.value.overwrite
    );
    showToast(t('availability.templateAppliedGroup', 'Plantilla aplicada con éxito al grupo de agentes.'));
    showTemplateModal.value = false;
    if (selectedAgentId.value && applyTemplateForm.value.agentIds.includes(selectedAgentId.value)) {
      await loadAvailability();
    }
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.applyGroupError', 'Error al aplicar plantilla al grupo'), 'danger');
  } finally {
    loading.value = false;
  }
};

const startCreateTemplate = () => {
  editingTemplate.value = {
    name: '',
    description: '',
    isStandard: false,
    slots: [],
  };
  templateMode.value = 'FORM';
};

const startEditTemplate = (tmpl: AvailabilityTemplate) => {
  editingTemplate.value = {
    id: tmpl.id,
    name: tmpl.name,
    description: tmpl.description,
    isStandard: tmpl.isStandard,
    slots: tmpl.slots ? tmpl.slots.map(s => ({
      type: s.type || 'RECURRING',
      dayOfWeek: s.dayOfWeek || 'MONDAY',
      startTime: s.startTime.substring(0, 5),
      endTime: s.endTime.substring(0, 5),
      isAvailable: s.isAvailable === undefined ? true : s.isAvailable,
    })) : [],
  };
  templateMode.value = 'FORM';
};

const addTemplateSlot = () => {
  if (!editingTemplate.value.slots) {
    editingTemplate.value.slots = [];
  }
  editingTemplate.value.slots.push({
    type: 'RECURRING',
    dayOfWeek: 'MONDAY',
    startTime: '08:30',
    endTime: '12:30',
    isAvailable: true,
  });
};

const removeTemplateSlot = (index: number) => {
  editingTemplate.value.slots?.splice(index, 1);
};

const saveTemplate = async () => {
  if (!editingTemplate.value.name) {
    showToast(t('availability.nameRequired', 'El nombre es requerido'), 'danger');
    return;
  }

  const formattedSlots = (editingTemplate.value.slots || []).map(s => ({
    ...s,
    startTime: s.startTime.length === 5 ? s.startTime + ':00' : s.startTime,
    endTime: s.endTime.length === 5 ? s.endTime + ':00' : s.endTime,
    isAvailable: String(s.isAvailable) === 'true' || s.isAvailable === true,
  }));

  const payload = {
    name: editingTemplate.value.name,
    description: editingTemplate.value.description,
    isStandard: false,
    slots: formattedSlots,
  };

  try {
    if (editingTemplate.value.id) {
      await updateAvailabilityTemplate(editingTemplate.value.id, payload);
      showToast(t('availability.templateUpdated', 'Plantilla actualizada exitosamente'));
    } else {
      await createAvailabilityTemplate(payload);
      showToast(t('availability.templateCreated', 'Plantilla creada exitosamente'));
    }
    templateMode.value = 'LIST';
    await loadTemplates();
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.templateSaveError', 'Error al guardar la plantilla'), 'danger');
  }
};

const deleteTemplate = async (templateId: string) => {
  if (!confirm(t('availability.confirmDeleteTemplate', '¿Está seguro de que desea eliminar esta plantilla?'))) {
    return;
  }
  try {
    await deleteAvailabilityTemplate(templateId);
    showToast(t('availability.templateDeleted', 'Plantilla eliminada exitosamente'));
    await loadTemplates();
  } catch (e: any) {
    showToast(e.response?.data?.message || t('availability.templateDeleteError', 'Error al eliminar la plantilla'), 'danger');
  }
};

onMounted(() => {
  loadAgents();
  loadTemplates();
});
</script>

<style scoped>
.app-page {
  width: 100%;
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
