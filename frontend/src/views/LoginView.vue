<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/logo.png" alt="Logo" class="logo" />
        <h1 class="title">健身房管理系统</h1>
        <p class="subtitle">多品牌健身房连锁管理平台</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="authStore.loading"
            @click="handleLogin"
          >
            {{ authStore.loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="form-footer">
            <span>没有账号？</span>
            <el-link type="primary" @click="showRegister = true">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- Background decoration -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
    
    <!-- Register Modal -->
    <el-dialog
      v-model="showRegister"
      title="用户注册"
      width="480px"
      :before-close="handleCloseRegister"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号（可选）" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRegister = false">取消</el-button>
          <el-button type="primary" :loading="authStore.loading" @click="handleRegister">
            注册
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Refs
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// State
const rememberMe = ref(false)
const showRegister = ref(false)

// Login form
const loginForm = reactive({
  username: '',
  password: '',
})

// Register form
const registerForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

// Validation rules
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '真实姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// Methods
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await authStore.login(loginForm)
      
      // Remember me functionality
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await authStore.register({
        username: registerForm.username,
        realName: registerForm.realName,
        email: registerForm.email,
        phone: registerForm.phone || undefined,
        password: registerForm.password,
      })
      
      showRegister.value = false
      router.push('/dashboard')
    } catch (error) {
      console.error('Register failed:', error)
    }
  })
}

const handleCloseRegister = () => {
  showRegister.value = false
  registerFormRef.value?.resetFields()
}

// Load remembered username
onMounted(() => {
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    rememberMe.value = true
  }
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }
  
  .title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.login-form {
  .login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 24px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  }
}

.form-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  :deep(.el-checkbox__label) {
    font-size: 14px;
    color: #666;
  }
}

.form-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
  
  span {
    margin-right: 5px;
  }
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  
  &.circle-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
    animation: float 6s ease-in-out infinite;
  }
  
  &.circle-2 {
    width: 150px;
    height: 150px;
    bottom: -75px;
    left: -75px;
    animation: float 8s ease-in-out infinite reverse;
  }
  
  &.circle-3 {
    width: 100px;
    height: 100px;
    top: 50%;
    left: -50px;
    animation: float 10s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// Responsive design
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
    margin: 10px;
    
    .login-header {
      .title {
        font-size: 24px;
      }
      
      .logo {
        width: 50px;
        height: 50px;
      }
    }
  }
}

// Dialog styling
:deep(.el-dialog) {
  border-radius: 16px;
  
  .el-dialog__header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
}

.dialog-footer {
  .el-button {
    min-width: 80px;
  }
}
</style>