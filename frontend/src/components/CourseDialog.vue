<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑课程' : '新增课程'"
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
          <el-form-item label="课程名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入课程名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程类型" prop="type">
            <el-select
              v-model="form.type"
              placeholder="请选择课程类型"
              style="width: 100%"
            >
              <el-option label="团课" value="group" />
              <el-option label="私教" value="personal" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程时长" prop="duration">
            <el-input-number
              v-model="form.duration"
              :min="15"
              :max="180"
              :step="15"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>分钟</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="难度等级" prop="difficultyLevel">
            <el-rate
              v-model="form.difficultyLevel"
              :max="5"
              show-text
              :texts="['入门', '初级', '中级', '高级', '专业']"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最大人数" prop="maxParticipants">
            <el-input-number
              v-model="form.maxParticipants"
              :min="1"
              :max="50"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>人</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程价格" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>元</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="课程状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
          <el-radio value="draft">草稿</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="所需设备">
        <el-select
          v-model="form.equipment"
          multiple
          filterable
          allow-create
          placeholder="请选择或输入所需设备"
          style="width: 100%"
        >
          <el-option
            v-for="equipment in availableEquipment"
            :key="equipment"
            :label="equipment"
            :value="equipment"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="课程介绍">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入课程介绍"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="课程要求">
        <el-input
          v-model="form.requirements"
          type="textarea"
          :rows="3"
          placeholder="请输入课程要求"
          maxlength="300"
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

interface Course {
  id?: string
  name: string
  type: 'group' | 'personal' | 'workshop'
  duration: number
  difficultyLevel: number
  maxParticipants: number
  price: number
  status: 'active' | 'inactive' | 'suspended'
  description?: string
  requirements?: string
  equipment?: string[]
}

interface Props {
  modelValue: boolean
  course?: Course | null
  isEdit?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
  isEdit: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const availableEquipment = ref<string[]>([
  '瑜伽垫',
  '哑铃',
  '杠铃',
  '弹力带',
  '健身球',
  '泡沫轴',
  '跑步机',
  '动感单车',
  '划船机',
  '壶铃'
])

// 表单数据
const form = reactive<Course>({
  name: '',
  type: 'group',
  duration: 60,
  difficultyLevel: 1,
  maxParticipants: 20,
  price: 0,
  status: 'active',
  description: '',
  requirements: '',
  equipment: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度在2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入课程时长', trigger: 'change' }
  ],
  difficultyLevel: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  maxParticipants: [
    { required: true, message: '请输入最大人数', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入课程价格', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择课程状态', trigger: 'change' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听课程数据变化
watch(
  () => props.course,
  (newCourse) => {
    if (newCourse) {
      Object.assign(form, {
        name: newCourse.name,
        type: newCourse.type,
        duration: newCourse.duration,
        difficultyLevel: newCourse.difficultyLevel,
        maxParticipants: newCourse.maxParticipants,
        price: newCourse.price,
        status: newCourse.status,
        description: newCourse.description || '',
        requirements: newCourse.requirements || '',
        equipment: newCourse.equipment || []
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
    name: '',
    type: 'group',
    duration: 60,
    difficultyLevel: 1,
    maxParticipants: 20,
    price: 0,
    status: 'active',
    description: '',
    requirements: '',
    equipment: []
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
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(props.isEdit ? '课程更新成功' : '课程创建成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style>