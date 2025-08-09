<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑教练' : '新增教练'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工号" prop="employeeNumber">
            <el-input
              v-model="form.employeeNumber"
              placeholder="请输入工号"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio value="male">男</el-radio>
              <el-radio value="female">女</el-radio>
              <el-radio value="other">其他</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生日">
            <el-date-picker
              v-model="form.birthday"
              type="date"
              placeholder="请选择生日"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="从业年限" prop="experienceYears">
            <el-input-number
              v-model="form.experienceYears"
              :min="0"
              :max="50"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课时费" prop="hourlyRate">
            <el-input-number
              v-model="form.hourlyRate"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>元/小时</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入职日期" prop="joinDate">
            <el-date-picker
              v-model="form.joinDate"
              type="date"
              placeholder="请选择入职日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="门店" prop="storeId">
            <el-select
              v-model="form.storeId"
              placeholder="请选择门店"
              style="width: 100%"
            >
              <el-option
                v-for="store in stores"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="专业领域">
        <el-select
          v-model="form.specialties"
          multiple
          filterable
          allow-create
          placeholder="请选择或输入专业领域"
          style="width: 100%"
        >
          <el-option
            v-for="specialty in availableSpecialties"
            :key="specialty"
            :label="specialty"
            :value="specialty"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="个人简介">
        <el-input
          v-model="form.introduction"
          type="textarea"
          :rows="3"
          placeholder="请输入个人简介"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="紧急联系人">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-input
              v-model="form.emergencyContact"
              placeholder="请输入紧急联系人姓名"
            />
          </el-col>
          <el-col :span="12">
            <el-input
              v-model="form.emergencyPhone"
              placeholder="请输入紧急联系人电话"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="银行账户">
        <el-input
          v-model="form.bankAccount"
          placeholder="请输入银行账户（用于工资发放）"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { coachesApi, type Coach, type CreateCoachRequest } from '@/api/coaches'

interface Props {
  modelValue: boolean
  coach?: Coach | null
  isEdit?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  coach: null,
  isEdit: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const stores = ref<Array<{ id: string; name: string }>>([])
const availableSpecialties = ref<string[]>([
  '健身',
  '瑜伽',
  '普拉提',
  '有氧训练',
  '力量训练',
  '功能性训练',
  '拳击',
  '舞蹈',
  '游泳',
  '康复训练'
])

// 表单数据
const form = reactive<CreateCoachRequest>({
  employeeNumber: '',
  name: '',
  phone: '',
  email: '',
  gender: undefined,
  birthday: '',
  introduction: '',
  specialties: [],
  experienceYears: 0,
  hourlyRate: 0,
  joinDate: '',
  bankAccount: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  storeId: ''
})

// 表单验证规则
const formRules = {
  employeeNumber: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 2, max: 20, message: '工号长度在2-20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2-10个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  experienceYears: [
    { required: true, message: '请输入从业年限', trigger: 'change' }
  ],
  hourlyRate: [
    { required: true, message: '请输入课时费', trigger: 'change' }
  ],
  joinDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ],
  storeId: [
    { required: true, message: '请选择门店', trigger: 'change' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听教练数据变化
watch(
  () => props.coach,
  (newCoach) => {
    if (newCoach) {
      Object.assign(form, {
        employeeNumber: newCoach.employeeNumber,
        name: newCoach.name,
        phone: newCoach.phone,
        email: newCoach.email || '',
        gender: newCoach.gender,
        birthday: newCoach.birthday || '',
        introduction: newCoach.introduction || '',
        specialties: newCoach.specialties || [],
        experienceYears: newCoach.experienceYears,
        hourlyRate: newCoach.hourlyRate,
        joinDate: newCoach.joinDate,
        bankAccount: newCoach.bankAccount || '',
        emergencyContact: newCoach.emergencyContact || '',
        emergencyPhone: newCoach.emergencyPhone || '',
        notes: newCoach.notes || '',
        storeId: newCoach.storeId
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    employeeNumber: '',
    name: '',
    phone: '',
    email: '',
    gender: undefined,
    birthday: '',
    introduction: '',
    specialties: [],
    experienceYears: 0,
    hourlyRate: 0,
    joinDate: '',
    bankAccount: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    storeId: ''
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (props.isEdit && props.coach) {
      await coachesApi.updateCoach(props.coach.id, form)
      ElMessage.success('教练信息更新成功')
    } else {
      await coachesApi.createCoach(form)
      ElMessage.success('教练创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取门店列表（这里应该从 API 获取）
const fetchStores = async () => {
  // 临时模拟数据，实际应该调用 API
  stores.value = [
    { id: '1', name: '总店' },
    { id: '2', name: '分店A' },
    { id: '3', name: '分店B' }
  ]
}

// 组件挂载时获取门店列表
fetchStores()
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style>"