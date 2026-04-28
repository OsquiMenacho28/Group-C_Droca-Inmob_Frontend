<template>
  <form @submit="onFormSubmit" @submit.prevent class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <fwb-input
          v-model="firstName"
          :label="t('users.form.firstName')"
          :placeholder="t('users.form.fullNamePlaceholder')"
          required
          :validation-status="errors.firstName ? 'error' : undefined"
          :validation-message="errors.firstName"
          :class="{
            'border-blue-500 ring-2 ring-blue-200': isFieldModified('firstName'),
          }"
          @blur="handleFirstNameBlur"
        />
        <p v-if="isFieldModified('firstName')" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingName') }}
        </p>
      </div>

      <div>
        <fwb-input
          v-model="lastName"
          :label="t('users.form.lastName')"
          :placeholder="t('users.form.fullNamePlaceholder')"
          required
          :validation-status="errors.lastName ? 'error' : undefined"
          :validation-message="errors.lastName"
          :class="{
            'border-blue-500 ring-2 ring-blue-200': isFieldModified('lastName'),
          }"
          @blur="handleLastNameBlur"
        />
        <p v-if="isFieldModified('lastName')" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingLastName') }}
        </p>
      </div>

      <div>
        <fwb-input
          v-model="email"
          :label="t('users.form.email')"
          type="email"
          :placeholder="t('users.form.emailPlaceholder')"
          :disabled="isEditing"
          required
          :validation-status="emailValidationStatus"
          :validation-message="emailErrorMessage"
          @input="handleEmailInput"
          @blur="handleEmailBlur"
        />
        <p v-if="isFieldModified('email') && !isEditing" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingEmail') }}
        </p>
        <p v-if="emailChecking" class="text-xs text-gray-500 mt-1">
          {{ t('userForm.checkingAvailability') }}
        </p>
      </div>

      <div>
        <fwb-input
          v-model="phone"
          :label="t('users.form.phone')"
          :placeholder="t('users.form.phonePlaceholder')"
          required
          :validation-status="errors.phone ? 'error' : undefined"
          :validation-message="errors.phone"
          :class="{
            'border-blue-500 ring-2 ring-blue-200': isFieldModified('phone'),
          }"
          @blur="handlePhoneBlur"
        />
        <p v-if="isFieldModified('phone')" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingPhone') }}
        </p>
      </div>

      <div>
        <fwb-input
          v-model="birthDate"
          :label="t('users.form.birthDate')"
          type="date"
          required
          :validation-status="errors.birthDate ? 'error' : undefined"
          :validation-message="errors.birthDate"
          :class="{
            'border-blue-500 ring-2 ring-blue-200': isFieldModified('birthDate'),
          }"
          @blur="handleBirthDateBlur"
        />
        <p v-if="isFieldModified('birthDate')" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingName') }}
        </p>
      </div>

      <div v-if="isAdmin && userType === 'INTERESTED_CLIENT'">
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {{ t('userForm.assignedAgent') }}
        </label>
        <select
          v-model="assignedAgentId"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option :value="null">{{ t('adminProperties.notAssigned') }}</option>
          <option v-for="agent in activeAgents" :key="agent.id" :value="agent.id">
            {{ agent.fullName }}
          </option>
        </select>
        <p v-if="isFieldModified('assignedAgentId')" class="text-xs text-blue-600 mt-1">
          {{ t('userForm.modifyingRole') }}
        </p>
      </div>
    </div>

    <div v-if="!clientOnly && !ownerOnly">
      <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ t('users.form.role') }}
      </label>
      <select
        v-model="userType"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        :disabled="isEditing"
        required
      >
        <option v-for="option in availableUserTypes" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-if="!clientOnly && userType === 'EMPLOYEE'" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold">{{ t('userForm.workInfo') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <fwb-input
            v-model="department"
            :label="t('users.form.department')"
            required
            :validation-status="errors.department ? 'error' : undefined"
            :validation-message="errors.department"
            :class="{ 'border-blue-500 ring-2': isFieldModified('department') }"
            @blur="handleDepartmentBlur"
          />
          <p v-if="isFieldModified('department')" class="text-xs text-blue-600">
            {{ t('userForm.modifyingName') }}
          </p>
        </div>
        <div>
          <fwb-input
            v-model="position"
            :label="t('users.form.position')"
            required
            :validation-status="errors.position ? 'error' : undefined"
            :validation-message="errors.position"
            :class="{ 'border-blue-500 ring-2': isFieldModified('position') }"
            @blur="handlePositionBlur"
          />
          <p v-if="isFieldModified('position')" class="text-xs text-blue-600">
            {{ t('userForm.modifyingName') }}
          </p>
        </div>
        <div>
          <fwb-input
            v-model="hireDate"
            type="date"
            :label="t('users.form.hireDate')"
            :class="{ 'border-blue-500 ring-2': isFieldModified('hireDate') }"
          />
          <p v-if="isFieldModified('hireDate')" class="text-xs text-blue-600">
            {{ t('userForm.modifyingName') }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="ownerOnly || (!clientOnly && userType === 'OWNER')" class="space-y-4 border-t pt-4">
      <h3 class="text-md font-semibold dark:text-white">{{ t('userForm.fiscalInfo') }}</h3>
      <div>
        <fwb-input
          v-model="taxId"
          :label="t('users.table.ciNit')"
          :placeholder="t('users.table.ciNit')"
          required
          :validation-status="errors.taxId ? 'error' : undefined"
          :validation-message="errors.taxId"
          :class="{ 'border-blue-500 ring-2': isFieldModified('taxId') }"
          @blur="handleTaxIdBlur"
        />
        <p v-if="isFieldModified('taxId')" class="text-xs text-blue-600">
          {{ t('userForm.modifyingName') }}
        </p>
        <p class="text-[10px] text-gray-400 mt-1">
          {{ t('userForm.fiscalHelp') }}
        </p>
      </div>
    </div>

    <div
      v-if="(!clientOnly && userType === 'INTERESTED_CLIENT') || clientOnly"
      class="space-y-4 border-t pt-4"
    >
      <h3 class="text-md font-semibold">{{ t('userForm.clientPrefs') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ t('users.form.contactMethod') }}
          </label>
          <select
            v-model="preferredContactMethod"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="EMAIL">{{ t('userForm.email') }}</option>
            <option value="PHONE">{{ t('userForm.phone') }}</option>
            <option value="WHATSAPP">{{ t('userForm.whatsApp') }}</option>
          </select>
        </div>
        <fwb-input v-model="budget" type="number" :label="t('users.view.budget')" />
        <fwb-input
          v-model="preferredZone"
          :label="t('users.view.preferredZone')"
          :placeholder="t('users.view.preferredZone')"
        />
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ t('users.form.propertyType') }}
          </label>
          <select
            v-model="preferredPropertyType"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">{{ t('userForm.noPreference') }}</option>
            <option value="APARTMENT">{{ t('propertyType.apartment') }}</option>
            <option value="HOUSE">{{ t('propertyType.house') }}</option>
            <option value="COMMERCIAL">{{ t('propertyType.commercialSpace') }}</option>
          </select>
        </div>
        <fwb-input
          v-model="preferredRooms"
          type="number"
          :label="t('users.view.rooms')"
          :placeholder="t('users.view.rooms')"
        />
      </div>
    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t">
      <fwb-button color="alternative" @click="$emit('cancel')">
        {{ t('users.form.cancel') }}
      </fwb-button>
      <fwb-button type="submit" gradient="blue" :disabled="!isFormValid || emailChecking">
        {{ isEditing ? t('users.form.update') : t('users.form.create') }}
      </fwb-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { FwbInput, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';

  import type { UserFormPayload, User } from '@/types/user';
  import { userSchema } from '@/modules/auth/schemas/userSchema';
  import type { UserFormValues } from '@/modules/auth/schemas/userSchema';
  import { useEmailValidation } from '@/composables/useEmailValidation';
  import { useAuthStore, type UserClaims } from '@/modules/auth';

  const { t } = useI18n();

  const props = defineProps<{
    initialData?: Record<string, unknown>;
    isEditing?: boolean;
    clientOnly?: boolean;
    ownerOnly?: boolean;
  }>();

  const emit = defineEmits(['submit', 'cancel']);
  const modifiedFields = ref<Set<string>>(new Set());
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.user as UserClaims | null);
  const isAdmin = computed(() => (currentUser.value?.roles as string[])?.includes('ADMIN'));

  const allUsers = ref<User[]>([]);
  const activeAgents = computed(() =>
    allUsers.value.filter(
      (u) => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE'
    )
  );

  const {
    emailFormatError,
    emailDuplicateError,
    emailChecking,
    validateEmailFormat,
    validateEmailUniqueness,
    onEmailInput,
  } = useEmailValidation();

  const { defineField, handleSubmit, values, setValues, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(userSchema),
    initialValues: mapInitialData(),
  });

  onMounted(async () => {
    if (isAdmin.value) {
      try {
        const { userService } = await import('@/services/userService');
        const res = await userService.getUsers(0, 1000);
        allUsers.value = res.data || [];
      } catch (e) {
        console.error('Failed to load agents for UserForm:', e);
      }
    }
  });

  const [firstName, firstNameAttrs] = defineField('firstName');
  const [lastName, lastNameAttrs] = defineField('lastName');
  const [email] = defineField('email');
  const [phone, phoneAttrs] = defineField('phone');
  const [birthDate, birthDateAttrs] = defineField('birthDate');
  const [userType] = defineField('userType');
  const [department, departmentAttrs] = defineField('department');
  const [position, positionAttrs] = defineField('position');
  const [hireDate] = defineField('hireDate');
  const [taxId, taxIdAttrs] = defineField('taxId');
  const [preferredContactMethod] = defineField('preferredContactMethod');
  const [budget] = defineField('budget');
  const [preferredZone] = defineField('preferredZone');
  const [preferredPropertyType] = defineField('preferredPropertyType');
  const [preferredRoomsRaw] = defineField('preferredRooms');
  const [assignedAgentId] = defineField('assignedAgentId');

  const preferredRooms = computed({
    get: () => {
      const val = preferredRoomsRaw.value;
      if (val === null || val === undefined) return '';
      return String(val);
    },
    set: (val: string | number) => {
      if (val === '' || val === null || val === undefined) {
        preferredRoomsRaw.value = '';
      } else {
        preferredRoomsRaw.value = typeof val === 'string' ? val : val;
      }
    },
  });

  function mapInitialData(): UserFormValues {
    const d = props.initialData;
    if (!d) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        userType: props.ownerOnly ? 'OWNER' : props.clientOnly ? 'INTERESTED_CLIENT' : 'EMPLOYEE',
        birthDate: '',
        department: '',
        position: '',
        hireDate: '',
        taxId: '',
        preferredContactMethod: undefined,
        budget: '',
      };
    }

    const toDateString = (val: unknown): string => {
      if (!val) return '';
      return String(val).split('T')[0];
    };

    return {
      firstName: String(d.firstName || ''),
      lastName: String(d.lastName || ''),
      email: String(d.email || ''),
      phone: String(d.phone || ''),
      userType: String(
        d.userType ||
          d.personType ||
          (props.ownerOnly ? 'OWNER' : props.clientOnly ? 'INTERESTED_CLIENT' : 'EMPLOYEE')
      ) as UserFormValues['userType'],
      birthDate: toDateString(d.birthDate),
      department: String(d.department || ''),
      position: String(d.position || ''),
      hireDate: toDateString(d.hireDate),
      taxId: String(d.taxId || d.nit || ''),
      preferredContactMethod:
        (d.preferredContactMethod as 'EMAIL' | 'PHONE' | 'WHATSAPP' | undefined) || undefined,
      budget: String(d.budget || ''),
      preferredZone: String(d.preferredZone || ''),
      preferredPropertyType: String(d.preferredPropertyType || ''),
      preferredRooms: (d.preferredRooms as number | string) || '',
      assignedAgentId: String(d.assignedAgentId || ''),
    };
  }

  const originalValues = ref<UserFormValues>(mapInitialData());

  watch(
    () => props.ownerOnly,
    (val) => {
      if (val) {
        userType.value = 'OWNER';
      }
    },
    { immediate: true }
  );

  watch(
    () => props.clientOnly,
    (val) => {
      if (val) {
        userType.value = 'INTERESTED_CLIENT';
      }
    },
    { immediate: true }
  );

  const handleFirstNameBlur = () => firstNameAttrs.value.onBlur?.();
  const handleLastNameBlur = () => lastNameAttrs.value.onBlur?.();
  const handlePhoneBlur = () => phoneAttrs.value.onBlur?.();
  const handleBirthDateBlur = () => birthDateAttrs.value.onBlur?.();
  const handleDepartmentBlur = () => departmentAttrs.value.onBlur?.();
  const handlePositionBlur = () => positionAttrs.value.onBlur?.();
  const handleTaxIdBlur = () => taxIdAttrs.value.onBlur?.();

  const handleEmailInput = () => {
    const emailValue = email.value || '';
    validateEmailFormat(emailValue);
    emailDuplicateError.value = '';

    onEmailInput(emailValue);
  };

  const handleEmailBlur = async () => {
    const emailValue = email.value || '';
    if (emailValue) {
      const originalEmail = String(props.initialData?.email || '').toLowerCase();
      await validateEmailUniqueness(emailValue, undefined, originalEmail);
    }
  };

  watch(
    () => props.initialData,
    (newData) => {
      if (!newData) return;

      const toDateString = (val: unknown): string => {
        if (!val) return '';
        return String(val).split('T')[0];
      };

      const resolvedUserType = String(
        newData.userType ||
          newData.personType ||
          (props.ownerOnly ? 'OWNER' : props.clientOnly ? 'INTERESTED_CLIENT' : 'EMPLOYEE')
      ) as UserFormValues['userType'];

      const mapped: UserFormValues = {
        firstName: String(newData.firstName || ''),
        lastName: String(newData.lastName || ''),
        email: String(newData.email || ''),
        phone: String(newData.phone || ''),
        userType: resolvedUserType,
        birthDate: toDateString(newData.birthDate),
        department: String(newData.department || ''),
        position: String(newData.position || ''),
        hireDate: toDateString(newData.hireDate),
        taxId: String(newData.taxId || (newData.nit as string) || ''),
        preferredContactMethod:
          (newData.preferredContactMethod as 'EMAIL' | 'PHONE' | 'WHATSAPP' | undefined) ||
          undefined,
        budget: String(newData.budget || ''),
        preferredZone: String(newData.preferredZone || ''),
        preferredPropertyType: String(newData.preferredPropertyType || ''),
        preferredRooms: (newData.preferredRooms as number | string) || '',
      };

      setValues(mapped);
      originalValues.value = { ...mapped };
      modifiedFields.value.clear();
      resetForm({ values: mapped });
      emailFormatError.value = '';
      emailDuplicateError.value = '';
    },
    { deep: true, immediate: true }
  );

  const isFieldModified = (field: string) => modifiedFields.value.has(field);

  watch(
    values,
    (currentValues) => {
      const original = originalValues.value;

      (Object.keys(currentValues) as (keyof UserFormPayload)[]).forEach((k) => {
        const key = k as keyof UserFormPayload;
        if (String(currentValues[key]) !== String(original[key])) {
          modifiedFields.value.add(key);
        } else {
          modifiedFields.value.delete(key);
        }
      });
    },
    { deep: true }
  );

  const emailValidationStatus = computed(() => {
    if (emailFormatError.value) return 'error';
    if (emailDuplicateError.value) return 'error';
    return undefined;
  });

  const emailErrorMessage = computed(() => {
    if (emailFormatError.value) return emailFormatError.value;
    if (emailDuplicateError.value) return emailDuplicateError.value;
    return '';
  });

  const isFormValid = computed(() => {
    const hasFirstName = values.firstName?.trim() && values.firstName.trim().length >= 2;
    const hasLastName = values.lastName?.trim() && values.lastName.trim().length >= 2;
    const hasPhone = values.phone?.trim();
    const hasBirthDate = values.birthDate;

    const isEmailValid =
      !emailFormatError.value && !emailDuplicateError.value && values.email?.includes('@');

    let isEmployeeValid = true;
    let isOwnerValid = true;

    if (!props.clientOnly) {
      if (values.userType === 'EMPLOYEE') {
        isEmployeeValid = Boolean(
          values.department?.trim() &&
          values.department.trim().length >= 2 &&
          values.position?.trim() &&
          values.position.trim().length >= 2
        );
      }

      if (values.userType === 'OWNER') {
        isOwnerValid = Boolean(
          values.taxId?.trim() &&
          values.taxId.trim().length >= 7 &&
          /^\d{7,10}$/.test(values.taxId.trim())
        );
      }
    }

    return (
      hasFirstName &&
      hasLastName &&
      hasPhone &&
      hasBirthDate &&
      isEmailValid &&
      isEmployeeValid &&
      isOwnerValid &&
      !emailChecking.value
    );
  });

  const getRoleIdByUserType = (userTypeVal: string): string => {
    const roles: Record<string, string> = {
      ADMIN: 'rol_admin',
      EMPLOYEE: 'rol_agent',
      OWNER: 'rol_owner',
      INTERESTED_CLIENT: 'rol_interested_client',
    };
    return roles[userTypeVal] || 'rol_interested_client';
  };

  const availableUserTypes = computed(() => {
    const u = currentUser.value;
    const roles = (u?.roles as string[]) || [];
    const isAgent = roles.includes('AGENT') && !roles.includes('ADMIN');

    if (isAgent) {
      return [
        { value: 'OWNER', label: t('users.roles.owner') },
        { value: 'INTERESTED_CLIENT', label: t('users.roles.client') },
      ];
    }

    return [
      { value: 'ADMIN', label: t('users.roles.admin') },
      { value: 'EMPLOYEE', label: t('users.roles.agent') },
      { value: 'OWNER', label: t('users.roles.owner') },
      { value: 'INTERESTED_CLIENT', label: t('users.roles.client') },
    ];
  });

  const onFormSubmit = (event: Event) => {
    event.preventDefault();

    try {
      handleSubmit((formValues, _formActions) => {
        onSubmit(formValues);
      })(event);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const onSubmit = async (formValues: UserFormValues) => {
    const originalEmail = String(props.initialData?.email || '').toLowerCase();
    const isEmailUnique = await validateEmailUniqueness(
      formValues.email || '',
      undefined,
      originalEmail
    );

    if (!isEmailUnique || emailFormatError.value || emailDuplicateError.value) {
      return;
    }

    let payload: Record<string, unknown> = {};

    if (props.isEditing) {
      if (modifiedFields.value.has('firstName')) {
        if (!formValues.firstName?.trim() || formValues.firstName.trim().length < 2) {
          return;
        }
        payload.firstName = formValues.firstName.trim();
      }

      if (modifiedFields.value.has('lastName')) {
        if (!formValues.lastName?.trim() || formValues.lastName.trim().length < 2) {
          return;
        }
        payload.lastName = formValues.lastName.trim();
      }

      if (!props.clientOnly && modifiedFields.value.has('userType')) {
        const ut = formValues.userType || 'INTERESTED_CLIENT';
        payload.userType = ut;
        payload.roleIds = [getRoleIdByUserType(ut)];
      }

      if (modifiedFields.value.has('phone')) {
        if (!formValues.phone?.trim()) {
          return;
        }
        payload.phone = formValues.phone.trim();
      }

      if (modifiedFields.value.has('birthDate')) {
        if (!formValues.birthDate) {
          return;
        }
        payload.birthDate = formValues.birthDate;
      }

      if (!props.clientOnly && modifiedFields.value.has('department')) {
        if (formValues.userType === 'EMPLOYEE') {
          if (!formValues.department?.trim() || formValues.department.trim().length < 2) {
            return;
          }
        }
        payload.department = formValues.department?.trim();
      }

      if (!props.clientOnly && modifiedFields.value.has('position')) {
        if (formValues.userType === 'EMPLOYEE') {
          if (!formValues.position?.trim() || formValues.position.trim().length < 2) {
            return;
          }
        }
        payload.position = formValues.position?.trim();
      }

      if (!props.clientOnly && modifiedFields.value.has('hireDate')) {
        if (formValues.userType === 'EMPLOYEE' && formValues.hireDate) {
          const hireDate = new Date(formValues.hireDate);
          const today = new Date();
          if (hireDate > today) {
            return;
          }
        }
        payload.hireDate = formValues.hireDate;
      }

      if (modifiedFields.value.has('taxId')) {
        if (formValues.userType === 'OWNER') {
          if (!formValues.taxId?.trim() || formValues.taxId.trim().length < 7) {
            return;
          }
          if (!/^\d{7,10}$/.test(formValues.taxId.trim())) {
            return;
          }
        }
        payload.taxId = formValues.taxId?.trim();
      }

      if (modifiedFields.value.has('assignedAgentId')) {
        payload.assignedAgentId = formValues.assignedAgentId || null;
      }

      if (modifiedFields.value.has('preferredContactMethod'))
        payload.preferredContactMethod = formValues.preferredContactMethod;
      if (modifiedFields.value.has('budget')) payload.budget = formValues.budget;
      if (modifiedFields.value.has('preferredZone'))
        payload.preferredZone = formValues.preferredZone;
      if (modifiedFields.value.has('preferredPropertyType'))
        payload.preferredPropertyType = formValues.preferredPropertyType;
      if (modifiedFields.value.has('preferredRooms'))
        payload.preferredRooms = formValues.preferredRooms
          ? Number(formValues.preferredRooms)
          : null;
    } else {
      const resolvedUserType = props.ownerOnly
        ? 'OWNER'
        : props.clientOnly
          ? 'INTERESTED_CLIENT'
          : formValues.userType || 'INTERESTED_CLIENT';

      payload = {
        firstName: (formValues.firstName || '').trim(),
        lastName: (formValues.lastName || '').trim(),
        email: (formValues.email || '').trim().toLowerCase(),
        userType: resolvedUserType,
        roleIds: [getRoleIdByUserType(resolvedUserType)],
        birthDate: formValues.birthDate,
        phone: (formValues.phone || '').trim(),
        sendTemporaryCredentials: true,
      };

      if (props.clientOnly) {
        if (formValues.preferredContactMethod)
          payload.preferredContactMethod = formValues.preferredContactMethod;
        if (formValues.budget) payload.budget = formValues.budget;
        if (formValues.preferredZone) payload.preferredZone = formValues.preferredZone;
        if (formValues.preferredPropertyType)
          payload.preferredPropertyType = formValues.preferredPropertyType;
        if (formValues.preferredRooms) payload.preferredRooms = Number(formValues.preferredRooms);
      } else {
        if (formValues.userType === 'EMPLOYEE') {
          payload.department = formValues.department?.trim();
          payload.position = formValues.position?.trim();
          if (formValues.hireDate) payload.hireDate = formValues.hireDate;
        } else if (formValues.userType === 'OWNER') {
          payload.taxId = formValues.taxId?.trim();
        } else if (formValues.userType === 'INTERESTED_CLIENT') {
          if (formValues.preferredContactMethod)
            payload.preferredContactMethod = formValues.preferredContactMethod;
          if (formValues.budget) payload.budget = formValues.budget;
          if (formValues.preferredZone) payload.preferredZone = formValues.preferredZone;
          if (formValues.preferredPropertyType)
            payload.preferredPropertyType = formValues.preferredPropertyType;
          if (formValues.preferredRooms) payload.preferredRooms = Number(formValues.preferredRooms);
        }
      }
    }

    if (props.ownerOnly) {
      payload.userType = 'OWNER';
      payload.roleIds = ['rol_owner'];
    }

    if (props.isEditing && Object.keys(payload).length === 0) {
    }

    emit('submit', payload);
  };
</script>
