export type EventType = 'VISIT' | 'CLIENT_REQUEST';
export type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface CalendarEventResponse {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress?: string;
  agentId: string;
  agentName: string;
  startTime: string;
  endTime: string;
  type: EventType;
  status: EventStatus;
  notes?: string;
  createdAt: string;
  clientId?: string;
  clientName?: string;
  ownEvent: boolean;
}

export interface CalendarResponse {
  events: CalendarEventResponse[];
  from: string;
  to: string;
  totalEvents: number;
  myEvents: number;
}

export interface ConflictResponse {
  hasConflict: boolean;
  message: string;
  conflictingEvents: CalendarEventResponse[];
  suggestedStartTime?: string;
  suggestedEndTime?: string;
}

export interface CreateVisitRequest {
  propertyId: string;
  propertyName: string;
  propertyAddress?: string;
  agentId: string;
  agentName: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface ClientVisitRequestDTO {
  propertyId: string;
  propertyName: string;
  agentId: string;
  agentName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  preferredDateTime: string;
  alternativeDateTime?: string;
  message?: string;
}

export interface VisitRequestResponse {
  id: string;
  propertyId: string;
  propertyName: string;
  agentId: string;
  agentName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  preferredDateTime: string;
  alternativeDateTime?: string;
  message?: string;
  status: RequestStatus;
  calendarEventId?: string;
  createdAt: string;
  notificationSent: boolean;
}

export interface Property {
  id: string;
  title: string;
  name: string;
  address: string;
  zone: string;
  price: number;
  type: string;
  m2: number;
  rooms: number;
  status:
    | 'Disponible'
    | 'Reservado'
    | 'Vendido'
    | 'En Negociación'
    | 'DISPONIBLE'
    | 'RESERVADO'
    | 'VENDIDO'
    | 'EN_NEGOCIACION';
  agentId: string;
  agentName: string;
  assignedAgentId: string | null;
  imageUrl?: string;
  imageUrls: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEventResponse[];
}

export interface WeekRange {
  from: Date;
  to: Date;
  label: string;
}
