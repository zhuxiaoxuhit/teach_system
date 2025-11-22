const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const router = express.Router();

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        code: 400,
        message: '手机号和密码不能为空'
      });
    }

    // 查询用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE phone = ? AND status = 1',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码错误'
      });
    }

    const user = users[0];

    // 简化版：直接比较密码（生产环境应使用 bcrypt）
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === '1234567890'; // 临时简化

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码错误'
      });
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

    const [users] = await pool.query(
      'SELECT id, name, phone, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token'
    });
  }
});

module.exports = router;
