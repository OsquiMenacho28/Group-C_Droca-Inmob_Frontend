// src/types/reassignment.ts
// TypeScript types for the Visit Reassignment User Story

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ReassignmentRequest {
  destinationAgentId: string;
  reason: string;
}

export interface ReassignmentResponseRequest {
  decision: "ACCEPTED" | "REJECTED";  // ← El backend espera "decision"
  comment?: string;                    // ← El backend espera "comment"
}

export interface ReassignmentSolicitation {
  id: string;
  visitId: string;
  requestingAgentId: string;      // ← CORREGIDO: debe coincidir con el backend
  destinationAgentId: string;
  reason: string;
  status: RequestStatus;
  requestedAt: string;             // ← CORREGIDO: debe ser "requestedAt"
  repliedAt?: string;              // ← CORREGIDO: debe ser "repliedAt"
  commentReply?: string;           // ← CORREGIDO: debe ser "commentReply"
}

export interface PendingCount {
  pending: number;
}

/** Represents an agent available for selection in the reassignment modal */
export interface AvailableAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType?: string;
}