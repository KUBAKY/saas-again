<template>
  <el-dialog
    v-model="dialogVisible"
    title="课程排期管理"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-if="course" class="schedule-content">
      <!-- 课程信息 -->
      <div class="course-header">
        <h3>{{ course.name }}</h3>
        <el-tag :type="course.type === 'group' ? 'primary' : 'success'">
          {{ course.type === 'group' ? '团课' : '私教' }}
        </el-tag>
      </div>

      <!-- 日期选择和操作 -->
      <div class="schedule-toolbar">
        <el-date-picker
          v-model="selectedWeek"
          type="week"
          placeholder="选择周"
          format="YYYY年 第WW周"
          value-format="YYYY-MM-DD"
          @change="handleWeekChange"
        />
        <div class="toolbar-actions">
          <el-button @click="handlePrevWeek">
            <el-icon><ArrowLeft /></el-icon>
            上一周
          </el-button>
          <el-button @click="handleNextWeek">
            下一周
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button type="primary" @click="handleAddSchedule">
            新增排期
          </el-button>
        </div>
      </div>

      <!-- 排期日历 -->
      <el-card class="schedule-calendar">
        <template #header>
          <span>本周排期 ({{ formatWeekRange(selectedWeek) }})</span>
        </template>
        
        <div class="calendar-grid">
          <div class="time-column">
            <div class="time-header">时间</div>
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="time-slot"
            >
              {{ hour }}:00
            </div>
          </div>
          
          <div
            v-for="(day, index) in weekDates"
            :key="day"
            class="day-column"
          >
            <div class="day-header">
              <div class="day-name">{{ weekDays[index].name }}</div>
              <div class="day-date">{{ formatDate(day) }}</div>
            </div>
            
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="schedule-slot"
              :class="{
                'has-schedule': hasSchedule(day, hour),
                'available': !hasSchedule(day, hour)
              }"
              @click="handleSlotClick(day, hour)"
            >
              <div
                v-if="hasSchedule(day, hour)"
                class="schedule-info"
              >
                <div class="schedule-title">
                  {{ getScheduleInfo(day, hour)?.title }}
                </div>
                <div class="schedule-coach">
                  教练: {{ getScheduleInfo(day, hour)?.coach }}
                </div>
                <div class="schedule-capacity">
                  {{ getScheduleInfo(day, hour)?.enrolled || 0 }}/{{ getScheduleInfo(day, hour)?.capacity || 0 }}
                </div>
              </div>
              <div v-else class="add-schedule">
                <el-icon><Plus /></el-icon>
                <span>添加排期</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 排期统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.totalSchedules }}</div>
              <div class="stat-label">总排期</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.bookedSchedules }}</div>
              <div class="stat-label">已预约</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.availableSlots }}</div>
              <div class="stat-label">可预约</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ (weekStats.utilization * 100).toFixed(1) }}%</div>
              <div class="stat-label">利用率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Plus } from '@element-plus/icons-vue'

interface Course {
  id: string
  name: string
  type: 'group' | 'personal' | 'workshop'
  duration: number
  maxParticipants: number
  status: 'active' | 'inactive' | 'suspended'
}

interface Props {
  modelValue: boolean
  course?: Course | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectedWeek = ref(getMonday(new Date()).toISOString().slice(0, 10))
const scheduleData = ref<any[]>([])

// 周几配置
const weekDays = [
  { key: 'monday', name: '周一' },
  { key: 'tuesday', name: '周二' },
  { key: 'wednesday', name: '周三' },
  { key: 'thursday', name: '周四' },
  { key: 'friday', name: '周五' },
  { key: 'saturday', name: '周六' },
  { key: 'sunday', name: '周日' }
]

// 时间段配置 (8:00 - 21:00)
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const weekDates = computed(() => {
  const monday = new Date(selectedWeek.value)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date.toISOString().slice(0, 10)
  })
})

const weekStats = computed(() => {
  const totalSchedules = scheduleData.value.length
  const bookedSchedules = scheduleData.value.filter(s => s.enrolled > 0).length
  const availableSlots = scheduleData.value.reduce((total, s) => {
    return total + (s.capacity - s.enrolled)
  }, 0)
  const utilization = totalSchedules > 0 ? bookedSchedules / totalSchedules : 0
  
  return {
    totalSchedules,
    bookedSchedules,
    availableSlots,
    utilization
  }
})

// 监听周变化
watch(selectedWeek, () => {
  fetchScheduleData()
})

// 工具函数
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatWeekRange = (mondayStr: string) => {
  const monday = new Date(mondayStr)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  return `${monday.getFullYear()}.${(monday.getMonth() + 1).toString().padStart(2, '0')}.${monday.getDate().toString().padStart(2, '0')} - ${sunday.getFullYear()}.${(sunday.getMonth() + 1).toString().padStart(2, '0')}.${sunday.getDate().toString().padStart(2, '0')}`
}

const hasSchedule = (date: string, hour: number) => {
  return scheduleData.value.some(schedule => {
    const scheduleDate = schedule.date
    const scheduleHour = parseInt(schedule.startTime.split(':')[0])
    return scheduleDate === date && scheduleHour === hour
  })
}

const getScheduleInfo = (date: string, hour: number) => {
  return scheduleData.value.find(schedule => {
    const scheduleDate = schedule.date
    const scheduleHour = parseInt(schedule.startTime.split(':')[0])
    return scheduleDate === date && scheduleHour === hour
  })
}

// 事件处理
const handleWeekChange = () => {
  fetchScheduleData()
}

const handlePrevWeek = () => {
  const currentWeek = new Date(selectedWeek.value)
  currentWeek.setDate(currentWeek.getDate() - 7)
  selectedWeek.value = currentWeek.toISOString().slice(0, 10)
}

const handleNextWeek = () => {
  const currentWeek = new Date(selectedWeek.value)
  currentWeek.setDate(currentWeek.getDate() + 7)
  selectedWeek.value = currentWeek.toISOString().slice(0, 10)
}

const handleAddSchedule = () => {
  ElMessage.info('新增排期功能开发中')
}

const handleSlotClick = (date: string, hour: number) => {
  if (hasSchedule(date, hour)) {
    ElMessage.info('编辑排期功能开发中')
  } else {
    ElMessage.info('添加排期功能开发中')
  }
}

// 获取排期数据
const fetchScheduleData = async () => {
  try {
    // 模拟 API 调用
    const mockData = [
      {
        date: weekDates.value[1], // 周二
        startTime: '09:00',
        title: props.course?.name,
        coach: '张教练',
        capacity: props.course?.maxParticipants || 20,
        enrolled: 15
      },
      {
        date: weekDates.value[3], // 周四
        startTime: '19:00',
        title: props.course?.name,
        coach: '李教练',
        capacity: props.course?.maxParticipants || 20,
        enrolled: 8
      }
    ]
    
    scheduleData.value = mockData
  } catch (error) {
    console.error('获取排期数据失败:', error)
  }
}

// 初始化数据
fetchScheduleData()
</script>

<style scoped lang="scss">
.schedule-content {
  .course-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
    }
  }
  
  .schedule-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .schedule-calendar {
    margin-bottom: 20px;
    
    .calendar-grid {
      display: flex;
      overflow-x: auto;
      
      .time-column {
        min-width: 80px;
        border-right: 1px solid #ebeef5;
        
        .time-header {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          border-bottom: 1px solid #ebeef5;
          background: #f8f9fa;
        }
        
        .time-slot {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #f5f7fa;
          font-size: 12px;
          color: #666;
        }
      }
      
      .day-column {
        flex: 1;
        min-width: 120px;
        border-right: 1px solid #ebeef5;
        
        .day-header {
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #ebeef5;
          background: #f8f9fa;
          
          .day-name {
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .day-date {
            font-size: 12px;
            color: #666;
          }
        }
        
        .schedule-slot {
          height: 80px;
          border-bottom: 1px solid #f5f7fa;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background: #f8f9fa;
          }
          
          &.has-schedule {
            background: #e6f7ff;
            border: 1px solid #40a9ff;
            
            &:hover {
              background: #bae7ff;
            }
          }
          
          &.available {
            &:hover {
              background: #f0f9ff;
            }
          }
          
          .schedule-info {
            padding: 8px;
            
            .schedule-title {
              font-weight: 500;
              font-size: 12px;
              color: #333;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .schedule-coach {
              font-size: 10px;
              color: #666;
              margin-bottom: 2px;
            }
            
            .schedule-capacity {
              font-size: 10px;
              color: #52c41a;
              font-weight: 500;
            }
          }
          
          .add-schedule {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #999;
            font-size: 12px;
            
            .el-icon {
              margin-bottom: 4px;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
  
  .stats-row {
    .stat-card {
      .stat-content {
        text-align: center;
        padding: 8px;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>