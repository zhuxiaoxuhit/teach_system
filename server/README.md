# 教育教务管理系统 - 后端服务

基于 Node.js + Express + MySQL 的 RESTful API 服务器

## 📋 环境要求

- **Node.js**: >= 18.x
- **MySQL**: >= 8.0
- **npm**: >= 9.x

## 🚀 快速开始

### 1. 安装 MySQL 数据库

#### macOS 安装方法：

```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 登录 MySQL（初次登录可能不需要密码）
mysql -u root
```

#### Windows 安装方法：

1. 访问 [MySQL 官网](https://dev.mysql.com/downloads/mysql/)
2. 下载 MySQL Community Server
3. 运行安装程序，设置 root 密码
4. 记住安装路径和端口（默认 3306）

### 2. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行以下命令：
source /Users/zhuxiaoxu/Documents/code/teach_system/server/schema.sql

# 或者直接导入：
mysql -u root -p < schema.sql
```

### 3. 配置环境变量

复制 `.env` 文件并修改数据库配置：

```bash
cd /Users/zhuxiaoxu/Documents/code/teach_system/server
cp .env .env.local  # 可选：创建本地配置
```

编辑 `.env` 文件，修改以下配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码  # ⚠️ 修改为你的实际密码
DB_NAME=teaching_system

# 服务器配置
PORT=8080

# JWT 密钥（建议修改为随机字符串）
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### 4. 安装依赖

```bash
cd /Users/zhuxiaoxu/Documents/code/teach_system/server
npm install
```

### 5. 启动服务器

#### 开发模式（自动重启）：
```bash
npm run dev
```

#### 生产模式：
```bash
npm start
```

启动成功后会看到：

```
✅ 数据库连接成功

🚀 服务器已启动
📍 地址: http://localhost:8080
📊 健康检查: http://localhost:8080/health
```

## 📁 项目结构

```
server/
├── config/              # 配置文件
│   └── db.js           # 数据库连接配置
├── routes/             # 路由文件
│   ├── auth.js         # 认证相关
│   ├── students.js     # 学员管理
│   ├── classes.js      # 班级管理
│   ├── records.js      # 上课记录
│   └── evaluations.js  # 课堂点评
├── index.js            # 主入口文件
├── schema.sql          # 数据库表结构
├── package.json        # 项目依赖
├── .env                # 环境配置
└── README.md           # 本文档
```

## 🔌 API 接口文档

### 基础信息

- **Base URL**: `http://localhost:8080/api`
- **数据格式**: JSON
- **认证方式**: JWT Token (Bearer Token)

### 1. 认证接口

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "18701538360",
  "password": "1234567890"
}

响应：
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "杨倩",
      "phone": "18701538360",
      "role": "teacher"
    }
  }
}
```

#### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### 2. 学员管理

#### 获取学员列表
```http
GET /api/students?page=1&pageSize=20&status=在读&campus=魏桥书院&keyword=张伟
```

#### 获取学员详情
```http
GET /api/students/:id
```

#### 创建学员
```http
POST /api/students
Content-Type: application/json

{
  "name": "张三",
  "gender": "男",
  "relation": "母亲",
  "phone": "13900000001",
  "birthday": "2015-05-20",
  "campus": "魏桥书院",
  "remark": "备注信息"
}
```

#### 更新学员
```http
PUT /api/students/:id
Content-Type: application/json

{
  "name": "张三",
  "status": "在读"
}
```

#### 删除学员
```http
DELETE /api/students/:id
```

### 3. 班级管理

#### 获取班级列表
```http
GET /api/classes?page=1&pageSize=20&status=开班在读&teacher=杨倩
```

#### 创建班级
```http
POST /api/classes
Content-Type: application/json

{
  "code": "01-农小硬笔-15:30",
  "capacity": 20,
  "teacher": "杨倩",
  "assistant": "助教1",
  "course": "农小硬笔暑托",
  "classroom": "1F教室1",
  "start_date": "2024-07-01",
  "remark": ""
}
```

#### 更新班级
```http
PUT /api/classes/:id
```

#### 删除班级
```http
DELETE /api/classes/:id
```

#### 结业班级
```http
POST /api/classes/:id/finish
```

### 4. 上课记录

#### 获取班级的上课记录
```http
GET /api/records/class/:classId?page=1&pageSize=20
```

#### 创建上课记录
```http
POST /api/records
Content-Type: application/json

{
  "class_id": 1,
  "date": "2024-11-22",
  "time": "15:30-17:00",
  "attendance_count": 12
}
```

#### 获取上课记录统计
```http
GET /api/records/:id/stats
```

### 5. 课堂点评

#### 获取某条上课记录的所有点评
```http
GET /api/evaluations/record/:recordId?page=1&pageSize=20
```

#### 获取某个学员的所有点评
```http
GET /api/evaluations/student/:studentId?page=1&pageSize=20
```

#### 创建点评
```http
POST /api/evaluations
Content-Type: application/json

{
  "record_id": 1,
  "student_id": 1,
  "content": "今天表现很好",
  "red_dots": 5,
  "created_by": "杨倩"
}
```

#### 批量创建点评
```http
POST /api/evaluations/batch
Content-Type: application/json

{
  "record_id": 1,
  "created_by": "杨倩",
  "evaluations": [
    {
      "student_id": 1,
      "content": "表现优秀",
      "red_dots": 5
    },
    {
      "student_id": 2,
      "content": "继续加油",
      "red_dots": 3
    }
  ]
}
```

#### 更新点评
```http
PUT /api/evaluations/:id
```

#### 删除点评
```http
DELETE /api/evaluations/:id
```

#### 标记为已读
```http
POST /api/evaluations/:id/read
```

## 🔧 测试接口

使用 curl 或 Postman 测试：

```bash
# 健康检查
curl http://localhost:8080/health

# 登录测试
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"18701538360","password":"1234567890"}'

# 获取学员列表
curl http://localhost:8080/api/students?page=1&pageSize=10
```

## 🗄️ 数据库说明

### 主要数据表

1. **users** - 用户表（教师/员工）
2. **students** - 学员表
3. **classes** - 班级表
4. **student_class** - 学员班级关联表
5. **class_records** - 上课记录表
6. **evaluations** - 课堂点评表
7. **homework** - 作业表
8. **notices** - 通知公告表

详细表结构见 `schema.sql` 文件。

## ⚠️ 常见问题

### 1. 数据库连接失败

**错误**: `❌ 数据库连接失败: Access denied for user 'root'@'localhost'`

**解决**:
- 检查 `.env` 文件中的 `DB_PASSWORD` 是否正确
- 确认 MySQL 服务是否正在运行：`brew services list` (macOS)
- 尝试重置 MySQL root 密码

### 2. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::8080`

**解决**:
- 修改 `.env` 文件中的 `PORT` 配置
- 或者停止占用 8080 端口的进程

### 3. 表不存在

**错误**: `Table 'teaching_system.students' doesn't exist`

**解决**:
```bash
# 重新导入数据库表结构
mysql -u root -p teaching_system < schema.sql
```

### 4. Node 版本过低

**错误**: `SyntaxError: Unexpected token '?'`

**解决**:
```bash
# 升级 Node.js
brew upgrade node  # macOS
# 或访问 https://nodejs.org/ 下载最新版本
```

## 🔐 安全建议

### 生产环境配置

1. **修改 JWT 密钥**：
   ```env
   JWT_SECRET=使用随机生成的复杂字符串
   ```

2. **使用强密码**：
   - 数据库密码至少 12 位
   - 包含大小写字母、数字、特殊字符

3. **启用 HTTPS**：
   - 使用 SSL 证书
   - 禁用 HTTP

4. **数据库权限**：
   - 创建专用数据库用户
   - 不要使用 root 用户

5. **环境变量**：
   - 不要提交 `.env` 文件到代码仓库
   - 使用 `.env.example` 作为模板

## 📊 性能优化

1. **数据库连接池**：已配置最大 10 个连接
2. **索引优化**：已在常用查询字段添加索引
3. **分页查询**：所有列表接口都支持分页
4. **SQL 注入防护**：使用参数化查询

## 🛠️ 开发调试

### 查看日志
服务器会自动打印所有请求日志：
```
2024-11-22T10:30:00.000Z - GET /api/students
2024-11-22T10:30:01.000Z - POST /api/auth/login
```

### 数据库调试
```bash
# 登录数据库
mysql -u root -p teaching_system

# 查看所有表
SHOW TABLES;

# 查看学员数据
SELECT * FROM students LIMIT 10;

# 查看班级数据
SELECT * FROM classes LIMIT 10;
```

## 📞 技术支持

如遇问题，请检查：
1. Node.js 版本是否 >= 18
2. MySQL 服务是否运行
3. 环境变量配置是否正确
4. 数据库表是否正确导入
5. 端口是否被占用

## 🔄 更新日志

### v1.0.0 (2024-11-22)
- ✅ 初始版本发布
- ✅ 完成认证模块
- ✅ 完成学员管理模块
- ✅ 完成班级管理模块
- ✅ 完成上课记录模块
- ✅ 完成课堂点评模块

---

**开发完成时间**: 2024-11-22
**服务器地址**: http://localhost:8080
**健康检查**: http://localhost:8080/health
