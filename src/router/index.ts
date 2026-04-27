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
import VisitDetailView from '@/views/VisitDetailView.vue';

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
        meta: { role: 'AGENT' },
      },
      {
        path: '/operations/:id',
        name: 'OperationDetail',
        component: OperationDetailView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/reassignments/sent',
        name: 'SentRequests',
        component: SentRequestsView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/visits/:id',
        name: 'VisitDetail',
        component: VisitDetailView,
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
  } else if (to.meta.role) {
    const roles = (authStore.user?.roles as string[]) || [];
    const userType = authStore.user?.userType;
    const hasRole =
      roles.includes(to.meta.role as string) ||
      userType === 'ADMIN' ||
      (to.meta.role === 'AGENT' && userType === 'EMPLOYEE') ||
      (to.meta.role === 'CLIENT' && userType === 'INTERESTED_CLIENT');

    hasRole ? next() : next({ name: 'Dashboard' });
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
