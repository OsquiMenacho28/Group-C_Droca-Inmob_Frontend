import { apiClient as api } from '@/api';
import type {
  CreateVehicleRequest,
  Vehicle,
  VehicleUsageReportResponse,
} from '@/types/visitCalendar';

const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data } = await api.get('/vehicles');
    return data.data;
  },

  async createVehicle(payload: CreateVehicleRequest): Promise<Vehicle> {
    const { data } = await api.post('/vehicles', payload);
    return data.data;
  },

  async getVehicleUsageReport(
    from: string,
    to: string,
    vehicleId?: string
  ): Promise<VehicleUsageReportResponse> {
    const params = new URLSearchParams({ from, to });
    if (vehicleId) {
      params.append('vehicleId', vehicleId);
    }
    const { data } = await api.get(`/vehicles/usage-report?${params.toString()}`);
    return data.data;
  },
};

export default vehicleService;
