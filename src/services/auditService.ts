import { api } from './api';

interface IdentityLog {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  details?: string;
  performedByName?: string;
  performedByEmail?: string;
  performedBy?: string;
  timestamp: string;
}

interface AuditLog {
  id: string;
  action: string;
  personId?: string;
  personName: string;
  personType: string;
  changedBy: string;
  timestamp: string;
  details?: string;
  changes?: unknown[];
}

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    const [identityResult, personResult] = await Promise.allSettled([
      api.get('/audit/logs'),
      api.get('/audit-logs'),
    ]);

    const normalizeIdentityAction = (action: string): string => {
      const map: Record<string, string> = {
        USER_CREATE: 'CREATED',
        USER_UPDATE: 'UPDATED',
        USER_DEACTIVATE: 'DEACTIVATE',
        USER_REACTIVATE: 'REACTIVATE',
        USER_DELETE: 'DELETE',
        USER_ROLE_ASSIGN: 'ROLE_ASSIGN',
      };
      return map[action] || action;
    };

    const extractEmailFromDetails = (details?: string): string | undefined => {
      if (!details) return undefined;
      const match = details.match(/User:\s*([^\s]+)\s*\(/i);
      return match?.[1];
    };

    const rawIdentityLogs: IdentityLog[] =
      identityResult.status === 'fulfilled'
        ? identityResult.value.data || []
        : [];

    const userLabelById = new Map<string, string>();

    rawIdentityLogs
      .slice()
      .sort((a: IdentityLog, b: IdentityLog) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return ta - tb;
      })
      .forEach((log: IdentityLog) => {
        const uid = (log.userId || '').toString().trim();
        if (!uid) return;

        const label = log.userEmail || extractEmailFromDetails(log.details);
        if (label) {
          userLabelById.set(uid, label);
        }
      });

    const identityLogs: AuditLog[] = rawIdentityLogs.map(
      (log: IdentityLog) => ({
        id: `identity-${log.id}`,
        action: normalizeIdentityAction(log.action),
        personId: log.userId,
        personName:
          log.userEmail ||
          extractEmailFromDetails(log.details) ||
          userLabelById.get((log.userId || '').toString()) ||
          log.userId ||
          'Usuario',
        personType: 'USER',
        changedBy:
          log.performedByName ||
          log.performedByEmail ||
          log.performedBy ||
          'Usuario no identificado',
        timestamp: log.timestamp,
        details: log.details,
        changes: [],
      })
    );

    const personLogs: AuditLog[] =
      personResult.status === 'fulfilled' ? personResult.value.data || [] : [];

    return [...identityLogs, ...personLogs].sort((a: AuditLog, b: AuditLog) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return tb - ta;
    });
  },
};
