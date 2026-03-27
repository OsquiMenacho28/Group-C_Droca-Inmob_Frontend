<template>
  <div class="h-screen flex items-center justify-center p-4 relative">
    <div class="absolute top-4 right-4">
      <theme-toggle />
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
      {{ errorMessage }}
    </div>

    <!-- Normal Login Form -->
    <login-form v-if="!showChangePassword" @submit="handleLogin"/>

    <!-- Password Change Modal for First Login -->
    <fwb-modal v-if="showChangePassword" @close="handleCancelChange">
      <template #header>
        <div class="text-lg font-bold">Change Temporary Password</div>
      </template>
      <template #body>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            You're using a temporary password. Please create a new password to continue.
          </p>
          <fwb-input
            v-model="changePasswordForm.currentPassword"
            label="Current Password"
            type="password"
            required
          />
          <fwb-input
            v-model="changePasswordForm.newPassword"
            label="New Password"
            type="password"
            required
          />
          <fwb-input
            v-model="changePasswordForm.confirmPassword"
            label="Confirm New Password"
            type="password"
            required
            :validation-status="passwordMismatch ? 'error' : undefined"
            :validation-message="passwordMismatch ? 'Passwords do not match' : ''"
          />
          <div class="flex justify-end space-x-3 pt-4">
            <fwb-button color="alternative" @click="handleCancelChange">Cancel</fwb-button>
            <fwb-button type="submit" gradient="blue">Change Password</fwb-button>
          </div>
        </form>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { authService } from '../services/authService'
import LoginForm from '../components/auth/LoginForm.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { FwbModal, FwbInput, FwbButton } from 'flowbite-vue'

const router = useRouter()
const { login, user } = useAuth()

const showChangePassword = ref(false)
const errorMessage = ref('')
const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordMismatch = computed(() => {
  return changePasswordForm.value.newPassword &&
         changePasswordForm.value.confirmPassword &&
         changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword
})

const handleLogin = async (payload: any) => {
  errorMessage.value = ''
  try {
    await login(payload)

    // Check if user needs to change password
    if (localStorage.getItem('must_change_password') === 'true') {
      showChangePassword.value = true
      changePasswordForm.value.currentPassword = payload.password
    } else {
      router.push({ name: 'Dashboard' })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Mostrar mensaje de error amigable
    if (error.response?.status === 401) {
      errorMessage.value = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
    } else if (error.response?.data?.detail) {
      errorMessage.value = error.response.data.detail
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error al iniciar sesión'
    }
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
}

const handleChangePassword = async () => {
  if (passwordMismatch.value) {
    return
  }

  try {
    // Get email from the JWT token's email claim
    const email = user.value?.email

    if (!email) {
      console.error('No email found in token')
      alert('Unable to retrieve email. Please log in again.')
      return
    }

    console.log('Changing password for email:', email)

    await authService.changePassword({
      email: email,
      currentPassword: changePasswordForm.value.currentPassword,
      newPassword: changePasswordForm.value.newPassword
    })

    // Clear the must_change_password flag
    localStorage.removeItem('must_change_password')

    // Refresh token to get new one without mustChangePassword flag
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const response = await authService.refreshToken(refreshToken)
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
    }

    showChangePassword.value = false
    router.push({ name: 'Dashboard' })
  } catch (error: any) {
    console.error('Password change error:', error)
    alert(error.response?.data?.detail || 'Failed to change password')
  }
}

const handleCancelChange = () => {
  showChangePassword.value = false
  authService.logout()
  router.push({ name: 'Login' })
}
</script>