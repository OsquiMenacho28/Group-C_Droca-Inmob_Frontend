<template>
  <div class="h-screen flex items-center justify-center p-4 relative">
    <div class="absolute top-4 right-4">
      <theme-toggle />
    </div>

    <div
      v-if="errorMessage"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      {{ errorMessage }}
    </div>

    <login-form v-if="!showChangePassword" @submit="handleLogin" />

    <fwb-modal v-if="showChangePassword" @close="handleCancelChange">
      <template #header>
        <div class="text-lg font-bold">{{ t('auth.changePasswordTitle') }}</div>
      </template>
      <template #body>
        <form @submit.prevent="onPasswordSubmit" class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('auth.changePasswordInfo') }}
          </p>
          <fwb-input
            v-model="currentPassword"
            :label="t('auth.currentPassword')"
            type="password"
            :validation-status="errors.currentPassword ? 'error' : undefined"
            :validation-message="errors.currentPassword"
          />
          <fwb-input
            v-model="newPassword"
            :label="t('auth.newPassword')"
            type="password"
            :validation-status="errors.newPassword ? 'error' : undefined"
            :validation-message="errors.newPassword"
          />
          <fwb-input
            v-model="confirmPassword"
            :label="t('auth.confirmPassword')"
            type="password"
            :validation-status="errors.confirmPassword ? 'error' : undefined"
            :validation-message="errors.confirmPassword"
          />
          <div class="flex justify-end space-x-3 pt-4">
            <fwb-button color="alternative" @click="handleCancelChange">
              {{ t('auth.cancel') }}
            </fwb-button>
            <fwb-button type="submit" gradient="blue">{{ t('auth.changePassword') }}</fwb-button>
          </div>
        </form>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useForm } from 'vee-validate';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useAuthStore, type UserClaims, authService } from '@/modules/auth';
  import LoginForm from '@/components/auth/LoginForm.vue';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import { loginSchema, changePasswordSchema } from '@/modules/auth/schemas/authSchema';
  import { FwbModal, FwbInput, FwbButton } from 'flowbite-vue';
  import type { LoginFormValues } from '@/modules/auth/schemas/authSchema';
  import { useI18n } from 'vue-i18n';
  import { handleApiError } from '@/api/errorHandler';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const { login } = authStore;
  const { t } = useI18n();

  const showChangePassword = ref(false);
  const errorMessage = ref('');

  onMounted(() => {
    if (route.query.error === 'connection') {
      errorMessage.value = (route.query.msg as string) || t('common.connectionError');
      setTimeout(() => {
        errorMessage.value = '';
      }, 8000);
    }
  });

  const {
    defineField,
    handleSubmit: onChangePasswordSubmit,
    setValues: setChangePasswordValues,
    errors,
  } = useForm({
    validationSchema: toTypedSchema(changePasswordSchema),
  });

  const [currentPassword] = defineField('currentPassword');
  const [newPassword] = defineField('newPassword');
  const [confirmPassword] = defineField('confirmPassword');

  const handleLogin = async (payload: { email: string; password: string }) => {
    errorMessage.value = '';

    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      errorMessage.value = parsed.error.issues[0].message;
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
      return;
    }

    const values: LoginFormValues = parsed.data;

    try {
      await login({ email: values.email, password: values.password });

      if (localStorage.getItem('must_change_password') === 'true') {
        showChangePassword.value = true;
        setChangePasswordValues({
          currentPassword: values.password,
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        router.push({ name: 'Dashboard' });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const appError = handleApiError(error);

      if (appError.status === 401) {
        errorMessage.value = t('auth.invalidCredentials');
      } else {
        errorMessage.value = appError.message;
      }

      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  };

  const onPasswordSubmit = onChangePasswordSubmit(async (values) => {
    try {
      const u = authStore.user as UserClaims | null;
      const emailVal = u?.email;

      if (!emailVal) {
        console.error('No email found in token');
        alert(t('auth.emailError'));
        return;
      }

      console.log('Changing password for email:', emailVal);

      await authService.changePassword({
        email: emailVal,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      localStorage.removeItem('must_change_password');

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const response = await authService.refreshToken(refreshToken);
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      }

      showChangePassword.value = false;
      router.push({ name: 'Dashboard' });
    } catch (error: unknown) {
      console.error('Password change error:', error);
      const err = error as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || t('auth.changePasswordError'));
    }
  });

  const handleCancelChange = () => {
    showChangePassword.value = false;
    authService.logout();
    router.push({ name: 'Login' });
  };
</script>
