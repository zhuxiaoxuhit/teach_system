const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取班级的上课记录列表
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // 获取总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM class_records WHERE class_id = ?',
      [classId]
    );
    const total = countResult[0].total;

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [records] = await pool.query(
      `SELECT * FROM class_records
       WHERE class_id = ?
       ORDER BY date DESC
       LIMIT ? OFFSET ?`,
      [classId, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: records,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取上课记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建上课记录
router.post('/', async (req, res) => {
  try {
    const {
      class_id,
      date,
      time,
      attendance_count = 0
    } = req.body;

    if (!class_id || !date) {
      return res.status(400).json({
        code: 400,
        message: '班级ID和上课日期不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO class_records (class_id, date, time, attendance_count, status)
       VALUES (?, ?, ?, ?, '进行中')`,
      [class_id, date, time, attendance_count]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建上课记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新上课记录
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      time,
      attendance_count,
      evaluated_count,
      unevaluated_count,
      status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE class_records SET
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        attendance_count = COALESCE(?, attendance_count),
        evaluated_count = COALESCE(?, evaluated_count),
        unevaluated_count = COALESCE(?, unevaluated_count),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [date, time, attendance_count, evaluated_count, unevaluated_count, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '上课记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新上课记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取上课记录的点评统计
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取记录详情
    const [records] = await pool.query(
      'SELECT * FROM class_records WHERE id = ?',
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '上课记录不存在'
      });
    }

    // 获取点评统计
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total_evaluations,
        COUNT(CASE WHEN is_read = 1 THEN 1 END) as read_count,
        SUM(red_dots) as total_red_dots
       FROM evaluations
       WHERE record_id = ?`,
      [id]
    );

    res.json({
      code: 200,
      data: {
        record: records[0],
        stats: stats[0]
      }
    });
  } catch (error) {
    console.error('获取点评统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
