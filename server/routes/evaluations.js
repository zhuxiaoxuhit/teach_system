const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取某条上课记录的所有点评
router.get('/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // 获取总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM evaluations WHERE record_id = ?',
      [recordId]
    );
    const total = countResult[0].total;

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [evaluations] = await pool.query(
      `SELECT e.*, s.name as student_name
       FROM evaluations e
       LEFT JOIN students s ON e.student_id = s.id
       WHERE e.record_id = ?
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [recordId, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: evaluations,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取点评列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取某个学员的所有点评
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // 获取总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM evaluations WHERE student_id = ?',
      [studentId]
    );
    const total = countResult[0].total;

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const [evaluations] = await pool.query(
      `SELECT e.*, r.date, r.time, c.code as class_name
       FROM evaluations e
       LEFT JOIN class_records r ON e.record_id = r.id
       LEFT JOIN classes c ON r.class_id = c.id
       WHERE e.student_id = ?
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [studentId, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: evaluations,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取学员点评错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建点评
router.post('/', async (req, res) => {
  try {
    const {
      record_id,
      student_id,
      content,
      images = '[]',
      red_dots = 0,
      created_by
    } = req.body;

    if (!record_id || !student_id) {
      return res.status(400).json({
        code: 400,
        message: '上课记录ID和学员ID不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO evaluations (record_id, student_id, content, images, red_dots, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [record_id, student_id, content, images, red_dots, created_by]
    );

    // 更新上课记录的点评统计
    await pool.query(
      `UPDATE class_records
       SET evaluated_count = evaluated_count + 1,
           unevaluated_count = GREATEST(unevaluated_count - 1, 0)
       WHERE id = ?`,
      [record_id]
    );

    res.json({
      code: 200,
      message: '点评成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建点评错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 批量创建点评（用于一次性点评多个学员）
router.post('/batch', async (req, res) => {
  try {
    const { record_id, evaluations, created_by } = req.body;

    if (!record_id || !evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({
        code: 400,
        message: '参数错误'
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const evaluation of evaluations) {
        await connection.query(
          `INSERT INTO evaluations (record_id, student_id, content, images, red_dots, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            record_id,
            evaluation.student_id,
            evaluation.content || '',
            evaluation.images || '[]',
            evaluation.red_dots || 0,
            created_by
          ]
        );
      }

      // 更新上课记录的点评统计
      await connection.query(
        `UPDATE class_records
         SET evaluated_count = evaluated_count + ?,
             unevaluated_count = GREATEST(unevaluated_count - ?, 0)
         WHERE id = ?`,
        [evaluations.length, evaluations.length, record_id]
      );

      await connection.commit();

      res.json({
        code: 200,
        message: `批量点评成功，共 ${evaluations.length} 名学员`
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('批量创建点评错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新点评
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images, red_dots } = req.body;

    const [result] = await pool.query(
      `UPDATE evaluations SET
        content = COALESCE(?, content),
        images = COALESCE(?, images),
        red_dots = COALESCE(?, red_dots)
       WHERE id = ?`,
      [content, images, red_dots, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '点评不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新点评错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 标记为已读
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE evaluations SET is_read = 1 WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '点评不存在'
      });
    }

    res.json({
      code: 200,
      message: '标记成功'
    });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除点评
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取点评信息以更新统计
    const [evaluations] = await pool.query(
      'SELECT record_id FROM evaluations WHERE id = ?',
      [id]
    );

    if (evaluations.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '点评不存在'
      });
    }

    const recordId = evaluations[0].record_id;

    // 删除点评
    await pool.query('DELETE FROM evaluations WHERE id = ?', [id]);

    // 更新上课记录统计
    await pool.query(
      `UPDATE class_records
       SET evaluated_count = GREATEST(evaluated_count - 1, 0),
           unevaluated_count = unevaluated_count + 1
       WHERE id = ?`,
      [recordId]
    );

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除点评错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
