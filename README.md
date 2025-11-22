# 教务管理系统

基于 Vue 3、Node.js 和 MySQL 构建的全栈教育管理系统。

## 技术栈

### 前端
- Vue 3.5 + TypeScript
- Element Plus UI 框架
- Pinia 状态管理
- Vue Router 路由管理
- Axios HTTP 客户端
- ECharts 数据可视化
- Vite 构建工具

### 后端
- Node.js 18+
- Express 4
- MySQL 8.0
- JWT 身份认证
- bcrypt 密码加密

## 功能特性

### 教务管理
- 学员管理：学员档案的增删改查，支持筛选和分页
- 班级管理：班级管理、教师分配、学员跟踪
- 排课管理：课程安排与日历视图
- 课程管理：课程目录和课程管理

### 家校互动
- 课堂点评：教师反馈和表现跟踪
- 作业管理：作业发布和提交跟踪
- 通知公告：通知发送和公告栏
- 服务中心：家长反馈和课程评价

### 报表统计
- 招生报表：学员注册分析
- 教务报表：考勤和课时统计
- 财务报表：费用收取和欠费跟踪
- 经营分析：多维度数据分析

### 内部管理
- 员工管理：教师档案和角色权限
- 组织架构：部门层级管理

## 项目结构

```
teach_system/
├── teacher-system/          前端应用
│   ├── src/
│   │   ├── api/            API 接口层
│   │   ├── components/     可复用组件
│   │   ├── router/         路由配置
│   │   ├── store/          状态管理
│   │   ├── styles/         全局样式
│   │   ├── utils/          工具函数
│   │   └── views/          页面组件
│   └── package.json
├── server/                  后端应用
│   ├── config/             配置文件
│   │   └── db.js           数据库连接
│   ├── routes/             API 路由
│   │   ├── auth.js         认证接口
│   │   ├── students.js     学员管理
│   │   ├── classes.js      班级管理
│   │   ├── records.js      上课记录
│   │   └── evaluations.js  课堂点评
│   ├── index.js            服务器入口
│   ├── schema.sql          数据库表结构
│   └── package.json
└── README.md
```

## 数据库设计

系统使用 8 个核心数据表：

- users：教师和员工账户
- students：学员信息和注册
- classes：班级详情和排课
- student_class：学员班级关联
- class_records：上课记录
- evaluations：教师点评和反馈
- homework：作业管理
- notices：通知公告

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### 安装步骤

1. 安装并启动 MySQL

```bash
# macOS
brew install mysql
brew services start mysql

# 如需设置 root 密码
mysql_secure_installation
```

2. 创建数据库和表

```bash
mysql -u root < server/schema.sql
```

3. 配置环境变量

编辑 `server/.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=teaching_system
PORT=8080
JWT_SECRET=your_jwt_secret_key
```

4. 安装依赖

```bash
# 后端
cd server
npm install

# 前端
cd ../teacher-system
npm install
```

5. 启动服务

终端 1 - 后端服务：
```bash
cd server
npm run dev
```

终端 2 - 前端服务：
```bash
cd teacher-system
npm run dev
```

6. 访问系统

- 前端地址：http://localhost:3000
- 后端 API：http://localhost:8080
- 健康检查：http://localhost:8080/health

默认登录账号：
- 手机号：18701538360
- 密码：1234567890

## 启动完整系统

### 快速启动（所有服务）

启动包含所有模块的完整系统：

1. 启动 MySQL 服务（如果未运行）：
```bash
brew services start mysql
```

2. 打开两个终端窗口：

终端 1 - 启动后端：
```bash
cd /Users/zhuxiaoxu/Documents/code/teach_system/server
npm run dev
```

终端 2 - 启动前端：
```bash
cd /Users/zhuxiaoxu/Documents/code/teach_system/teacher-system
npm run dev
```

3. 验证服务运行状态：
- 前端：http://localhost:3000
- 后端：http://localhost:8080/health
- MySQL：后端终端会显示连接状态

### 服务状态检查

检查 MySQL 是否运行：
```bash
brew services list | grep mysql
```

检查端口占用：
```bash
lsof -i :3000  # 前端
lsof -i :8080  # 后端
lsof -i :3306  # MySQL
```

### 停止服务

停止前端（在终端 2）：按 Ctrl+C

停止后端（在终端 1）：按 Ctrl+C

停止 MySQL：
```bash
brew services stop mysql
```

## 数据库查询

### 连接数据库

连接 MySQL：
```bash
mysql -u root
```

选择数据库：
```bash
USE teaching_system;
```

或直接连接：
```bash
mysql -u root teaching_system
```

### 常用查询命令

查看所有表：
```bash
mysql -u root -e "USE teaching_system; SHOW TABLES;"
```

查看所有学员：
```bash
mysql -u root -e "USE teaching_system; SELECT * FROM students;"
```

统计学员数量：
```bash
mysql -u root -e "USE teaching_system; SELECT COUNT(*) as total FROM students;"
```

查看所有班级：
```bash
mysql -u root -e "USE teaching_system; SELECT * FROM classes;"
```

查看所有用户（教师）：
```bash
mysql -u root -e "USE teaching_system; SELECT id, name, phone, role FROM users;"
```

查看学员详情：
```bash
mysql -u root -e "USE teaching_system; SELECT id, name, gender, phone, campus, status FROM students;"
```

查看班级详情：
```bash
mysql -u root -e "USE teaching_system; SELECT id, code, teacher, course, student_count, capacity, status FROM classes;"
```

按姓名搜索学员：
```bash
mysql -u root -e "USE teaching_system; SELECT * FROM students WHERE name LIKE '%张%';"
```

查看最近记录：
```bash
mysql -u root -e "USE teaching_system; SELECT * FROM students ORDER BY created_at DESC LIMIT 10;"
```

### 交互式查询

进入 MySQL 交互式界面：
```bash
mysql -u root teaching_system
```

执行查询：
```sql
-- 查看所有学员
SELECT * FROM students;

-- 查看班级和教师信息
SELECT code, teacher, course, student_count, status FROM classes;

-- 按状态统计
SELECT status, COUNT(*) as count FROM students GROUP BY status;

-- 查找某班级的学员
SELECT s.name, s.phone, sc.join_date
FROM students s
JOIN student_class sc ON s.id = sc.student_id
WHERE sc.class_id = 1;

-- 退出 MySQL
EXIT;
```

### 数据库备份

备份整个数据库：
```bash
mysqldump -u root teaching_system > backup_$(date +%Y%m%d).sql
```

从备份恢复：
```bash
mysql -u root teaching_system < backup_20241122.sql
```

## API 接口文档

### 认证接口

```
POST   /api/auth/login          用户登录
GET    /api/auth/me             获取当前用户
```

### 学员管理

```
GET    /api/students            获取学员列表（支持分页和筛选）
GET    /api/students/:id        获取学员详情
POST   /api/students            创建学员
PUT    /api/students/:id        更新学员
DELETE /api/students/:id        删除学员
```

### 班级管理

```
GET    /api/classes             获取班级列表
GET    /api/classes/:id         获取班级详情
POST   /api/classes             创建班级
PUT    /api/classes/:id         更新班级
DELETE /api/classes/:id         删除班级
POST   /api/classes/:id/finish  班级结业
```

### 上课记录

```
GET    /api/records/class/:id   获取班级上课记录
POST   /api/records             创建上课记录
PUT    /api/records/:id         更新记录
GET    /api/records/:id/stats   获取统计数据
```

### 课堂点评

```
GET    /api/evaluations/record/:id    获取某次课的点评
GET    /api/evaluations/student/:id   获取某学员的点评
POST   /api/evaluations                创建点评
POST   /api/evaluations/batch          批量创建点评
PUT    /api/evaluations/:id            更新点评
POST   /api/evaluations/:id/read       标记为已读
DELETE /api/evaluations/:id            删除点评
```

## 开发指南

### 前端开发

```bash
cd teacher-system
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run preview      # 预览生产构建
```

### 后端开发

```bash
cd server
npm run dev          # 启动开发服务器（自动重启）
npm start            # 启动生产服务器
```

### 数据库管理

```bash
# 连接数据库
mysql -u root

# 切换数据库
USE teaching_system;

# 查看表
SHOW TABLES;

# 查询数据
SELECT * FROM students LIMIT 10;
SELECT * FROM classes LIMIT 10;
```

## 系统架构

```
浏览器 (localhost:3000)
    |
    | HTTP 请求
    v
Vue 3 前端
    |
    | REST API
    v
Express 后端 (localhost:8080)
    |
    | SQL 查询
    v
MySQL 数据库 (localhost:3306)
```

## 核心功能实现

### 身份认证
- 基于 JWT 的 Token 认证
- Token 存储在 localStorage
- 路由守卫保护页面
- 自动 Token 刷新

### 数据持久化
- MySQL 可靠数据存储
- 连接池提升性能
- 参数化查询防止 SQL 注入
- 事务支持保证数据完整性

### API 设计
- RESTful API 架构
- 统一响应格式
- 完善的错误处理
- 请求日志记录

### 前端架构
- 组件化设计
- 集中状态管理
- 路由懒加载
- 响应式布局

## 生产环境部署

生产环境部署步骤：

1. 构建前端：`cd teacher-system && npm run build`
2. 配置反向代理（nginx/apache）
3. 设置 MySQL 安全配置
4. 使用环境变量管理敏感数据
5. 启用 HTTPS
6. 配置日志和监控

## 安全考虑

- 使用 bcrypt 加密密码
- JWT Token 无状态认证
- 参数化查询防止 SQL 注入
- 配置 CORS 限制来源
- 前后端双重输入验证
- 生产环境建议启用请求限流

## 性能优化

- 数据库索引优化高频查询字段
- 连接池提升数据库效率
- 大数据集分页处理
- 路由和组件懒加载
- 静态数据缓存策略

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 开源协议

MIT

## 版本信息

当前版本：2.0.0
发布日期：2024-11-22
