export type OperationType = 'VENTA' | 'ALQUILER' | 'ANTICRETICO';

export interface AssignmentHistory {
  agentId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface PriceHistory {
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy: string;
}

export interface StatusHistory {
  oldStatus: string;
  newStatus: string;
  changedAt: string;
  changedBy: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  operationType: OperationType;
  m2: number;
  rooms: number;
  status: string;
  imageUrls: string[];
  assignedAgentId: string | null;
  assignmentHistory?: AssignmentHistory[];
  ownerId?: string;
  visitCount?: number;
  priceHistory?: PriceHistory[];
  statusHistory?: StatusHistory[];
  area?: number;
  bedrooms?: number;
  agentName?: string;
  description?: string;
}

export interface PropertyFormPayload {
  title: string;
  address: string;
  price: number;
  type: string;
  operationType: OperationType;
  m2: number;
  rooms: number;
  ownerId?: string | null;
  imageUrls?: string[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export interface PriceHistory {
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy: string;
}

export interface AssignAgentPayload {
  agentId: string;
}
