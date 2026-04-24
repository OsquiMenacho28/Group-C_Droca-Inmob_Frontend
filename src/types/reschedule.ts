// src/types/reschedule.ts
// Types for the "Reschedule cancelled visit" User Story

export type VisitStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface Visit {
  id: string;
  propertyId: string;
  clientId: string;
  agentId: string;
  dateTime: string; // ISO-8601 datetime string
  status: VisitStatus;
  notes?: string;
  originVisitId?: string; // Set if this visit was created by rescheduling
  createdAt: string;
}

export interface RescheduleRequest {
  newDateTime: string; // ISO-8601 datetime string
  notes?: string;
}

export interface RescheduleResponse {
  newVisitId: string;
  propertyId: string;
  clientId: string;
  agentId: string;
  scheduledDateTime: string;
  status: VisitStatus;
  notes?: string;
  originVisitId: string; // ID of the original cancelled visit
  createdAt: string;
  message: string;
}

export interface AvailabilityError {
  error: string;
}
