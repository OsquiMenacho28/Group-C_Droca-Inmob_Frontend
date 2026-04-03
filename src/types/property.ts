export type OperationType = 'VENTA' | 'ALQUILER' | 'ANTICRETICO';

export interface AssignmentHistory {
  agentId: string;
  assignedAt: string;
  assignedBy: string;
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
  assignmentHistory: AssignmentHistory[];
  ownerId?: string;
  visitCount?: number;
}

export interface PropertyFormPayload {
  title: string;
  address: string;
  price: number;
  type: string;
  operationType: OperationType; // <-- Nuevo campo
  m2: number;
  rooms: number;
  ownerId?: string | null;
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