const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { pool } = require('../config/db');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
});

// 获取课程列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      category_id,
      keyword
    } = req.query;

    let sql = `
      SELECT c.*, cc.name as category_name
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    if (category_id) {
      sql += ' AND c.category_id = ?';
      params.push(category_id);
    }

    if (keyword) {
      sql += ' AND c.name LIKE ?';
      params.push(`%${keyword}%`);
    }

    // 获取总数
    const countSql = sql.replace(/SELECT c\.\*, cc\.name as category_name/, 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [courses] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: courses,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取单个课程详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.query(
      `SELECT c.*, cc.name as category_name
       FROM courses c
       LEFT JOIN course_categories cc ON c.category_id = cc.id
       WHERE c.id = ?`,
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '课程不存在'
      });
    }

    res.json({
      code: 200,
      data: courses[0]
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建课程
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category_id,
      teaching_mode = '班课',
      charge_mode = '按课时收费',
      charge_unit = '课时',
      price = 0,
      campus,
      duration = 60,
      total_lessons = 0,
      status = '启用',
      remark = ''
    } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '课程名称不能为空'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (name, category_id, teaching_mode, charge_mode, charge_unit, price, campus, duration, total_lessons, status, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, teaching_mode, charge_mode, charge_unit, price, campus, duration, total_lessons, status, remark]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新课程
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      teaching_mode,
      charge_mode,
      charge_unit,
      price,
      campus,
      duration,
      total_lessons,
      status,
      remark
    } = req.body;

    const [result] = await pool.query(
      `UPDATE courses SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        teaching_mode = COALESCE(?, teaching_mode),
        charge_mode = COALESCE(?, charge_mode),
        charge_unit = COALESCE(?, charge_unit),
        price = COALESCE(?, price),
        campus = COALESCE(?, campus),
        duration = COALESCE(?, duration),
        total_lessons = COALESCE(?, total_lessons),
        status = COALESCE(?, status),
        remark = COALESCE(?, remark)
       WHERE id = ?`,
      [name, category_id, teaching_mode, charge_mode, charge_unit, price, campus, duration, total_lessons, status, remark, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '课程不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除课程
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM courses WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '课程不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取课程类别列表
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM course_categories ORDER BY sort_order, id'
    );

    res.json({
      code: 200,
      data: categories
    });
  } catch (error) {
    console.error('获取课程类别错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建课程类别
router.post('/categories', async (req, res) => {
  try {
    const { name, parent_id, sort_order = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '类别名称不能为空'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO course_categories (name, parent_id, sort_order) VALUES (?, ?, ?)',
      [name, parent_id, sort_order]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建课程类别错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 更新课程类别
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, sort_order } = req.body;

    const [result] = await pool.query(
      `UPDATE course_categories SET
        name = COALESCE(?, name),
        parent_id = COALESCE(?, parent_id),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?`,
      [name, parent_id, sort_order, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '课程类别不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新课程类别错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除课程类别
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有课程使用该类别
    const [courses] = await pool.query(
      'SELECT COUNT(*) as count FROM courses WHERE category_id = ?',
      [id]
    );

    if (courses[0].count > 0) {
      return res.status(400).json({
        code: 400,
        message: '该类别下存在课程，无法删除'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM course_categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '课程类别不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除课程类别错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 批量导入课程
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    console.log('开始处理导入请求...');
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      });
    }

    // 读取Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Excel解析完成，共${data.length}条数据`);
    console.log('第一行数据示例:', data[0]);

    if (data.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件中没有数据'
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // 批量插入课程
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // 处理列名（去除换行符和括号中的说明）
        const cleanKey = (key) => {
          if (!key) return '';
          return key.split('\n')[0].trim();
        };

        // 创建清理后的行对象
        const cleanedRow = {};
        Object.keys(row).forEach(key => {
          const cleanedKey = cleanKey(key);
          cleanedRow[cleanedKey] = row[key];
        });

        // 根据模板字段映射
        const courseName = cleanedRow['课程名称'] || row['课程名称'] || row['name'];
        const categoryName = cleanedRow['课程类别'] || row['课程类别'] || row['category'];
        const teachingMode = cleanedRow['类型'] || row['授课模式'] || row['teaching_mode'] || '班课';
        const chargeMode = cleanedRow['收费模式'] || row['收费模式'] || row['charge_mode'] || '按课时收费';
        const price = parseFloat(cleanedRow['学费标准(金额)'] || row['价格'] || row['price'] || 0);
        const campus = cleanedRow['开课校区'] || row['开课校区'] || row['campus'] || '';
        const totalLessons = parseFloat(cleanedRow['包含课时数'] || row['总课时'] || row['total_lessons'] || 0);
        const remark = cleanedRow['备注'] || row['备注'] || row['remark'] || '';

        // 默认时长60分钟
        const duration = parseInt(row['课程时长'] || row['duration'] || 60);

        if (!courseName || courseName.includes('导入须知') || courseName.includes('示例课程')) {
          // 跳过说明行和示例行
          continue;
        }

        // 查找或创建课程类别
        let categoryId = null;
        if (categoryName) {
          const [categories] = await pool.query(
            'SELECT id FROM course_categories WHERE name = ?',
            [categoryName]
          );

          if (categories.length > 0) {
            categoryId = categories[0].id;
          } else {
            // 创建新类别
            const [result] = await pool.query(
              'INSERT INTO course_categories (name, sort_order) VALUES (?, ?)',
              [categoryName, 999]
            );
            categoryId = result.insertId;
          }
        }

        // 根据收费模式设置单位
        let chargeUnit = '课时';
        if (chargeMode === '按期收费' || chargeMode === '按期') {
          chargeUnit = '期';
        } else if (chargeMode === '按时间收费' || chargeMode === '按时间') {
          chargeUnit = cleanedRow['学费标准(单位)'] || '月';
        }

        // 插入课程
        await pool.query(
          `INSERT INTO courses (name, category_id, teaching_mode, charge_mode, charge_unit, price, campus, duration, total_lessons, status, remark)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [courseName, categoryId, teachingMode, chargeMode, chargeUnit, price, campus, duration, totalLessons, '启用', remark]
        );

        successCount++;
      } catch (error) {
        console.error(`导入第${i + 2}行失败:`, error);
        errors.push(`第${i + 2}行：${error.message}`);
        failCount++;
      }
    }

    console.log(`导入完成: 成功${successCount}条, 失败${failCount}条`);

    res.json({
      code: 200,
      message: '导入完成',
      data: {
        total: data.length,
        successCount,
        failCount,
        errors: errors.slice(0, 10) // 只返回前10个错误
      }
    });
  } catch (error) {
    console.error('批量导入课程错误:', error);
    res.status(500).json({
      code: 500,
      message: '导入失败：' + error.message
    });
  }
});

module.exports = router;
