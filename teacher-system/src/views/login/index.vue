<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-banner">
        <div class="banner-title">办学无忧</div>
        <div class="banner-subtitle">校长经营赋能平台</div>
        <div class="banner-image"></div>
      </div>
      <div class="product-links">
        <div class="product-item">
          <el-icon><Shop /></el-icon>
          <div class="product-name">校宝收银宝</div>
          <div class="product-desc">学校收银利器</div>
        </div>
        <div class="product-item">
          <el-icon><School /></el-icon>
          <div class="product-name">校宝招生宝</div>
          <div class="product-desc">一站定服务</div>
        </div>
        <div class="product-item">
          <el-icon><ChatDotRound /></el-icon>
          <div class="product-name">校宝安心宝</div>
          <div class="product-desc">教育保险服务</div>
        </div>
      </div>
      <div class="contact-info">
        <div>咨询热线</div>
        <div class="phone">400-6999-707</div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-box">
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="手机号码登录" name="phone">
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
              <el-form-item prop="phone">
                <el-input
                  v-model="loginForm.phone"
                  placeholder="请输入手机号码"
                  size="large"
                  prefix-icon="Iphone"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <div class="form-footer">
                <el-checkbox v-model="rememberPassword">手机号码重置密码</el-checkbox>
                <el-link type="primary">如何登录？</el-link>
              </div>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
              <div class="other-login">
                <el-link type="info" icon="Lock">保存登录信息登录</el-link>
              </div>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="账号登录" name="account">
            <div class="empty-state">账号登录功能开发中...</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('phone')
const loading = ref(false)
const rememberPassword = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  phone: '18701538360',
  password: '1234567890'
})

const loginRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // Mock登录
        const token = 'mock-token-' + Date.now()
        const userInfo = {
          id: '1',
          username: loginForm.phone,
          name: '在线客服',
          role: 'teacher',
          phone: loginForm.phone,
          avatar: ''
        }

        userStore.setToken(token)
        userStore.setUserInfo(userInfo)

        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败，请检查账号密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px;
  color: white;
}

.login-banner {
  .banner-title {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .banner-subtitle {
    font-size: 32px;
    margin-bottom: 60px;
    opacity: 0.9;
  }

  .banner-image {
    width: 500px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }
}

.product-links {
  display: flex;
  gap: 40px;

  .product-item {
    text-align: center;

    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
      color: #ffd700;
    }

    .product-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .product-desc {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.contact-info {
  text-align: center;

  .phone {
    font-size: 28px;
    font-weight: bold;
    margin-top: 8px;
  }
}

.login-right {
  width: 500px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
}

.login-box {
  width: 360px;

  .login-tabs {
    :deep(.el-tabs__item) {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.login-form {
  margin-top: 32px;

  .el-form-item {
    margin-bottom: 24px;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 24px;
  }

  .other-login {
    text-align: center;
    margin-top: 16px;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
}
</style>
