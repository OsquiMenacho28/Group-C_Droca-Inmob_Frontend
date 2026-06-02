import { apiClient as api } from '@/api';
import type { ApiResponse } from '@/api/types';

export interface AuditChange {
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
}

export interface BaseAuditLog {
  id: string;
  action: string;
  userId?: string;
  timestamp: string;
  details?: string;
  changes?: AuditChange[];
}

export interface IdentityAuditLog extends BaseAuditLog {
  userEmail?: string;
  performedBy?: string;
}

export interface PropertyAuditLog extends BaseAuditLog {
  propertyId: string;
  previousValue?: string | null;
  newValue?: string | null;
}

export interface ProfileAuditLog extends BaseAuditLog {
  personId: string;
  changedBy?: string;
}

export const auditService = {
  /**
   * Identity Audit Logs (Formerly /audit/logs)
   */
  async getIdentityAudit(filters: {
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<IdentityAuditLog[]>> {
    const response = await api.get<ApiResponse<IdentityAuditLog[]>>(
      '/users/audit',
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Property Audit Logs
   */
  async getPropertyAudit(filters: {
    propertyId?: string;
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PropertyAuditLog[]>> {
    const response = await api.get<ApiResponse<PropertyAuditLog[]>>(
      '/properties/audit',
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Profile Audit Logs (Formerly /audit-logs)
   */
  async getProfileAudit(filters: {
    personId?: string;
    changedBy?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<ProfileAuditLog[]>> {
    const response = await api.get<ApiResponse<ProfileAuditLog[]>>(
      '/persons/audit',
      {
        params: filters,
      }
    );
    return response.data;
  },
};
