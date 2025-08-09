<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${coach?.name || '教练'} - 收入统计`"
    width="80%"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="earnings-content">
      <!-- 收入统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ earnings.totalEarnings?.toLocaleString() || 0 }}</div>
                <div class="stat-label">累计收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon current">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ earnings.currentMonthEarnings?.toLocaleString() || 0 }}</div>
                <div class="stat-label">本月收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon sessions">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ coach?.totalSessions || 0 }}</div>
                <div class="stat-label">总课时</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon rate">
                <el-icon><PriceTag /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ coach?.hourlyRate || 0 }}</div>
                <div class="stat-label">课时费</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 时间筛选 -->
      <el-card class="filter-card">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-date-picker
              v-model="dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              format="YYYY年MM月"
              value-format="YYYY-MM"
              @change="handleDateRangeChange"
            />
          </el-col>
          <el-col :span="12">
            <div class="filter-actions">
              <el-button @click="setQuickRange('thisMonth')">本月</el-button>
              <el-button @click="setQuickRange('lastMonth')">上月</el-button>
              <el-button @click="setQuickRange('thisQuarter')">本季度</el-button>
              <el-button @click="setQuickRange('thisYear')">今年</el-button>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Money,
  Wallet,
  Trophy,
  PriceTag
} from '@element-plus/icons-vue'

interface Coach {
  id: string
  name: string
  hourlyRate: number
  totalSessions?: number
}

interface CoachEarnings {
  totalEarnings: number
  currentMonthEarnings: number
  sessions: any[]
  monthlyStats: any[]
}

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
const loading = ref(false)
const dateRange = ref<[string, string]>(['2024-01', '2024-12'])
const earnings = ref<CoachEarnings>({
  totalEarnings: 0,
  currentMonthEarnings: 0,
  sessions: [],
  monthlyStats: []
})

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 事件处理
const handleClose = () => {
  dialogVisible.value = false
}

const handleDateRangeChange = () => {
  // 处理日期范围变化
}

const setQuickRange = (type: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  switch (type) {
    case 'thisMonth':
      dateRange.value = [
        `${year}-${month.toString().padStart(2, '0')}`,
        `${year}-${month.toString().padStart(2, '0')}`
      ]
      break
    case 'lastMonth':
      const lastMonth = month === 1 ? 12 : month - 1
      const lastMonthYear = month === 1 ? year - 1 : year
      dateRange.value = [
        `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}`,
        `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}`
      ]
      break
    case 'thisQuarter':
      const quarterStart = Math.floor((month - 1) / 3) * 3 + 1
      const quarterEnd = quarterStart + 2
      dateRange.value = [
        `${year}-${quarterStart.toString().padStart(2, '0')}`,
        `${year}-${quarterEnd.toString().padStart(2, '0')}`
      ]
      break
    case 'thisYear':
      dateRange.value = [`${year}-01`, `${year}-12`]
      break
  }
}
</script>

<style scoped lang="scss">
.earnings-content {
  .stats-row {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;
          color: white;
          
          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.current {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.sessions {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
          
          &.rate {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #333;
          }
        }
        
        .stat-info {
          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            line-height: 1;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }
  
  .filter-card {
    margin-bottom: 20px;
    
    .filter-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>