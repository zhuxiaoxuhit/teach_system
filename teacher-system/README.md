# 校宝教务管理系统 - 教师端

一个功能完善的教育教务管理系统，基于 Vue 3 + TypeScript + Element Plus 开发。

## 功能特性

### 核心模块

1. **工作台**
   - 待办事项提醒（到期学员、欠费、待点评作业等）
   - 常用功能快捷入口
   - 数据统计图表
   - 产品动态展示

2. **教务中心**
   - **学员管理**：学员信息维护、花名册、分班列表
   - **班级管理**：组织班级、分组明细
   - **排课管理**：周视图、日程列表、冲突管理
   - **课程管理**：课程创建和维护

3. **校家宝**
   - **课堂点评**：班级点评、课堂评价
   - **作业管理**：布置作业、查看提交、点评作业
   - **通知公告**：群发通知、模板库、阅读率统计
   - **服务中心**：家长申请、意见反馈、课程评价

4. **招生中心**
   - 活动秀场
   - 招生统计
   - 推广管理

5. **报表中心**
   - 校区经营分析
   - 教务报表
   - 财务报表
   - 数据可视化

6. **内部管理**
   - 员工管理
   - 组织架构

## 技术栈

- **前端框架**：Vue 3.5
- **开发语言**：TypeScript
- **UI 组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP 客户端**：Axios
- **数据可视化**：ECharts
- **构建工具**：Vite
- **样式预处理**：Sass

## 项目结构

```
teacher-system/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   │   ├── common/      # 公共组件
│   │   └── layout/      # 布局组件
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── styles/          # 全局样式
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   │   ├── dashboard/   # 工作台
│   │   ├── academic/    # 教务中心
│   │   ├── school-home/ # 校家宝
│   │   ├── recruitment/ # 招生中心
│   │   ├── reports/     # 报表中心
│   │   └── management/  # 内部管理
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── public/              # 公共资源
├── .env                 # 环境变量
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── tsconfig.json        # TS 配置
├── vite.config.ts       # Vite 配置
└── README.md            # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 默认登录账号

- 手机号：18701538360
- 密码：1234567890

## 主要功能说明

### 1. 登录系统

- 支持手机号密码登录
- 登录状态持久化
- 路由守卫自动跳转

### 2. 权限管理

- 基于路由的权限控制
- 菜单动态渲染
- 登录状态验证

### 3. 数据交互

- 统一的 API 请求封装
- 请求/响应拦截器
- 错误统一处理
- Token 自动注入

### 4. 界面设计

- 响应式布局
- 侧边栏折叠
- 面包屑导航
- 多标签页支持（可扩展）

## 开发规范

### 组件命名

- 使用 PascalCase 命名组件
- 文件名与组件名保持一致

### 样式规范

- 使用 scoped 样式
- 使用 SCSS 变量统一主题
- 遵循 BEM 命名规范

### TypeScript

- 严格类型检查
- 定义清晰的接口
- 避免使用 any

## 参考文档

- [Vue 3](https://cn.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [ECharts](https://echarts.apache.org/)
- [Vite](https://vitejs.dev/)

## 许可证

MIT License
