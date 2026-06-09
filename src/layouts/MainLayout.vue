<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100">
    <!-- Mobile Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        @click="closeSidebar"
        class="fixed inset-0 bg-gray-950/40 z-40 md:hidden"
      ></div>
    </Transition>

    <!-- Sidebar Component (Desktop & Mobile) -->
    <aside
      class="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/80 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0"
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700/80">
        <router-link to="/dashboard" class="flex items-center gap-2.5 font-bold text-lg text-blue-600 dark:text-blue-400">
          <IconLucideBuilding class="w-6 h-6 animate-pulse" />
          <span class="tracking-tight">{{ t('nav.brand') }}</span>
        </router-link>
        
        <button
          @click="closeSidebar"
          class="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden transition-colors"
          aria-label="Cerrar menú"
        >
          <IconLucideX class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <ul class="space-y-1.5">
          <!-- Admin Links -->
          <template v-if="isAdmin">
            <NavLink
              to="/dashboard/admin/users"
              :label="t('nav.users')"
              :icon="IconLucideUsers"
              exact
            />
            <NavLink
              to="/dashboard/admin/availability"
              :label="t('nav.agentAvailability', 'Disponibilidad')"
              :icon="IconLucideCalendar"
            />
            <NavLink
              to="/dashboard/admin/properties"
              :label="t('nav.inventoryManagement')"
              :icon="IconLucideBuilding2"
              matchPath="properties"
            />
            <NavLink
              to="/dashboard/admin/inventory-report"
              :label="'Reporte Inventario'"
              :icon="IconLucideBarChart"
            />
            <NavLink
              to="/dashboard/admin/vehicles"
              :label="t('nav.vehicles')"
              :icon="IconLucideCar"
            />
            <NavLink
              to="/dashboard/admin/audit"
              :label="t('nav.audit')"
              :icon="IconLucideShieldCheck"
            />
            <NavLink
              to="/dashboard/reports/agent-ranking"
              :label="t('nav.agentRanking')"
              :icon="IconLucideTrophy"
            />
            <NavLink
              to="/dashboard/reports/property-visits"
              :label="t('nav.propertyVisits')"
              :icon="IconLucideBarChart2"
            />
          </template>

          <!-- Agent Links -->
          <template v-if="isAgent">
            <NavLink
              to="/dashboard/agent"
              :label="t('nav.myInmuebles')"
              :icon="IconLucideLayoutDashboard"
            />
            <NavLink
              to="/dashboard/agent/clients"
              :label="t('nav.myClients')"
              :icon="IconLucideUsers"
            />
            <NavLink
              to="/dashboard/agent/owners"
              :label="t('nav.myOwners')"
              :icon="IconLucideUserCircle"
            />
            <NavLink
              to="/reassignments/inbox"
              :label="t('nav.receivedRequests')"
              :icon="IconLucideArrowLeftRight"
            >
              <template #suffix><NotificationBadge /></template>
            </NavLink>
            <NavLink
              to="/reassignments/sent"
              :label="t('nav.sentRequests')"
              :icon="IconLucideClipboardList"
            >
              <template #suffix><NotificationBadge /></template>
            </NavLink>
          </template>

          <!-- Owner Links -->
          <template v-if="isOwner">
            <NavLink
              to="/dashboard/owner"
              :label="t('nav.myProperties')"
              :icon="IconLucideHome"
            />
          </template>

          <!-- Client Links -->
          <template v-if="isClient">
            <NavLink
              to="/properties"
              :label="t('nav.availableProperties')"
              :icon="IconLucideBuilding"
            />
            <NavLink
              to="/dashboard/client/favorites"
              :label="t('nav.favorites')"
              :icon="IconLucideHeart"
            />
          </template>

          <!-- Divider -->
          <li class="h-px bg-gray-100 dark:bg-gray-700/60 my-4 mx-2"></li>

          <!-- Shared/Common Links -->
          <NavLink
            v-if="isAdmin || isAgent"
            to="/calendar"
            :label="t('nav.calendar')"
            :icon="IconLucideCalendar"
          >
            <template #suffix>
              <VisitRequestNotificationBadge v-if="isAgent" />
            </template>
          </NavLink>

          <NavLink
            to="/dashboard/operations"
            :label="t('nav.operations')"
            :icon="IconLucideFileText"
          />
        </ul>
      </nav>

      <!-- User Profile Footer Section -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700/80 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/40">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-700 flex-shrink-0 flex items-center justify-center text-white font-bold uppercase shadow-sm">
            {{ getUserInitial() }}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {{ getUserDisplayName() }}
            </h4>
            <p class="text-[10px] text-gray-500 truncate dark:text-gray-400">
              {{ getUserEmail() }}
            </p>
            <span class="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 font-medium rounded bg-blue-100/60 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {{ getUserTypeLabel() }}
            </span>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 flex-shrink-0 cursor-pointer"
          :title="t('nav.logout')"
        >
          <IconLucideLogOut class="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>

    <!-- Main Workspace Container -->
    <div class="flex-1 flex flex-col min-w-0 md:pl-64">
      <!-- Top header -->
      <header class="h-16 sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700/80 flex items-center justify-between px-4 md:px-8">
        <!-- Left Side: Mobile Hamburger & Section Label -->
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 md:hidden transition-colors"
            aria-label="Abrir menú"
          >
            <IconLucideMenu class="w-5 h-5" />
          </button>
          
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:block">
            Panel de Control
          </h2>
        </div>

        <!-- Right Side: Utilities -->
        <div class="flex items-center gap-3">
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';
import NavLink from '@/components/ui/NavLink.vue';
import NotificationBell from '@/components/notifications/NotificationBell.vue';
import NotificationBadge from '@/components/visits/reassignment/NotificationBadge.vue';
import VisitRequestNotificationBadge from '@/components/visits/requests/VisitRequestNotificationBadge.vue';

// Lucide Icons
import IconLucideFileText from '~icons/lucide/file-text';
import IconLucideTrophy from '~icons/lucide/trophy';
import IconLucideBarChart2 from '~icons/lucide/bar-chart-2';
import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucideUsers from '~icons/lucide/users';
import IconLucideBuilding2 from '~icons/lucide/building-2';
import IconLucideShieldCheck from '~icons/lucide/shield-check';
import IconLucideLayoutDashboard from '~icons/lucide/layout-dashboard';
import IconLucideUserCircle from '~icons/lucide/user-circle';
import IconLucideHome from '~icons/lucide/home';
import IconLucideBuilding from '~icons/lucide/building';
import IconLucideHeart from '~icons/lucide/heart';
import IconLucideCalendar from '~icons/lucide/calendar';
import IconLucideCar from '~icons/lucide/car';
import IconLucideBarChart from '~icons/lucide/bar-chart';
import IconLucideMenu from '~icons/lucide/menu';
import IconLucideX from '~icons/lucide/x';
import IconLucideLogOut from '~icons/lucide/log-out';

const { t } = useI18n();
const authStore = useAuthStore();
const user = computed(() => authStore.user as UserClaims | null);

const isSidebarOpen = ref(false);
const route = useRoute();

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// Cierra el sidebar al navegar (útil en móviles)
watch(() => route.path, () => {
  closeSidebar();
});

// Funciones auxiliares
const getUserEmail = () =>
  user.value?.email || user.value?.sub || t('common.noEmail');
const getUserDisplayName = () => {
  if (user.value?.name) return user.value.name;
  if (user.value?.fullName) return user.value.fullName;
  const email = getUserEmail();
  return email !== user.value?.sub ? email.split('@')[0] : t('common.user');
};
const getUserInitial = () => getUserDisplayName().charAt(0).toUpperCase();
const getUserTypeLabel = () => {
  const userType = user.value?.userType;
  switch (userType) {
    case 'ADMIN':
      return t('roleTypes.admin');
    case 'EMPLOYEE':
      return t('roleTypes.agent');
    case 'OWNER':
      return t('roleTypes.owner');
    case 'INTERESTED_CLIENT':
      return t('roleTypes.client');
    default:
      return userType || t('roleTypes.user');
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
    await authStore.logout();
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    window.location.href = '/login';
  }
};
</script>
