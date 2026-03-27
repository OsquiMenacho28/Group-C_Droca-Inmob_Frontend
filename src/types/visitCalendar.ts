// ============================================================
//  src/types/visitCalendar.ts
//  Tipos TypeScript para las HU del calendario de visitas.
//  Espejo de los DTOs del backend visit-calendar-service.
// ============================================================

// --- Enums ---

export type EventType = 'VISIT' | 'CLIENT_REQUEST'
export type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

// --- CalendarEvent ---

export interface CalendarEventResponse {
  id: string
  propertyId: string
  propertyName: string
  propertyAddress?: string
  agentId: string
  agentName: string
  startTime: string   // ISO 8601
  endTime: string
  type: EventType
  status: EventStatus
  notes?: string
  createdAt: string
  clientId?: string
  clientName?: string
  /** true si el evento pertenece al agente autenticado → destacar visualmente (HU1 PA1) */
  ownEvent: boolean
}

export interface CalendarResponse {
  events: CalendarEventResponse[]
  from: string
  to: string
  totalEvents: number
  myEvents: number
}

// --- Conflict Check ---

export interface ConflictResponse {
  hasConflict: boolean
  message: string
  conflictingEvents: CalendarEventResponse[]
  suggestedStartTime?: string
  suggestedEndTime?: string
}

// --- Create Visit (HU2) ---

export interface CreateVisitRequest {
  propertyId: string
  propertyName: string
  propertyAddress?: string
  agentId: string
  agentName: string
  startTime: string   // ISO 8601
  endTime: string
  notes?: string
}

// --- Client Visit Request (HU3) ---

export interface ClientVisitRequestDTO {
  propertyId: string
  propertyName: string
  agentId: string
  agentName: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  preferredDateTime: string  // ISO 8601
  alternativeDateTime?: string
  message?: string
}

export interface VisitRequestResponse {
  id: string
  propertyId: string
  propertyName: string
  agentId: string
  agentName: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  preferredDateTime: string
  alternativeDateTime?: string
  message?: string
  status: RequestStatus
  calendarEventId?: string
  createdAt: string
  notificationSent: boolean
}

// --- Property (para HU3 portal cliente) ---

export interface Property {
  id: string
  name: string
  address: string
  zone: string
  price: number
  type: string           // 'CASA' | 'DEPARTAMENTO' | 'TERRENO' | 'LOCAL'
  status: 'Disponible' | 'Reservado' | 'Vendido'
  agentId: string
  agentName: string
  imageUrl?: string
  description?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
}

// --- API Generic Response ---

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// --- Calendar UI helpers ---

export interface CalendarDay {
  date: Date
  isToday: boolean
  isCurrentMonth: boolean
  events: CalendarEventResponse[]
}

export interface WeekRange {
  from: Date
  to: Date
  label: string
}
