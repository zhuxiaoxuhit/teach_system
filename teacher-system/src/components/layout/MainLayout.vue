<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo-container">
        <el-icon class="logo-icon"><School /></el-icon>
        <span v-if="!isCollapse" class="logo-text">校宝教务系统</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#1890ff"
        :router="true"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>

        <el-menu-item index="/recruitment">
          <el-icon><UserFilled /></el-icon>
          <template #title>招生中心</template>
        </el-menu-item>

        <el-sub-menu index="academic">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>教务中心</span>
          </template>
          <el-menu-item index="/academic/students">学员</el-menu-item>
          <el-menu-item index="/academic/classes">班级</el-menu-item>
          <el-menu-item index="/academic/schedule">排课</el-menu-item>
          <el-menu-item index="/academic/courses">课程</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/reports">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>报表中心</template>
        </el-menu-item>

        <el-sub-menu index="school-home">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>校家宝</span>
          </template>
          <el-menu-item index="/school-home/evaluation">课堂点评</el-menu-item>
          <el-menu-item index="/school-home/homework">作业</el-menu-item>
          <el-menu-item index="/school-home/notice">通知公告</el-menu-item>
          <el-menu-item index="/school-home/service">服务中心</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="management">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>内部管理</span>
          </template>
          <el-menu-item index="/management/employees">员工</el-menu-item>
          <el-menu-item index="/management/organization">组织架构</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="sidebar-footer">
        <el-avatar :size="40" :src="userStore.userInfo?.avatar">
          {{ userStore.userInfo?.name?.charAt(0) }}
        </el-avatar>
        <div v-if="!isCollapse" class="user-info">
          <div class="user-name">{{ userStore.userInfo?.name }}</div>
          <div class="user-role">{{ userStore.userInfo?.role }}</div>
        </div>
      </div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleSidebar">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.meta?.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown>
            <span class="campus-selector">
              校区书院 <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>朝阳校区</el-dropdown-item>
                <el-dropdown-item>海淀校区</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon"><FullScreen /></el-icon>
          </el-tooltip>

          <el-tooltip content="下载中心" placement="bottom">
            <el-icon class="header-icon"><Download /></el-icon>
          </el-tooltip>

          <el-tooltip content="帮助" placement="bottom">
            <el-icon class="header-icon"><QuestionFilled /></el-icon>
          </el-tooltip>

          <el-badge :value="3" class="header-icon">
            <el-icon><Bell /></el-icon>
          </el-badge>

          <el-tooltip content="消息中心" placement="bottom">
            <el-icon class="header-icon"><Message /></el-icon>
          </el-tooltip>

          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.name?.charAt(0) }}
              </el-avatar>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const sidebarWidth = computed(() => isCollapse.value ? '64px' : '200px')
const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
    } catch {
      // 取消
    }
  } else if (command === 'profile') {
    // 跳转个人中心
  } else if (command === 'settings') {
    // 跳转系统设置
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow-x: hidden;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo-icon {
      font-size: 28px;
      color: #1890ff;
    }

    .logo-text {
      font-size: 18px;
      font-weight: bold;
      white-space: nowrap;
    }
  }

  .el-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;
    overflow-x: hidden;

    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.65);

    .user-info {
      flex: 1;
      overflow: hidden;

      .user-name {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 4px;
      }
    }
  }
}

.header {
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      color: #666;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .campus-selector {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      color: #333;
      font-size: 14px;

      &:hover {
        color: #1890ff;
      }
    }

    .header-icon {
      font-size: 18px;
      cursor: pointer;
      color: #666;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .user-dropdown {
      cursor: pointer;
    }
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
