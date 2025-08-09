import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppConfig {
  title: string
  theme: 'light' | 'dark'
  primaryColor: string
  sidebarCollapsed: boolean
}

export interface Breadcrumb {
  path: string
  title: string
}

export const useAppStore = defineStore('app', () => {
  // State
  const config = ref<AppConfig>({
    title: '健身房管理系统',
    theme: 'light',
    primaryColor: '#1890ff',
    sidebarCollapsed: false,
  })
  
  const breadcrumbs = ref<Breadcrumb[]>([])
  const loading = ref(false)
  const pageLoading = ref(false)

  // Actions
  const setConfig = (newConfig: Partial<AppConfig>) => {
    config.value = { ...config.value, ...newConfig }
    localStorage.setItem('app-config', JSON.stringify(config.value))
  }

  const toggleSidebar = () => {
    config.value.sidebarCollapsed = !config.value.sidebarCollapsed
    setConfig(config.value)
  }

  const setBreadcrumbs = (newBreadcrumbs: Breadcrumb[]) => {
    breadcrumbs.value = newBreadcrumbs
  }

  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setPageLoading = (state: boolean) => {
    pageLoading.value = state
  }

  const setTheme = (theme: 'light' | 'dark') => {
    setConfig({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  }

  const setPrimaryColor = (color: string) => {
    setConfig({ primaryColor: color })
    document.documentElement.style.setProperty('--el-color-primary', color)
  }

  // Initialize config from localStorage
  const initConfig = () => {
    const savedConfig = localStorage.getItem('app-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        config.value = { ...config.value, ...parsed }
        setTheme(config.value.theme)
        setPrimaryColor(config.value.primaryColor)
      } catch (error) {
        console.error('Failed to parse app config from localStorage:', error)
      }
    }
  }

  return {
    // State
    config,
    breadcrumbs,
    loading,
    pageLoading,
    
    // Actions
    setConfig,
    toggleSidebar,
    setBreadcrumbs,
    setLoading,
    setPageLoading,
    setTheme,
    setPrimaryColor,
    initConfig,
  }
})