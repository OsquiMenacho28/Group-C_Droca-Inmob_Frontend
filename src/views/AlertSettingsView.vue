<template>
    <div class="app-page p-6 space-y-6">
        <div>
            <h1 class="text-3xl font-bold text-primary">Configuración de notificaciones</h1>
            <p class="text-secondary text-sm">Administra las alertas de visitas y el resumen diario</p>
        </div>

        <div class="app-card p-6 space-y-6">
            <div v-if="loading" class="text-center py-8">
                <fwb-spinner size="8" />
            </div>

            <div v-else class="space-y-6">
                <!-- Resumen diario -->
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                        <h3 class="font-bold text-primary">Resumen diario de visitas</h3>
                        <p class="text-secondary text-sm">Recibirás una notificación cada día a las 08:00 con el total de visitas programadas</p>
                    </div>
                    <fwb-toggle v-model="form.enableDailySummary" />
                </div>

                <!-- Recordatorios individuales -->
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                        <h3 class="font-bold text-primary">Recordatorios por visita</h3>
                        <p class="text-secondary text-sm">Recibirás una notificación antes de cada visita programada</p>
                    </div>
                    <fwb-toggle v-model="form.enableIndividualReminders" />
                </div>

                <!-- Anticipación (solo si recordatorios individuales están habilitados) -->
                <div v-if="form.enableIndividualReminders" class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tiempo de anticipación (minutos)
                    </label>
                    <select v-model="form.anticipationMinutes" class="app-input max-w-xs">
                        <option :value="30">30 minutos</option>
                        <option :value="60">1 hora</option>
                        <option :value="90">1 hora y media</option>
                    </select>
                </div>

                <!-- Canal de notificación -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Canal de notificación
                    </label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2">
                            <input type="radio" value="IN_APP" v-model="form.channel" />
                            Solo in-app
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="EMAIL" v-model="form.channel" />
                            Solo email
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="BOTH" v-model="form.channel" />
                            Ambos
                        </label>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <fwb-button color="alternative" @click="loadConfig">Cancelar</fwb-button>
                    <fwb-button gradient="blue" @click="saveConfig" :disabled="saving">
                        {{ saving ? 'Guardando...' : 'Guardar configuración' }}
                    </fwb-button>
                </div>
            </div>
        </div>

        <AppToast :show="toast.show" :message="toast.message" :type="toast.type" @close="toast.show = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FwbSpinner, FwbToggle, FwbButton } from 'flowbite-vue';
import { alertService, type AlertConfig } from '@/services/alertService';
import { handleApiError } from '@/api/errorHandler';
import AppToast from '@/components/ui/AppToast.vue';

const loading = ref(true);
const saving = ref(false);
const form = reactive({
    enableDailySummary: false,
    enableIndividualReminders: true,
    anticipationMinutes: 60,
    channel: 'IN_APP'
});

const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
});

async function loadConfig() {
    loading.value = true;
    try {
        const config = await alertService.getAlertConfig();
        form.enableDailySummary = config.enableDailySummary;
        form.enableIndividualReminders = config.enableIndividualReminders;
        form.anticipationMinutes = config.anticipationMinutes;
        form.channel = config.channel;
    } catch (err) {
        toast.message = handleApiError(err).message;
        toast.type = 'error';
        toast.show = true;
    } finally {
        loading.value = false;
    }
}

async function saveConfig() {
    saving.value = true;
    try {
        await alertService.updateAlertConfig({
            enableDailySummary: form.enableDailySummary,
            enableIndividualReminders: form.enableIndividualReminders,
            anticipationMinutes: form.anticipationMinutes,
            channel: form.channel
        });
        toast.message = 'Configuración guardada correctamente';
        toast.type = 'success';
        toast.show = true;
    } catch (err) {
        toast.message = handleApiError(err).message;
        toast.type = 'error';
        toast.show = true;
    } finally {
        saving.value = false;
    }
}

loadConfig();
</script>