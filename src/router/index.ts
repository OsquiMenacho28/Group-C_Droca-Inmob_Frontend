import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import UsersView from '../views/UsersView.vue'
import DashboardView from '../views/DashboardView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import PropertyView from '../views/AgentDashboard.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'agent',
        name: 'AgentDashboard',
        component: () => import('../views/AgentDashboard.vue'),
        meta: { requiresAuth: true, role: 'AGENT' }
      },
      {
        path: 'owner',
        name: 'OwnerDashboard',
        component: () => import('../views/OwnerDashboard.vue'),
        meta: { requiresAuth: true, role: 'OWNER' }
      },
      {
        path: 'client',
        name: 'ClientDashboard',
        component: () => import('../views/ClientDashboard.vue'),
        meta: { requiresAuth: true, role: 'INTERESTED_CLIENT' }
      },
      {
        path: 'admin/users',
        name: 'Users',
        component: UsersView,
        meta: { requiresAuth: true, role: 'ADMIN' }
      },
      {
        path: 'admin/properties',
        name: 'AdminProperties',
        component: () => import('../views/AgentDashboard.vue'), // Debes crear este archivo
        meta: { requiresAuth: true, role: 'ADMIN' }
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated.value && to.name !== 'Login') {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next({ name: 'Dashboard' })
  } else if (to.meta.role) {
    const roles = user.value?.roles || []
    const userType = user.value?.userType
    const hasRole = roles.includes(to.meta.role) || 
                  (to.meta.role === 'ADMIN' && userType === 'ADMIN') ||
                  (to.meta.role === 'AGENT' && userType === 'EMPLOYEE') ||
                  (to.meta.role === 'OWNER' && userType === 'OWNER') ||
                  (to.meta.role === 'INTERESTED_CLIENT' && userType === 'INTERESTED_CLIENT')

    if (hasRole) {
      next()
    } else {
      // Redirect to their own dashboard or to main Dashboard
      if (roles.includes('ADMIN') || userType === 'ADMIN') next({ name: 'Users' })
      else if (roles.includes('AGENT') || userType === 'EMPLOYEE') next({ name: 'AgentDashboard' })
      else if (roles.includes('OWNER') || userType === 'OWNER') next({ name: 'OwnerDashboard' })
      else if (roles.includes('INTERESTED_CLIENT') || userType === 'INTERESTED_CLIENT') next({ name: 'ClientDashboard' })
      else next({ name: 'Dashboard' })
    }
  } else {
    next()
  }
})

export default router
