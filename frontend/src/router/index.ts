import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: '/members',
          name: 'members',
          component: () => import('@/views/MembersView.vue'),
        },
        {
          path: '/coaches',
          name: 'coaches', 
          component: () => import('@/views/CoachesView.vue'),
        },
        {
          path: '/courses',
          name: 'courses',
          component: () => import('@/views/CoursesView.vue'),
        },
        {
          path: '/bookings',
          name: 'bookings',
          component: () => import('@/views/BookingsView.vue'),
        },
        {
          path: '/stores',
          name: 'stores',
          component: () => import('@/views/StoresView.vue'),
        },
        {
          path: '/brands',
          name: 'brands',
          component: () => import('@/views/BrandsView.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state if not already done
  if (!authStore.user && authStore.token) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('Auth initialization failed:', error)
    }
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Redirect authenticated users away from guest routes
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
