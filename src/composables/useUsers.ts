// FILE: Frontend/Frontend/src/composables/useUsers.ts

import { ref } from 'vue'
import { userService } from '../services/userService'
import { personService } from '../services/personService'

const users = ref<any[]>([])
const roles = ref<any[]>([])

export function useUsers() {
  const load = async () => {
    try {
      const baseUsers = await userService.getUsers()
      const enrichedUsers = await Promise.all(
        baseUsers.map(async (user: any) => {
          try {
            const profile = await personService.getPersonByAuthUserId(user.id)
            const { id: profileId, ...profileData } = profile
            return { ...user, ...profileData, profileInternalId: profileId }
          } catch {
            return user
          }
        })
      )
      users.value = enrichedUsers
      roles.value = await userService.getRoles()
    } catch (e) {
      console.error('Error cargando usuarios:', e)
    }
  }

  const create = async (payload: any) => {
    try {
      const newUser = await userService.createUser(payload)
      await load()
      return newUser
    } catch (error) {
      console.error('Error en creación:', error)
      throw error
    }
  }

  const update = async (id: string, payload: any) => {
    try {
      await userService.updateUser(id, payload)
      await load()
    } catch (error) {
      console.error('Error en actualización:', error)
      throw error
    }
  }

  const deactivate = async (id: string) => {
    try {
      await userService.deactivateUser(id)
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], status: 'INACTIVE' }
      }
    } catch (error) {
      console.error('Error desactivando usuario:', error)
      throw error
    }
  }

  const reactivate = async (id: string) => {
    try {
      await userService.reactivateUser(id)
      await load()
    } catch (error) {
      console.error('Error reactivando usuario:', error)
      throw error
    }
  }

  const resendPassword = async (email: string) => {
    try {
      await userService.resendTemporaryPassword(email)
    } catch (error) {
      console.error('Error reenviando contraseña:', error)
      throw error
    }
  }

  const remove = async (id: string) => {
    try {
      await userService.deleteUser(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (error) {
      console.error('Error eliminando:', error)
    }
  }

  return { users, roles, load, create, remove, deactivate, reactivate, resendPassword, update }
}