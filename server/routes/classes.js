const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取班级列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      teacher,
      keyword
    } = req.query;

    let sql = 'SELECT * FROM classes WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (teacher) {
      sql += ' AND teacher = ?';
      params.push(teacher);
    }

    if (keyword) {
      sql += ' AND (code LIKE ? OR course LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总数
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [classes] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: classes,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取班级列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个班级详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [classes] = await pool.query(
      'SELECT * FROM classes WHERE id = ?',
      [id]
    );

    if (classes.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '班级不存在'
      });
    }

    res.json({
      code: 200,
      data: classes[0]
    });
  } catch (error) {
    console.error('获取班级详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建班级
router.post('/', async (req, res) => {
  try {
    const {
      code,
      capacity = 20,
      teacher,
      assistant = '-',
      course,
      classroom,
      start_date,
      end_date,
      remark = ''
    } = req.body;

    if (!code || !teacher || !course) {
      return res.status(400).json({
        code: 400,
        message: '班级名称、班主任和课程不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO classes (code, capacity, teacher, assistant, course, classroom, start_date, end_date, remark, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '开班在读')`,
      [code, capacity, teacher, assistant, course, classroom, start_date, end_date, remark]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建班级错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新班级
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      capacity,
      teacher,
      assistant,
      course,
      classroom,
      start_date,
      end_date,
      status,
      remark
    } = req.body;

    const [result] = await pool.query(
      `UPDATE classes SET
        code = COALESCE(?, code),
        capacity = COALESCE(?, capacity),
        teacher = COALESCE(?, teacher),
        assistant = COALESCE(?, assistant),
        course = COALESCE(?, course),
        classroom = COALESCE(?, classroom),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status),
        remark = COALESCE(?, remark)
       WHERE id = ?`,
      [code, capacity, teacher, assistant, course, classroom, start_date, end_date, status, remark, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '班级不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新班级错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除班级
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM classes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '班级不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除班级错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 结业班级
router.post('/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE classes SET status = '已结业', end_date = CURDATE() WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '班级不存在'
      });
    }

    res.json({
      code: 200,
      message: '结业成功'
    });
  } catch (error) {
    console.error('结业班级错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
