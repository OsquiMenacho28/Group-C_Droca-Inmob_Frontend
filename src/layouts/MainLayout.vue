<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <fwb-navbar
      class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <template #logo>
        <div class="flex items-center gap-2">
          <span
            class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
            >{{ t.nav.brand }}</span
          >
        </div>
      </template>
      <template #default>
        <fwb-navbar-collapse>
          <router-link
            v-if="isAdmin"
            to="/dashboard/admin/users"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'Users',
            }"
          >
            {{ t.nav.users }}
          </router-link>

          <router-link
            v-if="isAgent"
            to="/dashboard/agent"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'AgentDashboard',
            }"
          >
            {{ t.nav.myInmuebles }}
          </router-link>

          <router-link
            v-if="isOwner"
            to="/dashboard/owner"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'OwnerDashboard',
            }"
          >
            {{ t.nav.myProperties }}
          </router-link>

          <router-link
            v-if="isClient"
            to="/dashboard/client/favorites"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'ClientFavorites',
            }"
          >
            {{ t.nav.favorites }}
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/dashboard/admin/properties"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.path.includes('properties'),
            }"
          >
            Gestión Inmuebles
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/dashboard/admin/audit"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'AuditLogs',
            }"
          >
            Auditoría
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/dashboard/admin/properties/audit"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'PropertyAudit',
            }"
          >
            Auditoría Inmuebles
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/dashboard/admin/audit"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white"
          >
            Auditoría Usuarios
          </router-link>

          <router-link
            v-if="isAgent"
            to="/dashboard/agent/clients"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'AgentClients',
            }"
          >
            {{ t.nav.myClients }}
          </router-link>

          <router-link
            v-if="isAgent"
            to="/dashboard/agent/owners"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'AgentOwners',
            }"
          >
            Mis Propietarios
          </router-link>

          <router-link
            v-if="isAgent || isAdmin"
            to="/calendar"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'Calendar',
            }"
          >
            Calendario
            <VisitRequestNotificationBadge v-if="isAgent" />
          </router-link>

          <router-link
            v-if="isClient"
            to="/properties"
            class="block py-2 pr-4 pl-3 rounded md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
            :class="{
              'text-blue-700 dark:text-white font-bold':
                $route.name === 'Properties',
            }"
          >
            Propiedades disponibles
          </router-link>

          <router-link
            v-if="isAgent"
            to="/dashboard/operations"
            class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <IconLucideFileText class="w-5 h-5" />
            Operaciones
          </router-link>

          <router-link
            v-if="isAgent"
            to="/reassignments/inbox"
            class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <IconLucideArrowLeftRight class="w-5 h-5" />
            Solicitudes Recibidas
            <NotificationBadge />
          </router-link>

          <router-link
            v-if="isAgent"
            to="/reassignments/sent"
            class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            active-class="bg-blue-50 text-blue-700 font-medium"
          >
            <IconLucideClipboardList class="w-5 h-5" />
            Mis Solicitudes Enviadas
            <NotificationBadge />
          </router-link>
        </fwb-navbar-collapse>
      </template>
      <template #right-side>
        <div class="flex items-center md:order-2 space-x-3">
          <theme-toggle />
          <fwb-dropdown align-to-end>
            <template #trigger>
              <button
                type="button"
                class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span class="sr-only">{{ t.nav.openUserMenu }}</span>
                <div
                  class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase"
                >
                  {{ getUserInitial() }}
                </div>
              </button>
            </template>
            <fwb-list-group>
              <div class="px-4 py-3">
                <span
                  class="block text-sm text-gray-900 dark:text-white font-medium"
                >
                  {{ getUserDisplayName() }}
                </span>
                <span
                  class="block text-sm text-gray-500 truncate dark:text-gray-400"
                >
                  {{ getUserEmail() }}
                </span>
                <span
                  class="block text-xs text-gray-400 dark:text-gray-500 mt-1"
                >
                  {{ getUserTypeLabel() }}
                </span>
              </div>
              <a
                href="#"
                @mousedown.prevent="handleLogout"
                class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 dark:text-red-500 dark:hover:text-white cursor-pointer border-t border-gray-100 dark:border-gray-700"
              >
                {{ t.nav.logout }}
              </a>
            </fwb-list-group>
          </fwb-dropdown>
        </div>
      </template>
    </fwb-navbar>

    <main class="p-4 md:p-8 max-w-7xl mx-auto">
      <div
        class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-mono text-yellow-800"
      >
        <strong>DEBUG INFO:</strong><br />
        Token Roles: {{ user?.roles }} <br />
        Token UserType: {{ user?.userType }} <br />
        User Email: {{ getUserEmail() }} <br />
        isAdmin Computed: {{ isAdmin }}
      </div>

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  FwbNavbar,
  FwbNavbarCollapse,
  FwbDropdown,
  FwbListGroup,
} from 'flowbite-vue';
import NotificationBadge from '@/components/visits/reassignment/NotificationBadge.vue';
import VisitRequestNotificationBadge from '@/components/visits/requests/VisitRequestNotificationBadge.vue';
import { useAuth } from '@/composables/useAuth';
import { t } from '@/locales/i18n';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { computed } from 'vue';
import IconLucideFileText from '~icons/lucide/file-text';
import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';

const { user, logout } = useAuth();

const getUserEmail = () => {
  return user.value?.email || user.value?.sub || 'No email';
};

const getUserDisplayName = () => {
  if (user.value?.name) return user.value.name;
  if (user.value?.fullName) return user.value.fullName;
  const email = getUserEmail();
  if (email && email !== user.value?.sub) {
    return String(email).split('@')[0];
  }
  return 'User';
};

const getUserInitial = () => {
  const name = String(getUserDisplayName());
  return name.charAt(0).toUpperCase();
};

const getUserTypeLabel = () => {
  const userType = user.value?.userType;
  switch (userType) {
    case 'ADMIN':
      return 'Administrator';
    case 'EMPLOYEE':
      return 'Agent / Employee';
    case 'OWNER':
      return 'Property Owner';
    case 'INTERESTED_CLIENT':
      return 'Interested Client';
    default:
      return userType || 'User';
  }
};

const isAdmin = computed(() => {
  const roles = (user.value?.roles || []) as string[];
  return roles.includes('ADMIN') || user.value?.userType === 'ADMIN';
});

const isAgent = computed(() => {
  const roles = (user.value?.roles || []) as string[];
  return roles.includes('AGENT') || user.value?.userType === 'EMPLOYEE';
});

const isOwner = computed(() => {
  const roles = (user.value?.roles || []) as string[];
  return roles.includes('OWNER') || user.value?.userType === 'OWNER';
});

const isClient = computed(() => {
  const roles = (user.value?.roles || []) as string[];
  return (
    roles.includes('INTERESTED_CLIENT') ||
    user.value?.userType === 'INTERESTED_CLIENT'
  );
});

const handleLogout = async () => {
  try {
    await logout();
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    window.location.href = '/login';
  }
};
</script>
