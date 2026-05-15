export interface NotificationHistoryResponse {
  id: string;
  destinatarioId: string;
  tipo: string;
  contenido: string;
  estado: 'PENDIENTE' | 'ENVIADA' | 'FALLIDA';
  fechaEnvio: string; // ← en lugar de sentAt
  leida: boolean;
  errorMessage?: string;
}

export interface NotificationsState {
  list: NotificationHistoryResponse[];
  total: number;
  readIds: Set<string>; // Ya no se necesita, se usa el campo leida de la respuesta
}
