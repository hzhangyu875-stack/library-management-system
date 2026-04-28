require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '图书管理系统API服务正常运行' });
});

// 数据库同步并启动服务器
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ 数据库连接成功');
    app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
});
  })
  .catch(err => {
    console.error('❌ 数据库连接失败:', err);
  });