import { api } from './api'

export const auditService = {
  async getLogs() {
    const res = await api.get('/audit-logs')
    return res.data
  }
}