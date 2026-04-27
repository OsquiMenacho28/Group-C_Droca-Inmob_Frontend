import type { OperationType } from './property';

export interface OperationData {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  operationType: OperationType | string;
  finalPrice: number;
  currency: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  department: string;
  ownerId: string;
  ownerName: string;
  status: 'CLOSED' | 'CANCELLED' | 'ACTIVE' | 'PENDING' | string;
  notes: string;
  closureDate: string;
}

export interface ClosureForm {
  finalPrice: number;
  currency: string;
  closingDate: string;
  agentId: string;
  clientId: string;
  notes: string;
}

export interface SelectOption {
  value: string;
  name: string;
}
