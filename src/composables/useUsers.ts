import { ref } from 'vue';
import { userService } from '@/services/userService';
import { personService } from '@/services/personService';
import type { User } from '@/types/user';

interface EnrichedUser extends User {
  profileInternalId?: string;
  [key: string]: unknown;
}

interface Role {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function useUsers() {
  const users = ref<EnrichedUser[]>([]);
  const roles = ref<Role[]>([]);
  const loading = ref(false);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalUsers = ref(0);
  const statusFilter = ref<string | undefined>(undefined);

  const load = async (query?: string) => {
    loading.value = true;
    try {
      const response = await userService.getUsers(
        currentPage.value,
        pageSize.value,
        statusFilter.value === 'ALL' ? undefined : statusFilter.value,
        query
      );
      // response is ApiResponse<User[]>
      users.value = (response.data || []) as EnrichedUser[];
      const meta = response.meta;

      totalUsers.value = meta?.total || 0;
      totalPages.value = Math.ceil(totalUsers.value / pageSize.value);

      const rolesRes = await userService.getRoles();
      roles.value = rolesRes.data || [];
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchUserProfile = async (authUserId: string): Promise<Record<string, unknown> | null> => {
    try {
      const profile = await personService.getPersonByAuthUserId(authUserId);
      return profile;
    } catch (error) {
      console.error(`Error loading profile for ${authUserId}:`, error);
      return null;
    }
  };

  const create = async (payload: Record<string, unknown>) => {
    try {
      const newUser = await userService.createUser(payload);
      await load();
      return newUser;
    } catch (error) {
      console.error('Error en creación:', error);
      throw error;
    }
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    try {
      await userService.updateUser(id, payload);

      // Sincronizar preferencias si es un cliente buscador
      const hasPrefs =
        payload.preferredZones ||
        payload.minRooms !== undefined ||
        payload.maxRooms !== undefined ||
        payload.budget ||
        payload.preferredPropertyType;

      if (hasPrefs) {
        const profile = await personService.getPersonByAuthUserId(id);
        if (profile?.id && profile.personType === 'INTERESTED_CLIENT') {
          const prefsPayload = {
            preferredZones: payload.preferredZones || profile.preferredZones || [],
            minRooms: payload.minRooms !== undefined ? payload.minRooms : profile.minRooms,
            maxRooms: payload.maxRooms !== undefined ? payload.maxRooms : profile.maxRooms,
            maxPrice: Number(payload.budget || profile.budget || 0),
            preferredPropertyType:
              payload.preferredPropertyType || profile.preferredPropertyType,
          };
          await personService.savePreferences(profile.id as string, prefsPayload);
        }
      }

      await load();
    } catch (error) {
      console.error('Error en actualización:', error);
      throw error;
    }
  };

  const deactivate = async (id: string) => {
    try {
      await userService.deactivateUser(id);
      const idx = users.value.findIndex((u) => u.id === id);
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], status: 'INACTIVE' };
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  const reactivate = async (id: string) => {
    try {
      await userService.reactivateUser(id);
      await load();
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  };

  const resendPassword = async (email: string) => {
    try {
      await userService.resendTemporaryPassword(email);
    } catch (error) {
      console.error('Error reenviando contraseña:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await userService.deleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
    } catch (error) {
      console.error('Error deleting:', error);
      throw error;
    }
  };

  return {
    users,
    roles,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    statusFilter,
    load,
    create,
    remove,
    deactivate,
    reactivate,
    resendPassword,
    update,
    fetchUserProfile,
  };
}
