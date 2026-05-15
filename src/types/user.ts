export type UserType = 'ADMIN' | 'EMPLOYEE' | 'OWNER' | 'INTERESTED_CLIENT';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: UserType;
  status: string;
  primaryRoleIds: string[];
  birthDate?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  taxId?: string;
  preferredContactMethod?: string;
  budget?: string;
  assignedAgentId?: string;
  preferredZones?: string[]; // Cambiado de string a string[]
  minRooms?: number;
  maxRooms?: number;
  maxPrice?: number;
  preferredPropertyType?: string;
};

export type UserFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  birthDate: string;
  department?: string;
  position?: string;
  hireDate?: string;
  taxId?: string;
  preferredContactMethod?: string;
  preferredZones?: string[]; // Plural y Array
  minRooms?: number | null;
  maxRooms?: number | null;
  maxPrice?: number | null;
  preferredPropertyType?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
