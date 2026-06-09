export type ClientInteractionType = 'VISITA' | 'FAVORITO';

export type ClientInteractionFilterType = 'ALL' | ClientInteractionType;

export interface ClientInteraction {
  id: string;
  type: ClientInteractionType;
  propertyId: string;
  propertyName?: string;
  agentId?: string;
  agentName?: string;
  occurredAt: string;
  detail?: string;
  subType?: string;
}
