const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取分班操作日志列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      operationType,
      keyword
    } = req.query;

    let sql = `
      SELECT sca.*
      FROM student_class_assignments sca
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      sql += ' AND DATE(sca.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (operationType) {
      sql += ' AND sca.operation_type = ?';
      params.push(operationType);
    }

    if (keyword) {
      sql += ' AND (sca.student_name LIKE ? OR sca.class_name LIKE ? OR sca.operator LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const countSql = sql.replace('SELECT sca.*', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY sca.created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [assignments] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: assignments,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取分班日志错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个学员的分班历史
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // 获取总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM student_class_assignments WHERE student_id = ?',
      [studentId]
    );
    const total = countResult[0].total;

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [assignments] = await pool.query(
      `SELECT * FROM student_class_assignments
       WHERE student_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [studentId, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: assignments,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取学员分班历史错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取班级的分班历史
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // 获取总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM student_class_assignments WHERE class_id = ?',
      [classId]
    );
    const total = countResult[0].total;

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [assignments] = await pool.query(
      `SELECT * FROM student_class_assignments
       WHERE class_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [classId, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: assignments,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取班级分班历史错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 导出分班日志
router.get('/export', async (req, res) => {
  try {
    const { startDate, endDate, operationType } = req.query;

    let sql = 'SELECT * FROM student_class_assignments WHERE 1=1';
    const params = [];

    if (startDate && endDate) {
      sql += ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (operationType) {
      sql += ' AND operation_type = ?';
      params.push(operationType);
    }

    sql += ' ORDER BY created_at DESC';

    const [assignments] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: assignments
    });
  } catch (error) {
    console.error('导出分班日志错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
