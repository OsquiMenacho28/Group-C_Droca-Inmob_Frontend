<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <fwb-navbar
      class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <template #logo>
        <div class="flex items-center gap-2">
          <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {{ t('nav.brand') }}
          </span>
        </div>
      </template>
      <template #default>
        <fwb-navbar-collapse>
          <!-- Admin Links -->
          <template v-if="isAdmin">
            <NavLink
              to="/dashboard/admin/users"
              :label="t('nav.users')"
              :icon="IconLucideUsers"
              exact
            />
            <NavLink
              to="/dashboard/admin/properties"
              :label="t('nav.inventoryManagement')"
              :icon="IconLucideBuilding2"
              matchPath="properties"
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
            <NavLink to="/dashboard/owner" :label="t('nav.myProperties')" :icon="IconLucideHome" />
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

          <!-- Shared/Common Links -->
          <NavLink
            v-if="isAdmin || isAgent"
            to="/calendar"
            :label="t('nav.calendar')"
            :icon="IconLucideCalendar"
          >
            <template #suffix><VisitRequestNotificationBadge v-if="isAgent" /></template>
          </NavLink>

          <NavLink
            to="/dashboard/operations"
            :label="t('nav.operations')"
            :icon="IconLucideFileText"
          />
        </fwb-navbar-collapse>
      </template>
      <template #right-side>
        <div class="flex items-center md:order-2 space-x-3">
          <LanguageSwitcher />
          <theme-toggle />
          <fwb-dropdown align-to-end>
            <template #trigger>
              <button
                type="button"
                class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <span class="sr-only">{{ t('nav.openUserMenu') }}</span>
                <div
                  class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase"
                >
                  {{ getUserInitial() }}
                </div>
              </button>
            </template>
            <fwb-list-group>
              <div class="px-4 py-3">
                <span class="block text-sm text-gray-900 dark:text-white font-medium">
                  {{ getUserDisplayName() }}
                </span>
                <span class="block text-sm text-gray-500 truncate dark:text-gray-400">
                  {{ getUserEmail() }}
                </span>
                <span class="block text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ getUserTypeLabel() }}
                </span>
              </div>
              <a
                href="#"
                @click.prevent="handleLogout"
                class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 dark:text-red-500 dark:hover:text-white cursor-pointer border-t border-gray-100 dark:border-gray-700"
              >
                {{ t('nav.logout') }}
              </a>
            </fwb-list-group>
          </fwb-dropdown>
        </div>
      </template>
    </fwb-navbar>

    <main class="p-4 md:p-8 max-w-7xl mx-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { FwbNavbar, FwbNavbarCollapse, FwbDropdown, FwbListGroup } from 'flowbite-vue';
  import NotificationBadge from '@/components/visits/reassignment/NotificationBadge.vue';
  import VisitRequestNotificationBadge from '@/components/visits/requests/VisitRequestNotificationBadge.vue';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { useI18n } from 'vue-i18n';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';
  import NavLink from '@/components/ui/NavLink.vue';
  import { computed } from 'vue';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideTrophy from '~icons/lucide/trophy';
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

  const authStore = useAuthStore();
  const { t } = useI18n();

  const getUserEmail = () => {
    const u = authStore.user as UserClaims | null;
    return u?.email || u?.sub || t('common.noEmail');
  };

  const getUserDisplayName = () => {
    const u = authStore.user as UserClaims | null;
    if (u?.name) return u.name;
    if (u?.fullName) return u.fullName;
    const email = getUserEmail();
    if (email && email !== u?.sub) {
      return String(email).split('@')[0];
    }
    return t('common.user');
  };

  const getUserInitial = () => {
    const name = String(getUserDisplayName());
    return name.charAt(0).toUpperCase();
  };

  const getUserTypeLabel = () => {
    const u = authStore.user as UserClaims | null;
    const userType = u?.userType;
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
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles || []) as string[];
    return roles.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  const isAgent = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles || []) as string[];
    return roles.includes('AGENT') || u?.userType === 'EMPLOYEE';
  });

  const isOwner = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles || []) as string[];
    return roles.includes('OWNER') || u?.userType === 'OWNER';
  });

  const isClient = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles || []) as string[];
    return roles.includes('INTERESTED_CLIENT') || u?.userType === 'INTERESTED_CLIENT';
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
