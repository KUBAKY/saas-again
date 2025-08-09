<template>
  <el-dialog
    v-model="dialogVisible"
    title="预约课程"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="course" class="booking-content">
      <!-- 课程信息 -->
      <div class="course-info">
        <h3>{{ course.name }}</h3>
        <div class="course-meta">
          <el-tag :type="course.type === 'group' ? 'primary' : 'success'">
            {{ course.type === 'group' ? '团课' : '私教' }}
          </el-tag>
          <span class="duration">{{ course.duration }}分钟</span>
          <span class="price">¥{{ course.price }}</span>
        </div>
      </div>

      <!-- 预约表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="选择日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="选择时间" prop="timeSlot">
          <el-select
            v-model="form.timeSlot"
            placeholder="请选择时间段"
            style="width: 100%"
            :loading="timeLoading"
          >
            <el-option
              v-for="slot in availableTimeSlots"
              :key="slot.value"
              :label="slot.label"
              :value="slot.value"
              :disabled="slot.disabled"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="course.type === 'group'" label="参与人数" prop="participants">
          <el-input-number
            v-model="form.participants"
            :min="1"
            :max="availableSlots"
            controls-position="right"
            style="width: 100%"
          />
          <div class="participants-info">
            剩余名额: {{ availableSlots }} 人
          </div>
        </el-form-item>

        <el-form-item label="选择教练" prop="coachId">
          <el-select
            v-model="form.coachId"
            placeholder="请选择教练"
            style="width: 100%"
            :loading="coachLoading"
          >
            <el-option
              v-for="coach in availableCoaches"
              :key="coach.id"
              :label="`${coach.name} - ¥${coach.hourlyRate}/小时`"
              :value="coach.id"
            >
              <div class="coach-option">
                <span class="coach-name">{{ coach.name }}</span>
                <span class="coach-rating">
                  ⭐ {{ coach.rating?.toFixed(1) || '0.0' }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 价格预览 -->
      <div class="price-summary">
        <div class="summary-item">
          <span>课程费用：</span>
          <span>¥{{ courseFee }}</span>
        </div>
        <div v-if="course.type === 'group'" class="summary-item">
          <span>人数：</span>
          <span>{{ form.participants }} 人</span>
        </div>
        <div class="summary-total">
          <span>总计：</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确认预约
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'

interface Course {
  id: string
  name: string
  type: 'group' | 'personal' | 'workshop'
  duration: number
  price: number
  maxParticipants: number
  status: 'active' | 'inactive' | 'suspended'
}

interface Coach {
  id: string
  name: string
  hourlyRate: number
  rating?: number
}

interface Props {
  modelValue: boolean
  course?: Course | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const timeLoading = ref(false)
const coachLoading = ref(false)

const form = reactive({
  date: '',
  timeSlot: '',
  participants: 1,
  coachId: '',
  notes: ''
})

const availableTimeSlots = ref<Array<{
  label: string
  value: string
  disabled: boolean
}>>([])

const availableCoaches = ref<Coach[]>([])

// 表单验证规则
const formRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  timeSlot: [
    { required: true, message: '请选择时间段', trigger: 'change' }
  ],
  participants: [
    { required: true, message: '请输入参与人数', trigger: 'change' }
  ],
  coachId: [
    { required: true, message: '请选择教练', trigger: 'change' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const availableSlots = computed(() => {
  // 模拟剩余名额计算
  return props.course?.maxParticipants ? props.course.maxParticipants - 3 : 0
})

const courseFee = computed(() => {
  return props.course?.price || 0
})

const totalPrice = computed(() => {
  if (props.course?.type === 'group') {
    return courseFee.value * form.participants
  }
  return courseFee.value
})

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 监听日期变化，获取可用时间段
watch(() => form.date, async (newDate) => {
  if (newDate) {
    await fetchAvailableTimeSlots(newDate)
  }
})

// 监听时间段变化，获取可用教练
watch(() => form.timeSlot, async (newTimeSlot) => {
  if (newTimeSlot && form.date) {
    await fetchAvailableCoaches(form.date, newTimeSlot)
  }
})

// 获取可用时间段
const fetchAvailableTimeSlots = async (date: string) => {
  timeLoading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成模拟时间段
    const timeSlots = [
      { label: '09:00-10:00', value: '09:00', disabled: false },
      { label: '10:00-11:00', value: '10:00', disabled: false },
      { label: '11:00-12:00', value: '11:00', disabled: true },
      { label: '14:00-15:00', value: '14:00', disabled: false },
      { label: '15:00-16:00', value: '15:00', disabled: false },
      { label: '16:00-17:00', value: '16:00', disabled: false },
      { label: '19:00-20:00', value: '19:00', disabled: false },
      { label: '20:00-21:00', value: '20:00', disabled: false }
    ]
    
    availableTimeSlots.value = timeSlots
  } catch (error) {
    console.error('获取时间段失败:', error)
    ElMessage.error('获取时间段失败')
  } finally {
    timeLoading.value = false
  }
}

// 获取可用教练
const fetchAvailableCoaches = async (date: string, timeSlot: string) => {
  coachLoading.value = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成模拟教练数据
    const coaches = [
      { id: '1', name: '张教练', hourlyRate: 200, rating: 4.8 },
      { id: '2', name: '李教练', hourlyRate: 180, rating: 4.6 },
      { id: '3', name: '王教练', hourlyRate: 220, rating: 4.9 }
    ]
    
    availableCoaches.value = coaches
  } catch (error) {
    console.error('获取教练失败:', error)
    ElMessage.error('获取教练失败')
  } finally {
    coachLoading.value = false
  }
}

// 提交预约
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('预约成功！')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('预约失败:', error)
    ElMessage.error('预约失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    date: '',
    timeSlot: '',
    participants: 1,
    coachId: '',
    notes: ''
  })
  availableTimeSlots.value = []
  availableCoaches.value = []
}

// 监听对话框关闭
watch(() => props.modelValue, (visible) => {
  if (!visible) {
    resetForm()
  }
})
</script>

<style scoped lang="scss">
.booking-content {
  .course-info {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    
    h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .course-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .duration {
        color: #666;
        font-size: 14px;
      }
      
      .price {
        color: #e74c3c;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  
  .participants-info {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
  
  .coach-option {
    display: flex;
    justify-content: space-between;
    
    .coach-name {
      font-weight: 500;
    }
    
    .coach-rating {
      color: #f39c12;
      font-size: 12px;
    }
  }
  
  .price-summary {
    margin-top: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #666;
    }
    
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-weight: 600;
      
      .total-price {
        color: #e74c3c;
        font-size: 18px;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>