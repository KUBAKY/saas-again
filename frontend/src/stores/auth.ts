import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

export interface User {
  id: string
  username: string
  email: string
  realName: string
  phone?: string
  brandId?: string
  storeId?: string
  roles: string[]
  permissions: string[]
  avatar?: string
  lastLoginAt?: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  realName: string
  phone?: string
  brandId?: string
  storeId?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.roles.includes('ADMIN') || false)
  const isBrandManager = computed(() => user.value?.roles.includes('BRAND_MANAGER') || false)
  const isStoreManager = computed(() => user.value?.roles.includes('STORE_MANAGER') || false)
  const userRole = computed(() => user.value?.roles[0] || '')

  // Actions
  const login = async (loginForm: LoginForm) => {
    try {
      loading.value = true
      const response = await authApi.login(loginForm)
      
      token.value = response.access_token
      refreshToken.value = response.refresh_token
      user.value = response.user
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      
      ElMessage.success('登录成功')
      return response
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (registerForm: RegisterForm) => {
    try {
      loading.value = true
      const response = await authApi.register(registerForm)
      
      token.value = response.access_token
      refreshToken.value = response.refresh_token
      user.value = response.user
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      
      ElMessage.success('注册成功')
      return response
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Clear local data first for immediate UI update
      token.value = null
      refreshToken.value = null
      user.value = null
      
      // Remove from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      
      // Note: Could call API logout endpoint here if needed
      
      ElMessage.success('退出登录成功')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      if (!token.value) return
      
      const userProfile = await authApi.getProfile()
      user.value = userProfile as User
      return userProfile
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error)
      if (error.status === 401) {
        // Token expired, try refresh
        await tryRefreshToken()
      }
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      loading.value = true
      const updatedUser = await authApi.updateProfile(profileData)
      user.value = { ...(user.value || {}), ...(updatedUser as User) }
      
      ElMessage.success('个人信息更新成功')
      return updatedUser
    } catch (error: any) {
      ElMessage.error(error.message || '更新失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData: { 
    currentPassword: string
    newPassword: string
    confirmPassword: string 
  }) => {
    try {
      loading.value = true
      await authApi.changePassword(passwordData)
      
      ElMessage.success('密码修改成功')
    } catch (error: any) {
      ElMessage.error(error.message || '密码修改失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const tryRefreshToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await authApi.refreshToken(refreshToken.value)
      token.value = response.access_token
      
      localStorage.setItem('token', response.access_token)
      return response.access_token
    } catch (error) {
      // Refresh failed, clear all auth data
      await logout()
      throw error
    }
  }

  const hasPermission = (permission: string) => {
    return user.value?.permissions.includes(permission) || false
  }

  const hasRole = (role: string) => {
    return user.value?.roles.includes(role) || false
  }

  const hasAnyRole = (roles: string[]) => {
    if (!user.value?.roles) return false
    return roles.some(role => user.value!.roles.includes(role))
  }

  // Initialize auth state
  const initAuth = async () => {
    if (token.value) {
      try {
        await fetchUserProfile()
      } catch (error) {
        // If profile fetch fails, clear auth data
        await logout()
      }
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isBrandManager,
    isStoreManager,
    userRole,
    
    // Actions
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    changePassword,
    tryRefreshToken,
    hasPermission,
    hasRole,
    hasAnyRole,
    initAuth,
  }
})