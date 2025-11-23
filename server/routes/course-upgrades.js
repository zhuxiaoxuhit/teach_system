const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取升期关系列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;

    let sql = 'SELECT * FROM course_upgrade_relations WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND name LIKE ?';
      params.push(`%${keyword}%`);
    }

    // 获取总数
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [relations] = await pool.query(sql, params);

    // 为每个关系获取期数和课程数
    for (let relation of relations) {
      const [details] = await pool.query(
        'SELECT COUNT(DISTINCT period_number) as period_count, COUNT(*) as course_count FROM course_upgrade_details WHERE relation_id = ?',
        [relation.id]
      );
      relation.period_count = details[0].period_count;
      relation.course_count = details[0].course_count;
    }

    res.json({
      code: 200,
      data: {
        list: relations,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取升期关系列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个升期关系详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [relations] = await pool.query(
      'SELECT * FROM course_upgrade_relations WHERE id = ?',
      [id]
    );

    if (relations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '升期关系不存在'
      });
    }

    const relation = relations[0];

    // 获取详情
    const [details] = await pool.query(
      `SELECT d.*, c.name as course_name
       FROM course_upgrade_details d
       LEFT JOIN courses c ON d.course_id = c.id
       WHERE d.relation_id = ?
       ORDER BY d.period_number`,
      [id]
    );

    relation.details = details;

    res.json({
      code: 200,
      data: relation
    });
  } catch (error) {
    console.error('获取升期关系详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建升期关系
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { name, description, details } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '升期关系名称不能为空'
      });
    }

    // 创建升期关系
    const [result] = await connection.query(
      'INSERT INTO course_upgrade_relations (name, description) VALUES (?, ?)',
      [name, description]
    );

    const relationId = result.insertId;

    // 创建详情
    if (details && details.length > 0) {
      for (let detail of details) {
        await connection.query(
          'INSERT INTO course_upgrade_details (relation_id, period_number, course_id) VALUES (?, ?, ?)',
          [relationId, detail.period_number, detail.course_id]
        );
      }
    }

    await connection.commit();

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: relationId
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('创建升期关系错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  } finally {
    connection.release();
  }
});

// 更新升期关系
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { name, description, details } = req.body;

    // 更新基本信息
    const [result] = await connection.query(
      `UPDATE course_upgrade_relations SET
        name = COALESCE(?, name),
        description = COALESCE(?, description)
       WHERE id = ?`,
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        code: 404,
        message: '升期关系不存在'
      });
    }

    // 如果提供了详情，先删除旧的再插入新的
    if (details) {
      await connection.query('DELETE FROM course_upgrade_details WHERE relation_id = ?', [id]);

      for (let detail of details) {
        await connection.query(
          'INSERT INTO course_upgrade_details (relation_id, period_number, course_id) VALUES (?, ?, ?)',
          [id, detail.period_number, detail.course_id]
        );
      }
    }

    await connection.commit();

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    await connection.rollback();
    console.error('更新升期关系错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  } finally {
    connection.release();
  }
});

// 删除升期关系
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM course_upgrade_relations WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '升期关系不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除升期关系错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
