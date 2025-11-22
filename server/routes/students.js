const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取学员列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      campus,
      gender,
      keyword
    } = req.query;

    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (campus) {
      sql += ' AND campus = ?';
      params.push(campus);
    }

    if (gender) {
      sql += ' AND gender = ?';
      params.push(gender);
    }

    if (keyword) {
      sql += ' AND (name LIKE ? OR phone LIKE ?)';
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

    const [students] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: students,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取学员列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个学员详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.query(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '学员不存在'
      });
    }

    res.json({
      code: 200,
      data: students[0]
    });
  } catch (error) {
    console.error('获取学员详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建学员
router.post('/', async (req, res) => {
  try {
    const {
      name,
      gender = '男',
      relation = '母亲',
      phone,
      birthday,
      campus = '魏桥书院',
      remark = ''
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        code: 400,
        message: '学员姓名和联系电话不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO students (name, gender, relation, phone, birthday, campus, remark, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, '在读')`,
      [name, gender, relation, phone, birthday, campus, remark]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建学员错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新学员
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      gender,
      relation,
      phone,
      birthday,
      campus,
      remark,
      status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE students SET
        name = COALESCE(?, name),
        gender = COALESCE(?, gender),
        relation = COALESCE(?, relation),
        phone = COALESCE(?, phone),
        birthday = COALESCE(?, birthday),
        campus = COALESCE(?, campus),
        remark = COALESCE(?, remark),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, gender, relation, phone, birthday, campus, remark, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '学员不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新学员错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除学员
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM students WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '学员不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除学员错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
