// FILE: Frontend/Frontend/src/types/user.ts

export type UserType = 'ADMIN' | 'EMPLOYEE' | 'OWNER' | 'INTERESTED_CLIENT'

export type User = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  userType: UserType
  status: string
  primaryRoleIds: string[]
  birthDate?: string
  // Campos específicos
  department?: string
  position?: string
  hireDate?: string
  taxId?: string
  preferredContactMethod?: string
  budget?: string
}

export type UserFormPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  userType: UserType
  birthDate: string
  // Campos específicos
  department?: string
  position?: string
  hireDate?: string
  taxId?: string
  preferredContactMethod?: string
  budget?: string
}

export type LoginPayload = {
  email: string
  password: string
}