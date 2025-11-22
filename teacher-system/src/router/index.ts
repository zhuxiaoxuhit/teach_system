import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'HomeFilled' }
      },
      {
        path: 'recruitment',
        name: 'Recruitment',
        component: () => import('../views/recruitment/index.vue'),
        meta: { title: '招生中心', icon: 'UserFilled' }
      },
      {
        path: 'academic',
        name: 'Academic',
        redirect: '/academic/students',
        meta: { title: '教务中心', icon: 'Reading' },
        children: [
          {
            path: 'students',
            name: 'Students',
            component: () => import('../views/academic/students/index.vue'),
            meta: { title: '学员', icon: 'User' }
          },
          {
            path: 'classes',
            name: 'Classes',
            component: () => import('../views/academic/classes/index.vue'),
            meta: { title: '班级', icon: 'Files' }
          },
          {
            path: 'schedule',
            name: 'Schedule',
            component: () => import('../views/academic/schedule/index.vue'),
            meta: { title: '排课', icon: 'Calendar' }
          },
          {
            path: 'courses',
            name: 'Courses',
            component: () => import('../views/academic/courses/index.vue'),
            meta: { title: '课程', icon: 'Document' }
          }
        ]
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/reports/index.vue'),
        meta: { title: '报表中心', icon: 'DataAnalysis' }
      },
      {
        path: 'school-home',
        name: 'SchoolHome',
        redirect: '/school-home/evaluation',
        meta: { title: '校家宝', icon: 'ChatDotRound' },
        children: [
          {
            path: 'evaluation',
            name: 'ClassEvaluation',
            component: () => import('../views/school-home/evaluation/index.vue'),
            meta: { title: '课堂点评' }
          },
          {
            path: 'homework',
            name: 'Homework',
            component: () => import('../views/school-home/homework/index.vue'),
            meta: { title: '作业' }
          },
          {
            path: 'notice',
            name: 'Notice',
            component: () => import('../views/school-home/notice/index.vue'),
            meta: { title: '通知公告' }
          },
          {
            path: 'service',
            name: 'ServiceCenter',
            component: () => import('../views/school-home/service/index.vue'),
            meta: { title: '服务中心' }
          }
        ]
      },
      {
        path: 'management',
        name: 'Management',
        redirect: '/management/employees',
        meta: { title: '内部管理', icon: 'Setting' },
        children: [
          {
            path: 'employees',
            name: 'Employees',
            component: () => import('../views/management/employees/index.vue'),
            meta: { title: '员工' }
          },
          {
            path: 'organization',
            name: 'Organization',
            component: () => import('../views/management/organization/index.vue'),
            meta: { title: '组织架构' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
