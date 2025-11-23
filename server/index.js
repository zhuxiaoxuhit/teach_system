const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

// 导入路由
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const classAssignmentRoutes = require('./routes/class-assignments');
const recordRoutes = require('./routes/records');
const evaluationRoutes = require('./routes/evaluations');
const statisticsRoutes = require('./routes/statistics');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const courseUpgradeRoutes = require('./routes/course-upgrades');
const scheduleRoutes = require('./routes/schedules');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/class-assignments', classAssignmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/course-upgrades', courseUpgradeRoutes);
app.use('/api/schedules', scheduleRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  数据库连接失败，但服务器将继续启动');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health\n`);
  });
}

startServer();
