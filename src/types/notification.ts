export interface NotificationHistoryResponse {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  createdAt: string;
  sentAt: string | null;
  errorMessage: string | null;
}

export interface NotificationsState {
  list: NotificationHistoryResponse[];
  total: number;
  readIds: Set<string>; // IDs leídos almacenados localmente
}