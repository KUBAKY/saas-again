<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${coach?.name} - 排班管理`"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-if="coach" class="schedule-content">
      <!-- 日期选择和操作 -->
      <div class="schedule-header">
        <el-date-picker
          v-model="selectedWeek"
          type="week"
          placeholder="选择周"
          format="YYYY年 第WW周"
          value-format="YYYY-MM-DD"
          @change="handleWeekChange"
        />
        <div class="header-actions">
          <el-button @click="handlePrevWeek">
            <el-icon><ArrowLeft /></el-icon>
            上一周
          </el-button>
          <el-button @click="handleNextWeek">
            下一周
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button type="primary" @click="handleSaveSchedule">
            保存排班
          </el-button>
        </div>
      </div>

      <!-- 工作时间设置 -->
      <el-card class="working-hours-card">
        <template #header>
          <span>工作时间设置</span>
        </template>
        
        <el-row :gutter="12">
          <el-col
            v-for="day in weekDays"
            :key="day.key"
            :span="3"
          >
            <div class="day-schedule">
              <div class="day-header">
                <span class="day-name">{{ day.name }}</span>
                <el-switch
                  v-model="workingHours[day.key].enabled"
                  size="small"
                />
              </div>
              
              <div
                v-if="workingHours[day.key].enabled"
                class="time-inputs"
              >
                <el-time-picker
                  v-model="workingHours[day.key].start"
                  placeholder="开始时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  size="small"
                  style="width: 100%; margin-bottom: 8px"
                />
                <el-time-picker
                  v-model="workingHours[day.key].end"
                  placeholder="结束时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  size="small"
                  style="width: 100%"
                />
              </div>
              
              <div v-else class="rest-day">
                休息
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 本周排班日历 -->
      <el-card class="schedule-calendar">
        <template #header>
          <span>本周排班 ({{ formatWeekRange(selectedWeek) }})</span>
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
                'has-booking': hasBooking(day, hour),
                'working-time': isWorkingTime(weekDays[index].key, hour)
              }"
              @click="handleSlotClick(day, hour)"
            >
              <div
                v-if="hasBooking(day, hour)"
                class="booking-info"
              >
                <div class="booking-title">
                  {{ getBookingInfo(day, hour)?.course }}
                </div>
                <div class="booking-member">
                  {{ getBookingInfo(day, hour)?.member }}
                </div>
              </div>
              <div v-else-if="isWorkingTime(weekDays[index].key, hour)" class="available-slot">
                可预约
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 预约统计 -->
      <el-card class="stats-card">
        <template #header>
          <span>本周统计</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ weekStats.totalSlots }}</div>
              <div class="stat-label">总时段</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ weekStats.bookedSlots }}</div>
              <div class="stat-label">已预约</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ weekStats.availableSlots }}</div>
              <div class="stat-label">可预约</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ (weekStats.utilization * 100).toFixed(1) }}%</div>
              <div class="stat-label">利用率</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleUpdateWorkingHours">
          更新工作时间
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { coachesApi, type Coach } from '@/api/coaches'

interface Props {
  modelValue: boolean
  coach?: Coach | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  coach: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectedWeek = ref(getMonday(new Date()).toISOString().slice(0, 10))
const loading = ref(false)
const scheduleData = ref<any[]>([])

// 周几配置
type WeekDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const weekDays: { key: WeekDayKey; name: string }[] = [
  { key: 'monday', name: '周一' },
  { key: 'tuesday', name: '周二' },
  { key: 'wednesday', name: '周三' },
  { key: 'thursday', name: '周四' },
  { key: 'friday', name: '周五' },
  { key: 'saturday', name: '周六' },
  { key: 'sunday', name: '周日' }
]

// 时间段配置
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00 - 21:00

// 工作时间
const workingHours = reactive<Record<WeekDayKey, { enabled: boolean; start: string; end: string }>>({
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '10:00', end: '17:00' },
  sunday: { enabled: false, start: '10:00', end: '17:00' }
})

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
  const totalSlots = weekDates.value.reduce((total, date, dayIndex) => {
    const dayKey = weekDays[dayIndex].key
    if (!workingHours[dayKey].enabled) return total
    
    const startHour = parseInt(workingHours[dayKey].start.split(':')[0])
    const endHour = parseInt(workingHours[dayKey].end.split(':')[0])
    return total + (endHour - startHour)
  }, 0)
  
  const bookedSlots = scheduleData.value.length
  const availableSlots = totalSlots - bookedSlots
  const utilization = totalSlots > 0 ? bookedSlots / totalSlots : 0
  
  return {
    totalSlots,
    bookedSlots,
    availableSlots,
    utilization
  }
})

// 监听教练变化
watch(
  () => props.coach,
  (newCoach) => {
    if (newCoach && newCoach.workingHours) {
      Object.assign(workingHours, newCoach.workingHours)
    }
  },
  { immediate: true }
)

// 监听周变化
watch(selectedWeek, () => {
  fetchScheduleData()
})

// 获取排班数据
const fetchScheduleData = async () => {
  if (!props.coach) return
  
  try {
    loading.value = true
    const startDate = weekDates.value[0]
    const endDate = weekDates.value[6]
    
    const response = await coachesApi.getCoachSchedule(props.coach.id, {
      startDate,
      endDate
    })
    
    scheduleData.value = response
  } catch (error) {
    console.error('获取排班数据失败:', error)
  } finally {
    loading.value = false
  }
}

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

const isWorkingTime = (dayKey: WeekDayKey, hour: number) => {
  const daySchedule = workingHours[dayKey]
  if (!daySchedule.enabled) return false
  
  const startHour = parseInt(daySchedule.start.split(':')[0])
  const endHour = parseInt(daySchedule.end.split(':')[0])
  
  return hour >= startHour && hour < endHour
}

const hasBooking = (date: string, hour: number) => {
  return scheduleData.value.some(booking => {
    const bookingDate = booking.date
    const bookingHour = parseInt(booking.startTime.split(':')[0])
    return bookingDate === date && bookingHour === hour
  })
}

const getBookingInfo = (date: string, hour: number) => {
  return scheduleData.value.find(booking => {
    const bookingDate = booking.date
    const bookingHour = parseInt(booking.startTime.split(':')[0])
    return bookingDate === date && bookingHour === hour
  })?.booking
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

const handleSlotClick = (date: string, hour: number) => {
  // 这里可以实现预约管理功能
  console.log('点击时段:', date, hour)
}

const handleSaveSchedule = () => {
  ElMessage.success('排班保存成功')
}

const handleUpdateWorkingHours = async () => {
  if (!props.coach) return
  
  try {
    await coachesApi.updateWorkingHours(props.coach.id, workingHours)
    ElMessage.success('工作时间更新成功')
  } catch (error) {
    ElMessage.error('工作时间更新失败')
  }
}

// 组件挂载时获取数据
fetchScheduleData()
</script>

<style scoped lang="scss">
.schedule-content {
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .working-hours-card {
    margin-bottom: 20px;
    
    .day-schedule {
      .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .day-name {
          font-weight: 500;
          font-size: 12px;
        }
      }
      
      .time-inputs {
        min-height: 80px;
      }
      
      .rest-day {
        text-align: center;
        color: #999;
        padding: 30px 0;
        font-size: 12px;
      }
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
        }
        
        .time-slot {
          height: 60px;
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
          height: 60px;
          border-bottom: 1px solid #f5f7fa;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background: #f8f9fa;
          }
          
          &.working-time {
            background: #f0f9ff;
            
            &:hover {
              background: #e0f2fe;
            }
          }
          
          &.has-booking {
            background: #fef3e2;
            border: 1px solid #f59e0b;
            
            &:hover {
              background: #fde68a;
            }
          }
          
          .booking-info {
            padding: 8px;
            
            .booking-title {
              font-weight: 500;
              font-size: 12px;
              color: #333;
              margin-bottom: 2px;
            }
            
            .booking-member {
              font-size: 10px;
              color: #666;
            }
          }
          
          .available-slot {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-size: 11px;
            color: #0ea5e9;
          }
        }
      }
    }
  }
  
  .stats-card {
    .stat-item {
      text-align: center;
      
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

.dialog-footer {
  text-align: right;
}
</style>