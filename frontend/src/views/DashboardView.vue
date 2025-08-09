<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">仪表盘</h1>
        <p class="page-subtitle">欢迎回来，{{ authStore.user?.realName || authStore.user?.username }}</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData">
          刷新数据
        </el-button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card members-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.members.total }}</div>
              <div class="stats-label">总会员数</div>
              <div class="stats-trend positive">
                <el-icon><CaretTop /></el-icon>
                +{{ stats.members.newThisMonth }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card bookings-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.bookings.today }}</div>
              <div class="stats-label">今日预约</div>
              <div class="stats-trend">
                总计 {{ stats.bookings.total }} 个预约
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card checkins-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.checkins.today }}</div>
              <div class="stats-label">今日签到</div>
              <div class="stats-trend">
                本周 {{ stats.checkins.week }} 次
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stats-card revenue-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">¥{{ formatMoney(stats.revenue.thisMonth) }}</div>
              <div class="stats-label">本月收入</div>
              <div class="stats-trend positive">
                <el-icon><CaretTop /></el-icon>
                +12.5%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Charts Row -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card title="会员增长趋势">
          <template #header>
            <div class="card-header">
              <span class="card-title">会员增长趋势</span>
              <el-radio-group v-model="chartPeriod" size="small">
                <el-radio-button label="7d">近7天</el-radio-button>
                <el-radio-button label="30d">近30天</el-radio-button>
                <el-radio-button label="90d">近90天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="memberChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card title="课程类型分布">
          <template #header>
            <span class="card-title">课程类型分布</span>
          </template>
          <div class="chart-container small" ref="courseChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Recent Activity -->
    <el-row :gutter="20" class="activity-row">
      <el-col :xs="24" :lg="12">
        <el-card title="最近预约">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近预约</span>
              <el-link type="primary" @click="$router.push('/bookings')">查看全部</el-link>
            </div>
          </template>
          <div class="activity-list">
            <div 
              v-for="booking in recentBookings" 
              :key="booking.id"
              class="activity-item"
            >
              <div class="activity-avatar">
                <el-avatar :size="40">{{ booking.memberName.charAt(0) }}</el-avatar>
              </div>
              <div class="activity-content">
                <div class="activity-title">
                  {{ booking.memberName }} 预约了 {{ booking.courseName }}
                </div>
                <div class="activity-time">
                  {{ formatDateTime(booking.startTime) }}
                </div>
              </div>
              <div class="activity-status">
                <el-tag 
                  :type="getBookingStatusType(booking.status)"
                  size="small"
                >
                  {{ getBookingStatusText(booking.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card title="最近签到">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近签到</span>
              <el-link type="primary" @click="$router.push('/checkins')">查看全部</el-link>
            </div>
          </template>
          <div class="activity-list">
            <div 
              v-for="checkin in recentCheckins" 
              :key="checkin.id"
              class="activity-item"
            >
              <div class="activity-avatar">
                <el-avatar :size="40">{{ checkin.memberName.charAt(0) }}</el-avatar>
              </div>
              <div class="activity-content">
                <div class="activity-title">
                  {{ checkin.memberName }} 在 {{ checkin.storeName }} 签到
                </div>
                <div class="activity-time">
                  {{ formatDateTime(checkin.checkInTime) }}
                </div>
              </div>
              <div class="activity-method">
                <el-tag 
                  :type="getCheckinMethodType(checkin.method)"
                  size="small"
                >
                  {{ getCheckinMethodText(checkin.method) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, Calendar, Check, Money, Refresh, CaretTop
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const authStore = useAuthStore()

// Refs
const memberChartRef = ref<HTMLDivElement>()
const courseChartRef = ref<HTMLDivElement>()

// State
const loading = ref(false)
const chartPeriod = ref('30d')

// Mock data - replace with real API calls
const stats = reactive({
  members: {
    total: 1248,
    newThisMonth: 156,
  },
  bookings: {
    total: 2847,
    today: 23,
  },
  checkins: {
    today: 156,
    week: 892,
  },
  revenue: {
    thisMonth: 248500,
  },
})

const recentBookings = ref([
  {
    id: '1',
    memberName: '张三',
    courseName: '瑜伽课程',
    startTime: new Date(),
    status: 'confirmed',
  },
  {
    id: '2',
    memberName: '李四',
    courseName: '健身私教',
    startTime: new Date(Date.now() - 3600000),
    status: 'pending',
  },
  {
    id: '3',
    memberName: '王五',
    courseName: '游泳课程',
    startTime: new Date(Date.now() - 7200000),
    status: 'completed',
  },
])

const recentCheckins = ref([
  {
    id: '1',
    memberName: '张三',
    storeName: '中心店',
    checkInTime: new Date(),
    method: 'qr_code',
  },
  {
    id: '2',
    memberName: '李四',
    storeName: '分店',
    checkInTime: new Date(Date.now() - 1800000),
    method: 'manual',
  },
  {
    id: '3',
    memberName: '王五',
    storeName: '中心店',
    checkInTime: new Date(Date.now() - 3600000),
    method: 'facial_recognition',
  },
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // TODO: Fetch real data from API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const formatMoney = (amount: number) => {
  return amount.toLocaleString()
}

const formatDateTime = (date: Date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const getBookingStatusType = (status: string) => {
  const types = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info',
  }
  return types[status] || 'info'
}

const getBookingStatusText = (status: string) => {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成',
  }
  return texts[status] || status
}

const getCheckinMethodType = (method: string) => {
  const types = {
    manual: 'info',
    qr_code: 'success',
    facial_recognition: 'warning',
  }
  return types[method] || 'info'
}

const getCheckinMethodText = (method: string) => {
  const texts = {
    manual: '手动',
    qr_code: '扫码',
    facial_recognition: '人脸',
  }
  return texts[method] || method
}

const initCharts = async () => {
  await nextTick()
  
  // TODO: Initialize charts with actual charting library (e.g., ECharts)
  // This is just a placeholder
  if (memberChartRef.value) {
    memberChartRef.value.innerHTML = '<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">会员增长图表将在这里显示</div>'
  }
  
  if (courseChartRef.value) {
    courseChartRef.value.innerHTML = '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">课程分布图表将在这里显示</div>'
  }
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped lang="scss">
.dashboard {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 4px 0;
    }
    
    .page-subtitle {
      font-size: 14px;
      color: #8c8c8c;
      margin: 0;
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
  }
  
  .stats-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
    
    .stats-content {
      display: flex;
      align-items: center;
      
      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
      }
      
      .stats-info {
        flex: 1;
        
        .stats-number {
          font-size: 24px;
          font-weight: 600;
          color: #262626;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        
        .stats-label {
          font-size: 14px;
          color: #8c8c8c;
          margin-bottom: 4px;
        }
        
        .stats-trend {
          font-size: 12px;
          color: #8c8c8c;
          display: flex;
          align-items: center;
          gap: 2px;
          
          &.positive {
            color: #52c41a;
          }
          
          .el-icon {
            font-size: 12px;
          }
        }
      }
    }
    
    &.members-card .stats-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    
    &.bookings-card .stats-icon {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }
    
    &.checkins-card .stats-icon {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }
    
    &.revenue-card .stats-icon {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
    }
  }
  
  .charts-row {
    margin-bottom: 24px;
    
    .el-card {
      :deep(.el-card__header) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px 20px;
      }
      
      :deep(.el-card__body) {
        padding: 20px;
      }
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }
    
    .chart-container {
      height: 300px;
      
      &.small {
        height: 200px;
      }
    }
  }
  
  .activity-row {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }
    
    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-avatar {
          margin-right: 12px;
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-size: 14px;
            color: #262626;
            margin-bottom: 4px;
          }
          
          .activity-time {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
        
        .activity-status,
        .activity-method {
          margin-left: 12px;
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .dashboard {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    .stats-row {
      :deep(.el-col) {
        margin-bottom: 16px;
      }
    }
    
    .charts-row,
    .activity-row {
      :deep(.el-col) {
        margin-bottom: 16px;
      }
    }
  }
}
</style>