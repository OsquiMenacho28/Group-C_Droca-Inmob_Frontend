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
          :validation-status="errors.email ? 'error' : undefined"
          :validation-message="errors.email"
        />
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
        />
        <p v-if="isFieldModified('birthDate')" class="text-xs text-blue-600 mt-1">✏️ Modificando fecha</p>
      </div>
    </div>

    <div>
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

    <div v-if="form.userType === 'EMPLOYEE'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Laboral</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <fwb-input
            v-model="form.department"
            label="Departamento"
            :class="{ 'border-blue-500 ring-2': isFieldModified('department') }"
          />
          <p v-if="isFieldModified('department')" class="text-xs text-blue-600">✏️ Modificando departamento</p>
        </div>
        <div>
          <fwb-input
            v-model="form.position"
            label="Cargo"
            :class="{ 'border-blue-500 ring-2': isFieldModified('position') }"
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

    <div v-if="form.userType === 'OWNER'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Información Fiscal</h3>
      <fwb-input
        v-model="form.taxId"
        label="RFC / NIT"
        :class="{ 'border-blue-500 ring-2': isFieldModified('taxId') }"
      />
      <p v-if="isFieldModified('taxId')" class="text-xs text-blue-600">✏️ Modificando NIT</p>
    </div>

    <div v-if="form.userType === 'INTERESTED_CLIENT'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">Preferencias</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Método de Contacto</label>
          <select
            v-model="form.preferredContactMethod"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Teléfono</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <fwb-input v-model="form.budget" type="number" label="Presupuesto ($)" />
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <fwb-button color="alternative" @click="$emit('cancel')">{{ t.users.form.cancel }}</fwb-button>
      <fwb-button type="submit" gradient="blue">
        {{ isEditing ? t.users.form.update : t.users.form.create }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { FwbInput, FwbButton } from 'flowbite-vue'
import { t } from '../../locales/i18n'
import type { UserFormPayload } from '../../types/user'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])
const errors = ref<Record<string, string>>({})
const modifiedFields = ref<Set<string>>(new Set())

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
    budget: d.budget || ''
  }
}

const initialValues = mapData(props.initialData)
const form = reactive<UserFormPayload>({ ...initialValues })
const originalValues = reactive<UserFormPayload>({ ...initialValues })

watch(
  () => props.initialData,
  (newData) => {
    if (!newData) return
    const mapped = mapData(newData)
    Object.assign(form, mapped)
    Object.assign(originalValues, mapped)
    modifiedFields.value.clear()
    errors.value = {}
  }
)

const isFieldModified = (field: string) => modifiedFields.value.has(field)

watch(
  form,
  () => {
    (Object.keys(form) as (keyof UserFormPayload)[]).forEach((k) => {
      if (String(form[k]) !== String(originalValues[k])) {
        modifiedFields.value.add(k)
        delete errors.value[k]
      } else {
        modifiedFields.value.delete(k)
      }
    })
  },
  { deep: true }
)

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}
  if (!form.firstName || form.firstName.trim().length < 2) newErrors.firstName = 'Mínimo 2 caracteres'
  if (!form.lastName || form.lastName.trim().length < 2) newErrors.lastName = 'Mínimo 2 caracteres'
  if (!form.email || !form.email.includes('@')) newErrors.email = 'Email inválido'
  if (!form.birthDate) newErrors.birthDate = 'Requerido'
  if (!form.phone) newErrors.phone = 'Teléfono requerido'
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const getRoleIdByUserType = (userType: string): string => {
  const roles: Record<string, string> = {
    'ADMIN': 'rol_admin',
    'EMPLOYEE': 'rol_agent',
    'OWNER': 'rol_owner',
    'INTERESTED_CLIENT': 'rol_interested_client'
  }
  return roles[userType] || 'rol_interested_client'
}

const submit = () => {
  if (!validateForm()) return

  let payload: any = {}

  if (props.isEditing) {
    // Modo edición: solo enviar campos modificados
    if (modifiedFields.value.has('firstName')) payload.firstName = form.firstName.trim()
    if (modifiedFields.value.has('lastName')) payload.lastName = form.lastName.trim()
    if (modifiedFields.value.has('userType')) {
      payload.userType = form.userType
      payload.roleIds = [getRoleIdByUserType(form.userType)]
    }
    if (modifiedFields.value.has('phone')) payload.phone = form.phone.trim()
    if (modifiedFields.value.has('birthDate')) payload.birthDate = form.birthDate
    if (modifiedFields.value.has('department')) payload.department = form.department?.trim()
    if (modifiedFields.value.has('position')) payload.position = form.position?.trim()
    if (modifiedFields.value.has('hireDate')) payload.hireDate = form.hireDate
    if (modifiedFields.value.has('taxId')) payload.taxId = form.taxId?.trim()
    if (modifiedFields.value.has('preferredContactMethod')) payload.preferredContactMethod = form.preferredContactMethod
    if (modifiedFields.value.has('budget')) payload.budget = form.budget
  } else {
    // Modo creación: enviar todos los datos
    payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      userType: form.userType,
      roleIds: [getRoleIdByUserType(form.userType)],
      birthDate: form.birthDate,
      phone: form.phone.trim(),
      sendTemporaryCredentials: true
    }

    // Añadir campos específicos según tipo de usuario
    if (form.userType === 'EMPLOYEE') {
      if (form.department) payload.department = form.department.trim()
      if (form.position) payload.position = form.position.trim()
      if (form.hireDate) payload.hireDate = form.hireDate
    } else if (form.userType === 'OWNER') {
      if (form.taxId) payload.taxId = form.taxId.trim()
    } else if (form.userType === 'INTERESTED_CLIENT') {
      if (form.preferredContactMethod) payload.preferredContactMethod = form.preferredContactMethod
      if (form.budget) payload.budget = form.budget
    }
  }

  emit('submit', payload)
}
</script>