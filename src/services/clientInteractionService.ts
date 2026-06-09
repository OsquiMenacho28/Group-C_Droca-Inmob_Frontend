import { apiClient as api } from '@/api';
import { handleApiError } from '@/api/errorHandler';
import type {
  ClientInteraction,
  ClientInteractionFilterType,
} from '@/types/clientInteraction';

export class ClientInteractionAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientInteractionAccessError';
  }
}

interface ClientInteractionApiItem {
  id: string;
  clientId: string;
  agentId?: string;
  agentName?: string;
  propertyId: string;
  propertyName?: string;
  type: 'VISITA' | 'FAVORITO';
  occurredAt: string;
  detail?: string;
  subType?: string;
}

function mapApiItem(item: ClientInteractionApiItem): ClientInteraction {
  return {
    id: item.id,
    type: item.type,
    propertyId: item.propertyId,
    propertyName: item.propertyName,
    agentId: item.agentId,
    agentName: item.agentName,
    occurredAt: item.occurredAt,
    detail: item.detail,
    subType: item.subType,
  };
}

export async function fetchClientInteractions(params: {
  clientAuthUserId: string;
  type?: ClientInteractionFilterType;
  from?: string;
  to?: string;
}): Promise<ClientInteraction[]> {
  const { clientAuthUserId, type, from, to } = params;

  if (!clientAuthUserId) {
    return [];
  }

  const query: Record<string, string> = {};
  if (type && type !== 'ALL') {
    query.type = type;
  }
  if (from) {
    query.from = from;
  }
  if (to) {
    query.to = to;
  }

  try {
    const response = await api.get(
      `/clients/${encodeURIComponent(clientAuthUserId)}/interactions`,
      { params: query }
    );
    const items = (response.data?.data || []) as ClientInteractionApiItem[];
    return items.map(mapApiItem);
  } catch (err) {
    const appError = handleApiError(err);
    if (appError.status === 403) {
      throw new ClientInteractionAccessError(appError.message);
    }
    throw err;
  }
}
