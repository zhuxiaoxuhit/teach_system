const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取学员报读列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      student_id,
      course_id,
      status,
      keyword
    } = req.query;

    let sql = `
      SELECT
        e.*,
        s.name as student_name,
        c.name as course_name,
        cl.code as class_code
      FROM student_enrollments e
      LEFT JOIN students s ON e.student_id = s.id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN classes cl ON e.class_id = cl.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      sql += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (course_id) {
      sql += ' AND e.course_id = ?';
      params.push(course_id);
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (keyword) {
      sql += ' AND (s.name LIKE ? OR c.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [enrollments] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: enrollments,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取报读列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个报读记录详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [enrollments] = await pool.query(
      `SELECT
        e.*,
        s.name as student_name,
        c.name as course_name,
        cl.code as class_code
       FROM student_enrollments e
       LEFT JOIN students s ON e.student_id = s.id
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN classes cl ON e.class_id = cl.id
       WHERE e.id = ?`,
      [id]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '报读记录不存在'
      });
    }

    res.json({
      code: 200,
      data: enrollments[0]
    });
  } catch (error) {
    console.error('获取报读详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建报读记录
router.post('/', async (req, res) => {
  try {
    const {
      student_id,
      course_id,
      class_id,
      teacher,
      charge_mode,
      total_lessons = 0,
      used_lessons = 0,
      remaining_lessons = 0,
      effective_lessons = 0,
      total_amount = 0,
      paid_amount = 0,
      refund_amount = 0,
      remaining_amount = 0,
      arrears = 0,
      status = '在读',
      enroll_date,
      remark = ''
    } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({
        code: 400,
        message: '学员和课程不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO student_enrollments (
        student_id, course_id, class_id, teacher, charge_mode,
        total_lessons, used_lessons, remaining_lessons, effective_lessons,
        total_amount, paid_amount, refund_amount, remaining_amount, arrears,
        status, enroll_date, remark
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id, course_id, class_id, teacher, charge_mode,
        total_lessons, used_lessons, remaining_lessons, effective_lessons,
        total_amount, paid_amount, refund_amount, remaining_amount, arrears,
        status, enroll_date, remark
      ]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建报读记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新报读记录
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id,
      course_id,
      class_id,
      teacher,
      charge_mode,
      total_lessons,
      used_lessons,
      remaining_lessons,
      effective_lessons,
      total_amount,
      paid_amount,
      refund_amount,
      remaining_amount,
      arrears,
      status,
      enroll_date,
      remark
    } = req.body;

    const [result] = await pool.query(
      `UPDATE student_enrollments SET
        student_id = COALESCE(?, student_id),
        course_id = COALESCE(?, course_id),
        class_id = COALESCE(?, class_id),
        teacher = COALESCE(?, teacher),
        charge_mode = COALESCE(?, charge_mode),
        total_lessons = COALESCE(?, total_lessons),
        used_lessons = COALESCE(?, used_lessons),
        remaining_lessons = COALESCE(?, remaining_lessons),
        effective_lessons = COALESCE(?, effective_lessons),
        total_amount = COALESCE(?, total_amount),
        paid_amount = COALESCE(?, paid_amount),
        refund_amount = COALESCE(?, refund_amount),
        remaining_amount = COALESCE(?, remaining_amount),
        arrears = COALESCE(?, arrears),
        status = COALESCE(?, status),
        enroll_date = COALESCE(?, enroll_date),
        remark = COALESCE(?, remark)
       WHERE id = ?`,
      [
        student_id, course_id, class_id, teacher, charge_mode,
        total_lessons, used_lessons, remaining_lessons, effective_lessons,
        total_amount, paid_amount, refund_amount, remaining_amount, arrears,
        status, enroll_date, remark, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '报读记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新报读记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除报读记录
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM student_enrollments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '报读记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除报读记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
