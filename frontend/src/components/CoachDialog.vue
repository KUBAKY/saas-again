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
})\n\n// 表单验证规则\nconst formRules = {\n  employeeNumber: [\n    { required: true, message: '请输入工号', trigger: 'blur' },\n    { min: 2, max: 20, message: '工号长度在2-20个字符', trigger: 'blur' }\n  ],\n  name: [\n    { required: true, message: '请输入姓名', trigger: 'blur' },\n    { min: 2, max: 10, message: '姓名长度在2-10个字符', trigger: 'blur' }\n  ],\n  phone: [\n    { required: true, message: '请输入手机号', trigger: 'blur' },\n    { pattern: /^1[3-9]\\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }\n  ],\n  experienceYears: [\n    { required: true, message: '请输入从业年限', trigger: 'change' }\n  ],\n  hourlyRate: [\n    { required: true, message: '请输入课时费', trigger: 'change' }\n  ],\n  joinDate: [\n    { required: true, message: '请选择入职日期', trigger: 'change' }\n  ],\n  storeId: [\n    { required: true, message: '请选择门店', trigger: 'change' }\n  ]\n}\n\n// 计算属性\nconst dialogVisible = computed({\n  get: () => props.modelValue,\n  set: (value) => emit('update:modelValue', value)\n})\n\n// 监听教练数据变化\nwatch(\n  () => props.coach,\n  (newCoach) => {\n    if (newCoach) {\n      Object.assign(form, {\n        employeeNumber: newCoach.employeeNumber,\n        name: newCoach.name,\n        phone: newCoach.phone,\n        email: newCoach.email || '',\n        gender: newCoach.gender,\n        birthday: newCoach.birthday || '',\n        introduction: newCoach.introduction || '',\n        specialties: newCoach.specialties || [],\n        experienceYears: newCoach.experienceYears,\n        hourlyRate: newCoach.hourlyRate,\n        joinDate: newCoach.joinDate,\n        bankAccount: newCoach.bankAccount || '',\n        emergencyContact: newCoach.emergencyContact || '',\n        emergencyPhone: newCoach.emergencyPhone || '',\n        notes: newCoach.notes || '',\n        storeId: newCoach.storeId\n      })\n    } else {\n      resetForm()\n    }\n  },\n  { immediate: true }\n)\n\n// 重置表单\nconst resetForm = () => {\n  Object.assign(form, {\n    employeeNumber: '',\n    name: '',\n    phone: '',\n    email: '',\n    gender: undefined,\n    birthday: '',\n    introduction: '',\n    specialties: [],\n    experienceYears: 0,\n    hourlyRate: 0,\n    joinDate: '',\n    bankAccount: '',\n    emergencyContact: '',\n    emergencyPhone: '',\n    notes: '',\n    storeId: ''\n  })\n  \n  nextTick(() => {\n    formRef.value?.clearValidate()\n  })\n}\n\n// 关闭对话框\nconst handleClose = () => {\n  dialogVisible.value = false\n  resetForm()\n}\n\n// 提交表单\nconst handleSubmit = async () => {\n  if (!formRef.value) return\n  \n  try {\n    await formRef.value.validate()\n    loading.value = true\n    \n    if (props.isEdit && props.coach) {\n      await coachesApi.updateCoach(props.coach.id, form)\n      ElMessage.success('教练信息更新成功')\n    } else {\n      await coachesApi.createCoach(form)\n      ElMessage.success('教练创建成功')\n    }\n    \n    emit('success')\n    handleClose()\n  } catch (error) {\n    console.error('提交失败:', error)\n    ElMessage.error('操作失败，请重试')\n  } finally {\n    loading.value = false\n  }\n}\n\n// 获取门店列表（这里应该从 API 获取）\nconst fetchStores = async () => {\n  // 临时模拟数据，实际应该调用 API\n  stores.value = [\n    { id: '1', name: '总店' },\n    { id: '2', name: '分店A' },\n    { id: '3', name: '分店B' }\n  ]\n}\n\n// 组件挂载时获取门店列表\nfetchStores()\n</script>\n\n<style scoped lang=\"scss\">\n.dialog-footer {\n  text-align: right;\n}\n</style>"