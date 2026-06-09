import { apiClient as api } from '@/api';

export interface AlertConfig {
    id: string;
    enableDailySummary: boolean;
    enableIndividualReminders: boolean;
    anticipationMinutes: number;
    channel: string;
    lastDailyNotificationDate?: string;
}

export const alertService = {
    async getAlertConfig(): Promise<AlertConfig> {
        // Ruta correcta: /alertas/admin/configuracion-alertas
        const response = await api.get('/alertas/admin/configuracion-alertas');
        return response.data.data;
    },

    async updateAlertConfig(params: {
        enableDailySummary: boolean;
        enableIndividualReminders: boolean;
        anticipationMinutes: number;
        channel: string;
    }): Promise<AlertConfig> {
        // Ruta correcta: PUT con query params (así lo define el controller)
        const response = await api.put('/alertas/admin/configuracion-alertas', null, { params });
        return response.data.data;
    },

    async getTodayVisits() {
        const response = await api.get('/alertas/visitas-del-dia');
        return response.data.data;
    }
};