<!-- FILE: Frontend/Frontend/src/components/users/UserForm.vue -->

<template>
  <form @submit.prevent="submit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <fwb-input
          v-model="form.firstName"
          :label="t.users.form.firstName"
          placeholder="Juan"
          required
          :validation-status="errors.firstName ? 'error' : undefined"
          :validation-message="errors.firstName"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('firstName') }"
          @blur="validateField('firstName')"
        />
        <p v-if="isFieldModified('firstName')" class="text-xs text-blue-600 mt-1">✏️ Modificando nombre</p>
      </div>

      <div>
        <fwb-input
          v-model="form.lastName"
          :label="t.users.form.lastName"
          placeholder="Pérez"
          required
          :validation-status="errors.lastName ? 'error' : undefined"
          :validation-message="errors.lastName"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('lastName') }"
          @blur="validateField('lastName')"
        />
        <p v-if="isFieldModified('lastName')" class="text-xs text-blue-600 mt-1">✏️ Modificando apellido</p>
      </div>

      <div>
        <fwb-input
          v-model="form.email"
          :label="t.users.form.email"
          type="email"
          placeholder="juan@gmail.com"
          :disabled="isEditing"
          required
          :validation-status="emailValidationStatus"
          :validation-message="emailErrorMessage"
          @input="onEmailInput"
          @blur="validateEmailOnBlur"
        />
        <p v-if="isFieldModified('email') && !isEditing" class="text-xs text-blue-600 mt-1">✏️ Modificando email</p>
        <p v-if="emailChecking" class="text-xs text-gray-500 mt-1">Verificando disponibilidad...</p>
      </div>

      <div>
        <fwb-input
          v-model="form.phone"
          :label="t.users.form.phone"
          placeholder="+591 ..."
          required
          :validation-status="errors.phone ? 'error' : undefined"
          :validation-message="errors.phone"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('phone') }"
          @blur="validateField('phone')"
        />
        <p v-if="isFieldModified('phone')" class="text-xs text-blue-600 mt-1">✏️ Modificando teléfono</p>
      </div>

      <div>
        <fwb-input
          v-model="form.birthDate"
          label="Fecha de Nacimiento"
          type="date"
          required
          :validation-status="errors.birthDate ? 'error' : undefined"
          :validation-message="errors.birthDate"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': isFieldModified('birthDate') }"
          @blur="validateField('birthDate')"
        />
        <p v-if="isFieldModified('birthDate')" class="text-xs text-blue-600 mt-1">✏️ Modificando fecha</p>
      </div>
    </div>

    <!-- Selector de tipo de usuario - Ocultar en modo clientOnly -->
    <div v-if="!clientOnly">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo de Usuario / Rol</label>
      <select
        v-model="form.userType"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        :disabled="isEditing"
        required
      >
        <option value="ADMIN">Administrador</option>
        <option value="EMPLOYEE">Empleado / Agente</option>
        <option value="OWNER">Propietario</option>
        <option value="INTERESTED_CLIENT">Cliente Interesado</option>
      </select>
    </div>

    <!-- Campos de empleado - Ocultar en modo clientOnly -->
    <div v-if="!clientOnly && form.userType === 'EMPLOYEE'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Laboral</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <fwb-input
            v-model="form.department"
            label="Departamento"
            required
            :validation-status="errors.department ? 'error' : undefined"
            :validation-message="errors.department"
            :class="{ 'border-blue-500 ring-2': isFieldModified('department') }"
            @blur="validateField('department')"
          />
          <p v-if="isFieldModified('department')" class="text-xs text-blue-600">✏️ Modificando departamento</p>
        </div>
        <div>
          <fwb-input
            v-model="form.position"
            label="Cargo"
            required
            :validation-status="errors.position ? 'error' : undefined"
            :validation-message="errors.position"
            :class="{ 'border-blue-500 ring-2': isFieldModified('position') }"
            @blur="validateField('position')"
          />
          <p v-if="isFieldModified('position')" class="text-xs text-blue-600">✏️ Modificando cargo</p>
        </div>
        <div>
          <fwb-input
            v-model="form.hireDate"
            type="date"
            label="Fecha Contratación"
            :class="{ 'border-blue-500 ring-2': isFieldModified('hireDate') }"
          />
          <p v-if="isFieldModified('hireDate')" class="text-xs text-blue-600">✏️ Modificando contratación</p>
        </div>
      </div>
    </div>

    <!-- Campos de propietario - Ocultar en modo clientOnly -->
    <div v-if="!clientOnly && form.userType === 'OWNER'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Fiscal</h3>
      <div>
        <fwb-input
          v-model="form.taxId"
          label="CI / NIT"
          placeholder="1234567"
          required
          :validation-status="errors.taxId ? 'error' : undefined"
          :validation-message="errors.taxId"
          :class="{ 'border-blue-500 ring-2': isFieldModified('taxId') }"
          @blur="validateField('taxId')"
        />
        <p v-if="isFieldModified('taxId')" class="text-xs text-blue-600">✏️ Modificando CI/NIT</p>
      </div>
    </div>

    <!-- Campos de cliente interesado - Siempre visibles en modo clientOnly -->
    <div v-if="(!clientOnly && form.userType === 'INTERESTED_CLIENT') || clientOnly"
        class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Preferencias del Cliente</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Método de Contacto
          </label>
          <select v-model="form.preferredContactMethod"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="EMAIL">Email</option>
            <option value="PHONE">Teléfono</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <fwb-input v-model="form.budget" type="number" label="Presupuesto ($)" />
        <fwb-input v-model="form.preferredZone" label="Zona Preferida"
                  placeholder="Ej: Zona Sur, Centro..." />
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Tipo de Inmueble
          </label>
          <select v-model="form.preferredPropertyType"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Sin preferencia</option>
            <option value="APARTAMENTO">Apartamento</option>
            <option value="CASA">Casa</option>
            <option value="COMERCIAL">Local Comercial</option>
          </select>
        </div>
        <fwb-input v-model.number="form.preferredRooms" type="number"
                  label="Número de Habitaciones" placeholder="Ej: 2" />
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <fwb-button color="alternative" @click="$emit('cancel')">{{ t.users.form.cancel }}</fwb-button>
      <fwb-button
        type="submit"
        gradient="blue"
        :disabled="!isFormValid || emailChecking"
      >
        {{ isEditing ? t.users.form.update : t.users.form.create }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import { t } from '../../locales/i18n'
import type { UserFormPayload } from '../../types/user'
import { userService } from '../../services/userService'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
  clientOnly?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])
const errors = ref<Record<string, string>>({})
const modifiedFields = ref<Set<string>>(new Set())

// Estados específicos para email
const emailFormatError = ref('')
const emailDuplicateError = ref('')
const emailChecking = ref(false)
let emailDebounceTimer: ReturnType<typeof setTimeout>
let lastValidatedEmail = ''

const toDateString = (val: any): string => {
  if (!val) return ''
  return String(val).split('T')[0]
}

const mapData = (d: any): UserFormPayload => {
  if (!d) {
    return {
      firstName: '', lastName: '', email: '', phone: '', userType: 'EMPLOYEE', birthDate: '',
      department: '', position: '', hireDate: '', taxId: '',
      preferredContactMethod: '', budget: ''
    }
  }

  return {
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    email: d.email || '',
    phone: d.phone || '',
    userType: d.userType || 'EMPLOYEE',
    birthDate: toDateString(d.birthDate),
    department: d.department || '',
    position: d.position || '',
    hireDate: toDateString(d.hireDate),
    taxId: d.taxId || '',
    preferredContactMethod: d.preferredContactMethod || '',
    budget: d.budget || '',
    preferredZone: d.preferredZone || '',
    preferredPropertyType: d.preferredPropertyType || '',
    preferredRooms: d.preferredRooms || ''
  }
}

const initialValues = mapData(props.initialData)
const form = reactive<UserFormPayload>({ ...initialValues })
const originalValues = reactive<UserFormPayload>({ ...initialValues })

// Validación de formato de email
const validateEmailFormat = (email: string): boolean => {
  if (!email) {
    emailFormatError.value = 'Email requerido'
    return false
  }

  if (!email.includes('@')) {
    emailFormatError.value = 'Email inválido: debe contener @'
    return false
  }

  emailFormatError.value = ''
  return true
}

// Validación de unicidad de email
const validateEmailUniqueness = async (email: string, skipIfSameAsOriginal: boolean = true): Promise<boolean> => {
  // Si es modo cliente, el backend se encarga de la unicidad
  if (props.clientOnly) {
    emailDuplicateError.value = ''
    return true
  }
  
  const trimmedEmail = email?.trim().toLowerCase()

  if (!trimmedEmail) {
    emailDuplicateError.value = ''
    return true
  }

  if (skipIfSameAsOriginal && props.isEditing && props.initialData?.email?.toLowerCase() === trimmedEmail) {
    emailDuplicateError.value = ''
    return true
  }

  emailChecking.value = true

  try {
    const users = await userService.getUsers()
    const emailExists = users.some((user: any) =>
      user.email?.toLowerCase() === trimmedEmail &&
      (!props.isEditing || user.id !== props.initialData?.id)
    )

    if (emailExists) {
      emailDuplicateError.value = 'Este correo electrónico ya está registrado. Por favor, use otro email.'
      return false
    }

    emailDuplicateError.value = ''
    return true
  } catch (error) {
    console.error('Error verificando email:', error)
    emailDuplicateError.value = ''
    return true
  } finally {
    emailChecking.value = false
  }
}

// Validación completa de email
const validateEmail = async (email: string, skipUniquenessCheck: boolean = false): Promise<boolean> => {
  const isFormatValid = validateEmailFormat(email)
  if (!isFormatValid) return false

  if (props.clientOnly) return true

  if (!skipUniquenessCheck) {
    const isUnique = await validateEmailUniqueness(email, true)
    return isUnique
  }
  return true
}

// Manejar input de email con debounce
const onEmailInput = () => {
  const email = form.email
  validateEmailFormat(email)
  emailDuplicateError.value = ''

  clearTimeout(emailDebounceTimer)
  emailDebounceTimer = setTimeout(async () => {
    if (email && email !== lastValidatedEmail) {
      lastValidatedEmail = email
      await validateEmailUniqueness(email, true)
    }
  }, 800)
}

// Validar email al perder foco
const validateEmailOnBlur = async () => {
  if (form.email) {
    await validateEmail(form.email, false)
  }
}

// Validación de campos de empleado
const validateEmployeeFields = () => {
  if (!props.clientOnly && form.userType === 'EMPLOYEE') {
    if (!form.department || form.department.trim().length < 2) {
      errors.value.department = 'Departamento requerido (mínimo 2 caracteres)'
      return false
    } else {
      delete errors.value.department
    }

    if (!form.position || form.position.trim().length < 2) {
      errors.value.position = 'Cargo requerido (mínimo 2 caracteres)'
      return false
    } else {
      delete errors.value.position
    }

    if (form.hireDate) {
      const hireDate = new Date(form.hireDate)
      const today = new Date()
      if (hireDate > today) {
        errors.value.hireDate = 'La fecha de contratación no puede ser futura'
        return false
      } else {
        delete errors.value.hireDate
      }
    }
  }
  return true
}

// Validación robusta para todos los campos
const validateField = (field: keyof UserFormPayload) => {
  const value = form[field]

  switch (field) {
    case 'firstName':
      if (!value || String(value).trim().length < 2) {
        errors.value.firstName = 'Mínimo 2 caracteres'
      } else {
        delete errors.value.firstName
      }
      break

    case 'lastName':
      if (!value || String(value).trim().length < 2) {
        errors.value.lastName = 'Mínimo 2 caracteres'
      } else {
        delete errors.value.lastName
      }
      break

    case 'phone':
      if (!value || String(value).trim().length === 0) {
        errors.value.phone = 'Teléfono requerido'
      } else {
        delete errors.value.phone
      }
      break

    case 'birthDate':
      if (!value) {
        errors.value.birthDate = 'Fecha de nacimiento requerida'
      } else {
        delete errors.value.birthDate
      }
      break

    case 'department':
      if (!props.clientOnly && form.userType === 'EMPLOYEE') {
        if (!value || String(value).trim().length < 2) {
          errors.value.department = 'Departamento requerido (mínimo 2 caracteres)'
        } else {
          delete errors.value.department
        }
      }
      break

    case 'position':
      if (!props.clientOnly && form.userType === 'EMPLOYEE') {
        if (!value || String(value).trim().length < 2) {
          errors.value.position = 'Cargo requerido (mínimo 2 caracteres)'
        } else {
          delete errors.value.position
        }
      }
      break

    case 'hireDate':
      if (!props.clientOnly && form.userType === 'EMPLOYEE' && value) {
        const hireDate = new Date(value)
        const today = new Date()
        if (hireDate > today) {
          errors.value.hireDate = 'La fecha de contratación no puede ser futura'
        } else {
          delete errors.value.hireDate
        }
      }
      break

    case 'taxId':
      if (!props.clientOnly && form.userType === 'OWNER') {
        if (!value || String(value).trim().length < 7) {
          errors.value.taxId = 'CI/NIT debe tener al menos 7 dígitos'
        } else if (!/^\d{7,10}$/.test(String(value).trim())) {
          errors.value.taxId = 'CI/NIT debe contener solo números (7-10 dígitos)'
        } else {
          delete errors.value.taxId
        }
      } else {
        delete errors.value.taxId
      }
      break

    case 'preferredRooms':
      if (value !== null && value !== '' && value !== undefined) {
        const rooms = Number(value)
        if (isNaN(rooms) || rooms < 0) {
          errors.value.preferredRooms = 'Número de habitaciones inválido'
        } else {
          delete errors.value.preferredRooms
        }
      }
      break
  }
}

// Validar todos los campos requeridos antes de enviar
const validateAllRequiredFields = (): boolean => {
  let isValid = true

  if (!form.firstName || form.firstName.trim().length < 2) {
    errors.value.firstName = 'Mínimo 2 caracteres'
    isValid = false
  }

  if (!form.lastName || form.lastName.trim().length < 2) {
    errors.value.lastName = 'Mínimo 2 caracteres'
    isValid = false
  }

  if (!form.phone || form.phone.trim().length === 0) {
    errors.value.phone = 'Teléfono requerido'
    isValid = false
  }

  if (!form.birthDate) {
    errors.value.birthDate = 'Fecha de nacimiento requerida'
    isValid = false
  }

  if (!props.clientOnly && form.userType === 'EMPLOYEE') {
    if (!form.department || form.department.trim().length < 2) {
      errors.value.department = 'Departamento requerido (mínimo 2 caracteres)'
      isValid = false
    }

    if (!form.position || form.position.trim().length < 2) {
      errors.value.position = 'Cargo requerido (mínimo 2 caracteres)'
      isValid = false
    }

    if (form.hireDate) {
      const hireDate = new Date(form.hireDate)
      const today = new Date()
      if (hireDate > today) {
        errors.value.hireDate = 'La fecha de contratación no puede ser futura'
        isValid = false
      }
    }
  }

  if (!props.clientOnly && form.userType === 'OWNER') {
    if (!form.taxId || form.taxId.trim().length < 7) {
      errors.value.taxId = 'CI/NIT debe tener al menos 7 dígitos'
      isValid = false
    } else if (!/^\d{7,10}$/.test(form.taxId.trim())) {
      errors.value.taxId = 'CI/NIT debe contener solo números (7-10 dígitos)'
      isValid = false
    }
  }

  return isValid
}

watch(
  () => props.initialData,
  (newData) => {
    if (!newData) return
    const mapped = mapData(newData)
    Object.assign(form, mapped)
    Object.assign(originalValues, mapped)
    modifiedFields.value.clear()
    errors.value = {}
    emailFormatError.value = ''
    emailDuplicateError.value = ''
    lastValidatedEmail = mapped.email || ''
  }
)

const isFieldModified = (field: string) => modifiedFields.value.has(field)

watch(
  form,
  () => {
    (Object.keys(form) as (keyof UserFormPayload)[]).forEach((k) => {
      if (String(form[k]) !== String(originalValues[k])) {
        modifiedFields.value.add(k)
      } else {
        modifiedFields.value.delete(k)
      }
    })
  },
  { deep: true }
)

const emailValidationStatus = computed(() => {
  if (emailFormatError.value) return 'error'
  if (emailDuplicateError.value) return 'error'
  return undefined
})

const emailErrorMessage = computed(() => {
  if (emailFormatError.value) return emailFormatError.value
  if (emailDuplicateError.value) return emailDuplicateError.value
  return ''
})

const isFormValid = computed(() => {
  const hasFirstName = form.firstName?.trim() && form.firstName.trim().length >= 2
  const hasLastName = form.lastName?.trim() && form.lastName.trim().length >= 2
  const hasPhone = form.phone?.trim()
  const hasBirthDate = form.birthDate

  const isEmailValid = !emailFormatError.value && !emailDuplicateError.value && form.email?.includes('@')

  let isEmployeeValid = true
  let isOwnerValid = true

  if (!props.clientOnly) {
    if (form.userType === 'EMPLOYEE') {
      isEmployeeValid = Boolean(!errors.value.department &&
                        !errors.value.position &&
                        !errors.value.hireDate &&
                        form.department?.trim() &&
                        form.department.trim().length >= 2 &&
                        form.position?.trim() &&
                        form.position.trim().length >= 2)
    }

    if (form.userType === 'OWNER') {
      isOwnerValid = Boolean(!errors.value.taxId &&
                     form.taxId?.trim() &&
                     form.taxId.trim().length >= 7 &&
                     /^\d{7,10}$/.test(form.taxId.trim()))
    }
  }

  if (props.isEditing) {
    const baseFieldsValid = hasFirstName && hasLastName && hasPhone && hasBirthDate
    return baseFieldsValid && isEmailValid && isEmployeeValid && isOwnerValid && !emailChecking.value
  }

  return hasFirstName && hasLastName && hasPhone && hasBirthDate &&
         isEmailValid && isEmployeeValid && isOwnerValid && !emailChecking.value
})

const getRoleIdByUserType = (userType: string): string => {
  const roles: Record<string, string> = {
    'ADMIN': 'rol_admin',
    'EMPLOYEE': 'rol_agent',
    'OWNER': 'rol_owner',
    'INTERESTED_CLIENT': 'rol_interested_client'
  }
  return roles[userType] || 'rol_interested_client'
}

// Validación final antes de enviar
const submit = async () => {
  const isEmailValid = await validateEmail(form.email, false)
  if (!isEmailValid) return

  const allFieldsValid = validateAllRequiredFields()
  if (!allFieldsValid) return

  const isEmployeeValid = validateEmployeeFields()
  if (!isEmployeeValid) return

  if (emailFormatError.value || emailDuplicateError.value) return

  let payload: any = {}

  if (props.isEditing) {
    if (modifiedFields.value.has('firstName')) {
      if (!form.firstName?.trim() || form.firstName.trim().length < 2) {
        errors.value.firstName = 'Mínimo 2 caracteres'
        return
      }
      payload.firstName = form.firstName.trim()
    }

    if (modifiedFields.value.has('lastName')) {
      if (!form.lastName?.trim() || form.lastName.trim().length < 2) {
        errors.value.lastName = 'Mínimo 2 caracteres'
        return
      }
      payload.lastName = form.lastName.trim()
    }

    if (!props.clientOnly && modifiedFields.value.has('userType')) {
      payload.userType = form.userType
      payload.roleIds = [getRoleIdByUserType(form.userType)]
    }

    if (modifiedFields.value.has('phone')) {
      if (!form.phone?.trim()) {
        errors.value.phone = 'Teléfono requerido'
        return
      }
      payload.phone = form.phone.trim()
    }

    if (modifiedFields.value.has('birthDate')) {
      if (!form.birthDate) {
        errors.value.birthDate = 'Fecha de nacimiento requerida'
        return
      }
      payload.birthDate = form.birthDate
    }

    if (!props.clientOnly && modifiedFields.value.has('department')) {
      if (form.userType === 'EMPLOYEE') {
        if (!form.department?.trim() || form.department.trim().length < 2) {
          errors.value.department = 'Departamento requerido (mínimo 2 caracteres)'
          return
        }
      }
      payload.department = form.department?.trim()
    }

    if (!props.clientOnly && modifiedFields.value.has('position')) {
      if (form.userType === 'EMPLOYEE') {
        if (!form.position?.trim() || form.position.trim().length < 2) {
          errors.value.position = 'Cargo requerido (mínimo 2 caracteres)'
          return
        }
      }
      payload.position = form.position?.trim()
    }

    if (!props.clientOnly && modifiedFields.value.has('hireDate')) {
      if (form.userType === 'EMPLOYEE' && form.hireDate) {
        const hireDate = new Date(form.hireDate)
        const today = new Date()
        if (hireDate > today) {
          errors.value.hireDate = 'La fecha de contratación no puede ser futura'
          return
        }
      }
      payload.hireDate = form.hireDate
    }

    if (!props.clientOnly && modifiedFields.value.has('taxId')) {
      if (form.userType === 'OWNER') {
        if (!form.taxId?.trim() || form.taxId.trim().length < 7) {
          errors.value.taxId = 'CI/NIT debe tener al menos 7 dígitos'
          return
        }
        if (!/^\d{7,10}$/.test(form.taxId.trim())) {
          errors.value.taxId = 'CI/NIT debe contener solo números (7-10 dígitos)'
          return
        }
      }
      payload.taxId = form.taxId?.trim()
    }

    // Preferencias de cliente interesado
    if (modifiedFields.value.has('preferredContactMethod'))
      payload.preferredContactMethod = form.preferredContactMethod
    if (modifiedFields.value.has('budget'))
      payload.budget = form.budget
    if (modifiedFields.value.has('preferredZone'))
      payload.preferredZone = form.preferredZone
    if (modifiedFields.value.has('preferredPropertyType'))
      payload.preferredPropertyType = form.preferredPropertyType
    if (modifiedFields.value.has('preferredRooms'))
      payload.preferredRooms = form.preferredRooms ? Number(form.preferredRooms) : null

  } else {
    // Crear nuevo usuario
    payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      userType: props.clientOnly ? 'INTERESTED_CLIENT' : form.userType,
      roleIds: [getRoleIdByUserType(props.clientOnly ? 'INTERESTED_CLIENT' : form.userType)],
      birthDate: form.birthDate,
      phone: form.phone.trim(),
      sendTemporaryCredentials: true
    }

    if (props.clientOnly) {
      // Modo agente creando cliente
      if (form.preferredContactMethod) payload.preferredContactMethod = form.preferredContactMethod
      if (form.budget)                  payload.budget = form.budget
      if (form.preferredZone)           payload.preferredZone = form.preferredZone
      if (form.preferredPropertyType)   payload.preferredPropertyType = form.preferredPropertyType
      if (form.preferredRooms)          payload.preferredRooms = Number(form.preferredRooms)
    } else {
      if (form.userType === 'EMPLOYEE') {
        payload.department = form.department?.trim()
        payload.position   = form.position?.trim()
        if (form.hireDate) payload.hireDate = form.hireDate
      } else if (form.userType === 'OWNER') {
        payload.taxId = form.taxId?.trim()
      } else if (form.userType === 'INTERESTED_CLIENT') {
        if (form.preferredContactMethod) payload.preferredContactMethod = form.preferredContactMethod
        if (form.budget)                 payload.budget = form.budget
        if (form.preferredZone)          payload.preferredZone = form.preferredZone
        if (form.preferredPropertyType)  payload.preferredPropertyType = form.preferredPropertyType
        if (form.preferredRooms)         payload.preferredRooms = Number(form.preferredRooms)
      }
    }
  }

  emit('submit', payload)
}
</script>