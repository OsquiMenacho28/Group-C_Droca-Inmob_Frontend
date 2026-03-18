import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import UsersView from '../views/UsersView.vue'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: { template: '<div class="p-6">Welcome to Dashboard</div>' }
      },
      {
        path: 'admin/users',
        name: 'Users',
        component: UsersView,
        meta: { requiresAdmin: true }
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
  } else if (to.meta.requiresAdmin) {
    const isAdmin = user.value?.roles?.includes('ADMIN')
    if (isAdmin) {
      next()
    } else {
      next({ name: 'Dashboard' })
    }
  } else {
    next()
  }
})
