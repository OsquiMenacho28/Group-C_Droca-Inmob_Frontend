import { apiClient as api } from '@/api';
import type { CreateVehicleRequest, Vehicle } from '@/types/visitCalendar';

const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get('/vehicles');
    return data.data;
  },

  async createVehicle(payload: CreateVehicleRequest): Promise<Vehicle> {
    const { data } = await api.post('/vehicles', payload);
    return data.data;
  },
};

export default vehicleService;
