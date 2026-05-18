export type InteractionType = 'AGENT_AGENT' | 'ADMIN_OP' | 'INTERES' | 'PROPIEDAD_MOD' | 'VISITA';

export interface InAppNotification {
  id: string;
  type: string;                // ej. "VISIT_PROPIEDAD_MOD"
  interactionType: InteractionType;
  involvedUserIds?: string[];
  subject: string;
  content: string;
  readStatus: boolean;
  deliveredAt: string;         // ISO timestamp
  readAt: string | null;
  details?: Record<string, unknown>;
  createdAt: string;           // ISO timestamp
}

export interface NotificationsState {
  list: InAppNotification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    readStatus?: boolean;
    type?: InteractionType;
    fromDate?: string;
    toDate?: string;
  };
}