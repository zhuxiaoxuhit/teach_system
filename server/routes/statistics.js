const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取招生统计数据
router.get('/recruitment', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 新增咨询（使用学员创建时间）
    const [consultData] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM students
      WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND created_at <= COALESCE(?, NOW())
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [startDate, endDate]);

    // 招生人数
    const [enrollmentData] = await pool.query(`
      SELECT COUNT(*) as total FROM students
      WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND created_at <= COALESCE(?, NOW())
    `, [startDate, endDate]);

    // 学员状态分布
    const [statusData] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM students
      GROUP BY status
    `);

    res.json({
      code: 200,
      data: {
        consultations: consultData,
        enrollmentTotal: enrollmentData[0].total,
        statusDistribution: statusData
      }
    });
  } catch (error) {
    console.error('获取招生统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取教务统计数据
router.get('/academic', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 在读学员数
    const [activeStudents] = await pool.query(`
      SELECT COUNT(*) as total FROM students WHERE status = '在读'
    `);

    // 班级统计
    const [classStats] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(student_count) as total_students,
        SUM(capacity) as total_capacity
      FROM classes
      WHERE status = '开班在读'
    `);

    // 上课记录统计
    const [recordStats] = await pool.query(`
      SELECT DATE(date) as date, COUNT(*) as count
      FROM class_records
      WHERE date >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND date <= COALESCE(?, NOW())
      GROUP BY DATE(date)
      ORDER BY date
    `, [startDate, endDate]);

    res.json({
      code: 200,
      data: {
        activeStudentsCount: activeStudents[0].total,
        classStats: classStats[0],
        classRecords: recordStats
      }
    });
  } catch (error) {
    console.error('获取教务统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取财务统计数据
router.get('/finance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 欠费统计
    const [debtStats] = await pool.query(`
      SELECT
        COUNT(*) as count,
        SUM(balance) as total
      FROM students
      WHERE balance > 0
    `);

    // 学员余额分布
    const [balanceDistribution] = await pool.query(`
      SELECT
        CASE
          WHEN balance = 0 THEN '无欠费'
          WHEN balance > 0 THEN '有欠费'
        END as type,
        COUNT(*) as count
      FROM students
      GROUP BY type
    `);

    res.json({
      code: 200,
      data: {
        debtCount: debtStats[0].count,
        debtTotal: parseFloat(debtStats[0].total || 0),
        balanceDistribution
      }
    });
  } catch (error) {
    console.error('获取财务统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取综合统计数据（仪表盘）
router.get('/dashboard', async (req, res) => {
  try {
    // 学员总数
    const [studentCount] = await pool.query('SELECT COUNT(*) as total FROM students');

    // 在读学员数
    const [activeStudentCount] = await pool.query(`
      SELECT COUNT(*) as total FROM students WHERE status = '在读'
    `);

    // 班级总数
    const [classCount] = await pool.query('SELECT COUNT(*) as total FROM classes');

    // 在读班级数
    const [activeClassCount] = await pool.query(`
      SELECT COUNT(*) as total FROM classes WHERE status = '开班在读'
    `);

    // 本月新增学员
    const [monthlyNewStudents] = await pool.query(`
      SELECT COUNT(*) as total FROM students
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    res.json({
      code: 200,
      data: {
        totalStudents: studentCount[0].total,
        activeStudents: activeStudentCount[0].total,
        totalClasses: classCount[0].total,
        activeClasses: activeClassCount[0].total,
        monthlyNewStudents: monthlyNewStudents[0].total
      }
    });
  } catch (error) {
    console.error('获取综合统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
