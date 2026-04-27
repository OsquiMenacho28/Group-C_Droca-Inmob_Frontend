import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth';
import MainLayout from '@/layouts/MainLayout.vue';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import UsersView from '@/views/UsersView.vue';
import AdminProperties from '@/views/AdminProperties.vue';
import AgentDashboard from '@/views/AgentDashboard.vue';
import AgentClients from '@/views/AgentClients.vue';
import AgentOwners from '@/views/AgentOwners.vue';
import CalendarView from '@/views/CalendarView.vue';
import ScheduleVisitView from '@/views/ScheduleVisitView.vue';
import PropertiesClientView from '@/views/PropertiesClientView.vue';
import OwnerDashboard from '@/views/OwnerDashboard.vue';
import ClientDashboard from '@/views/ClientDashboard.vue';
import ReassignmentInboxView from '@/views/ReassignmentInboxView.vue';
import OperationDetailView from '@/views/OperationDetailView.vue';
import SentRequestsView from '@/views/SentRequestsView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: 'admin/users',
        name: 'Users',
        component: UsersView,
        meta: { role: 'ADMIN' },
      },
      {
        path: 'admin/properties',
        name: 'AdminProperties',
        component: AdminProperties,
        meta: { role: 'ADMIN' },
      },
      {
        path: 'agent',
        name: 'AgentDashboard',
        component: AgentDashboard,
        meta: { role: 'AGENT' },
      },
      {
        path: 'agent/clients',
        name: 'AgentClients',
        component: AgentClients,
        meta: { role: 'AGENT' },
      },
      {
        path: 'agent/owners',
        name: 'AgentOwners',
        component: AgentOwners,
        meta: { role: 'AGENT' },
      },
      {
        path: '/reassignments/inbox',
        name: 'ReassignmentInbox',
        component: ReassignmentInboxView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/calendar',
        name: 'Calendar',
        component: CalendarView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/schedule-visit',
        name: 'ScheduleVisit',
        component: ScheduleVisitView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/properties',
        name: 'Properties',
        component: PropertiesClientView,
        meta: { role: 'CLIENT' },
      },
      {
        path: 'owner',
        name: 'OwnerDashboard',
        component: OwnerDashboard,
        meta: { role: 'OWNER' },
      },
      {
        path: 'client/favorites',
        name: 'ClientFavorites',
        component: () => import('@/views/ClientFavorites.vue'),
        meta: { role: 'CLIENT' },
      },
      {
        path: 'client',
        name: 'ClientDashboard',
        component: ClientDashboard,
        meta: { role: 'CLIENT' },
      },
      {
        path: 'admin/audit',
        name: 'Audit',
        component: () => import('@/views/AuditView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN' },
      },
      {
        path: 'operations',
        name: 'Operations',
        component: () => import('@/views/OperationsView.vue'),
        meta: { roles: ['ADMIN', 'AGENT', 'OWNER', 'CLIENT'] },
      },
      {
        path: 'operations/:id',
        name: 'OperationDetail',
        component: OperationDetailView,
        meta: { roles: ['ADMIN', 'AGENT', 'OWNER', 'CLIENT'] },
      },
      {
        path: 'reports/agent-ranking',
        name: 'AgentRanking',
        component: () => import('@/views/AgentRankingView.vue'),
        meta: { role: 'ADMIN' },
      },
      {
        path: '/reassignments/sent',
        name: 'SentRequests',
        component: SentRequestsView,
        meta: { role: 'AGENT' },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated && to.name !== 'Login') {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else if (to.meta.role || to.meta.roles) {
    const roles = (authStore.user?.roles as string[]) || [];
    const userType = authStore.user?.userType;

    // Helper to check if user has a specific logical role
    const hasRequiredRole = (targetRole: string) => {
      return (
        roles.includes(targetRole) ||
        userType === 'ADMIN' ||
        (targetRole === 'AGENT' && userType === 'EMPLOYEE') ||
        (targetRole === 'CLIENT' && userType === 'INTERESTED_CLIENT') ||
        (targetRole === 'OWNER' && userType === 'OWNER')
      );
    };

    let authorized = false;
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      authorized = to.meta.roles.some((r: string) => hasRequiredRole(r));
    } else if (to.meta.role) {
      authorized = hasRequiredRole(to.meta.role as string);
    } else {
      authorized = true;
    }

    authorized ? next() : next({ name: 'Dashboard' });
  } else {
    next();
  }
});

router.onError((error) => {
  console.error('Router error:', error);
  if (error.message?.includes('Cannot destructure property')) {
    window.location.reload();
  }
});

export default router;
