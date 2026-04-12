export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ReassignmentRequest {
  destinationAgentId: string;
  reason: string;
}

export interface ReassignmentResponseRequest {
  decision: 'ACCEPTED' | 'REJECTED';
  comment?: string;
}

export interface ReassignmentSolicitation {
  id: string;
  visitId: string;
  requestingAgentId: string;
  destinationAgentId: string;
  reason: string;
  status: RequestStatus;
  requestedAt: string;
  repliedAt?: string;
  commentReply?: string;
}

export interface PendingCount {
  pending: number;
}

export interface AvailableAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType?: string;
}
