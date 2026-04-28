const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');  // 添加这行!

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ username }, { email }]  // 修改这里
      } 
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      email,
      phone
    });

    res.status(201).json({ 
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;