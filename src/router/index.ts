// FILE: src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import UsersView from '../views/UsersView.vue'
import DashboardView from '../views/DashboardView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import AdminProperties from '../views/AdminProperties.vue' // Importación directa

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
        path: 'admin/users',
        name: 'Users',
        component: UsersView,
        meta: { requiresAuth: true, role: 'ADMIN' }
      },
      {
        path: 'admin/properties',
        name: 'AdminProperties',
        component: AdminProperties, // Vista de gestión global
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
    const hasRole = roles.includes(to.meta.role) || (to.meta.role === 'ADMIN' && userType === 'ADMIN')
    hasRole ? next() : next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router