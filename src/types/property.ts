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
  m2: number;
  rooms: number;
  status: string;
  imageUrls: string[];
  assignedAgentId: string | null;
  assignmentHistory: AssignmentHistory[];
}

// Asegúrate de tener este export aquí:
export interface AssignAgentPayload {
  agentId: string;
}

export interface PropertyFormPayload {
  title: string;
  address: string;
  price: number;
  type: string;
  m2: number;
  rooms: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}