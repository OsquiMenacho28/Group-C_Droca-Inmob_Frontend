// src/types/reschedule.ts
// Types for the "Reschedule cancelled visit" User Story
// Reuses EventType and EventStatus from visitCalendar for consistency

import type { EventType, EventStatus } from './visitCalendar';

// Re-export for convenience
export type { EventType, EventStatus };

/** Historial de reasignación de una visita */
export interface ReassignmentHistory {
  requestId: string;
  previousAgentId: string;
  newAgentId: string;
  reason: string;
  reassignedAt?: string;
}

/** Historial de reprogramación de una visita */
export interface ReschedulingHistory {
  newVisitId: string;
  previousStartTime: string; // ISO-8601 datetime string
  previousEndTime: string; // ISO-8601 datetime string
  newStartTime: string; // ISO-8601 datetime string
  newEndTime: string; // ISO-8601 datetime string
  rescheduledByAgentId: string;
  rescheduledAt?: string;
}

/**
 * Representa una visita de propiedad o solicitud de cliente.
 * Contiene todos los detalles sobre una visita, incluyendo información del inmueble,
 * cliente, agente asignado, y historial de cambios.
 */
export interface Visit {
  /** ID único de la visita */
  id: string;

  /** ID del inmueble al que corresponde la visita */
  propertyId: string;

  /** Nombre descriptivo del inmueble */
  propertyName: string;

  /** Dirección del inmueble */
  propertyAddress?: string;

  /** ID del cliente que solicitó la visita */
  clientId?: string;

  /** Nombre del cliente que solicitó la visita */
  clientName?: string;

  /**
   * ID del agente actualmente asignado a la visita.
   * Este campo se actualiza cuando se acepta una reasignación.
   */
  agentId: string;

  /** Nombre completo del agente */
  agentName: string;

  /** ID del vehículo asignado a la visita */
  vehicleId?: string;

  /** Fecha y hora de inicio programada para la visita (ISO-8601) */
  startTime: string;

  /** Fecha y hora de fin programada para la visita (ISO-8601) */
  endTime: string;

  /** Tiempo de desplazamiento de ida (en minutos) */
  travelTimeGo?: number;

  /** Tiempo de desplazamiento de vuelta (en minutos) */
  travelTimeBack?: number;

  /** Tipo de evento: VISIT (visita de agente), CLIENT_REQUEST (solicitud de cliente) */
  type: EventType;

  /** Estado de la visita: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED */
  status: EventStatus;

  /** Notas adicionales sobre la visita */
  notes?: string;

  /** Indica si esta visita es propiedad del agente autenticado (para UI) */
  ownEvent: boolean;

  /** Fecha en que se creó la solicitud de visita (ISO-8601) */
  createdAt: string;

  /** Historial de todas las reasignaciones */
  reassignmentHistory?: ReassignmentHistory[];

  /** ID de la visita original si fue reprogramada */
  originVisitId?: string;

  /** Historial de reprogramaciones */
  reschedulingHistory?: ReschedulingHistory[];
}

/**
 * Solicitud para reprogramar una visita cancelada.
 * Especifica la nueva fecha y hora, y opcionalmente notas adicionales.
 */
export interface RescheduleRequest {
  /** Fecha y hora de inicio para la nueva visita (ISO-8601) */
  newStartTime: string;

  /** Fecha y hora de fin para la nueva visita (ISO-8601) */
  newEndTime: string;

  /**
   * Notas opcionales para la nueva visita.
   * Si no se proporciona, las notas de la visita original se copian.
   */
  notes?: string;
}

/**
 * Respuesta de una solicitud de reprogramación de visita.
 * Contiene los detalles de la nueva visita creada y referencia a la visita original.
 */
export interface RescheduleResponse {
  /** ID de la nueva visita creada */
  newVisitId: string;

  /** ID del inmueble */
  propertyId: string;

  /** Nombre descriptivo del inmueble */
  propertyName: string;

  /** Dirección del inmueble */
  propertyAddress?: string;

  /** ID del cliente */
  clientId?: string;

  /** Nombre del cliente */
  clientName?: string;

  /** ID del agente asignado a la nueva visita */
  agentId: string;

  /** Nombre completo del agente */
  agentName: string;

  /** Fecha y hora de inicio de la nueva visita (ISO-8601) */
  startTime: string;

  /** Fecha y hora de fin de la nueva visita (ISO-8601) */
  endTime: string;

  /** Tipo de evento */
  type: EventType;

  /** Estado de la nueva visita */
  status: EventStatus;

  /** Notas de la nueva visita */
  notes?: string;

  /** Indica si esta visita es propiedad del agente autenticado (para UI) */
  ownEvent?: boolean;

  /** Fecha en que se creó la nueva visita (ISO-8601) */
  createdAt: string;

  /** ID de la visita original cancelada que fue reprogramada */
  originVisitId: string;

  /** Mensaje de confirmación mostrado en la UI */
  message: string;
}

/** Respuesta de error cuando no hay disponibilidad */
export interface AvailabilityError {
  error: string;
}
