<template>
  <el-container class="admin-layout">
    <!-- Sidebar -->
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo" />
        <h2 v-show="!isCollapsed" class="brand-name">健身房管理</h2>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        :collapse="isCollapsed"
        :unique-opened="true"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-sub-menu index="brands">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>品牌管理</span>
          </template>
          <el-menu-item index="/brands">品牌列表</el-menu-item>
          <el-menu-item index="/brands/create">创建品牌</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="stores">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>门店管理</span>
          </template>
          <el-menu-item index="/stores">门店列表</el-menu-item>
          <el-menu-item index="/stores/create">创建门店</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="members">
          <template #title>
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </template>
          <el-menu-item index="/members">会员列表</el-menu-item>
          <el-menu-item index="/members/create">添加会员</el-menu-item>
          <el-menu-item index="/membership-cards">会员卡管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="coaches">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>教练管理</span>
          </template>
          <el-menu-item index="/coaches">教练列表</el-menu-item>
          <el-menu-item index="/coaches/create">添加教练</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="courses">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/courses">课程列表</el-menu-item>
          <el-menu-item index="/courses/create">创建课程</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="bookings">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>预约管理</span>
          </template>
          <el-menu-item index="/bookings">预约列表</el-menu-item>
          <el-menu-item index="/bookings/calendar">预约日历</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/checkins">
          <el-icon><Check /></el-icon>
          <template #title>签到记录</template>
        </el-menu-item>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/users">用户列表</el-menu-item>
          <el-menu-item index="/users/create">创建用户</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="reports">
          <template #title>
            <el-icon><DataLine /></el-icon>
            <span>数据报表</span>
          </template>
          <el-menu-item index="/reports/overview">总览</el-menu-item>
          <el-menu-item index="/reports/members">会员分析</el-menu-item>
          <el-menu-item index="/reports/revenue">收入分析</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- Main Content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapsed ? Expand : Fold"
            @click="toggleSidebar"
            text
            class="collapse-btn"
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumbs" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-badge :value="notifications.length" class="notification-badge">
            <el-button :icon="Bell" text @click="showNotifications" />
          </el-badge>
          
          <el-dropdown @command="handleUserCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="user.avatar" />
              <span class="username">{{ user.realName || user.username }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- Page Content -->
      <el-main class="page-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House, Shop, OfficeBuilding, User, Avatar, Reading,
  Calendar, Check, UserFilled, DataLine, Bell,
  Fold, Expand, ArrowDown
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// Sidebar state
const isCollapsed = ref(false)
const sidebarWidth = computed(() => isCollapsed.value ? '64px' : '240px')

// User info
const user = computed(() => authStore.user)
const notifications = ref([])

// Breadcrumbs
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]
  
  if (first && first.name !== 'Dashboard') {
    matched.unshift({ path: '/dashboard', meta: { title: '首页' } })
  }
  
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

// Methods
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const showNotifications = () => {
  // TODO: Implement notifications panel
  ElMessage.info('暂无新通知')
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        authStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      })
      .catch(() => {})
      break
  }
}

// Watch for route changes to update document title
watch(
  () => route.meta.title,
  (title) => {
    if (title) {
      document.title = `${title} - 健身房管理系统`
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  
  .sidebar {
    background: #001529;
    overflow: hidden;
    transition: width 0.3s;
    
    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      background: rgba(255, 255, 255, 0.1);
      
      .logo {
        height: 32px;
        width: 32px;
        margin-right: 12px;
      }
      
      .brand-name {
        color: white;
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
      }
    }
    
    .sidebar-menu {
      border-right: none;
      background: transparent;
      
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        color: rgba(255, 255, 255, 0.8);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
      }
      
      :deep(.el-menu-item.is-active) {
        background-color: #1890ff;
        color: white;
      }
      
      :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: white;
      }
    }
  }
  
  .main-container {
    .header {
      background: white;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      
      .header-left {
        display: flex;
        align-items: center;
        
        .collapse-btn {
          margin-right: 16px;
          font-size: 18px;
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .notification-badge {
          cursor: pointer;
        }
        
        .user-dropdown {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background-color 0.3s;
          
          &:hover {
            background-color: #f0f0f0;
          }
          
          .username {
            margin: 0 8px;
            font-size: 14px;
          }
        }
      }
    }
    
    .page-content {
      background: #f0f2f5;
      padding: 24px;
      overflow: auto;
    }
  }
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1890ff;
  font-weight: 500;
}
</style>