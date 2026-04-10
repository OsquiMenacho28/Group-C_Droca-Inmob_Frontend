import { api } from './api'

export const auditService = {
  async getLogs() {
    const [identityResult, personResult] = await Promise.allSettled([
      api.get('/audit/logs'),
      api.get('/audit-logs')
    ])

    const normalizeIdentityAction = (action: string) => {
      const map: Record<string, string> = {
        USER_CREATE: 'CREATED',
        USER_UPDATE: 'UPDATED',
        USER_DEACTIVATE: 'DEACTIVATE',
        USER_REACTIVATE: 'REACTIVATE',
        USER_DELETE: 'DELETE',
        USER_ROLE_ASSIGN: 'ROLE_ASSIGN'
      }
      return map[action] || action
    }

    const identityLogs = identityResult.status === 'fulfilled'
      ? (identityResult.value.data || []).map((log: any) => ({
          id: `identity-${log.id}`,
          action: normalizeIdentityAction(log.action),
          personId: log.userId,
          personName: log.userEmail || log.userId || 'Usuario',
          personType: 'USER',
          changedBy: log.performedByName || log.performedByEmail || log.performedBy || 'Usuario no identificado',
          timestamp: log.timestamp,
          details: log.details,
          changes: []
        }))
      : []

    const personLogs = personResult.status === 'fulfilled'
      ? (personResult.value.data || [])
      : []

    return [...identityLogs, ...personLogs].sort((a: any, b: any) => {
      const ta = new Date(a.timestamp || 0).getTime()
      const tb = new Date(b.timestamp || 0).getTime()
      return tb - ta
    })
  }
}