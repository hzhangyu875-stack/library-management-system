const express = require('express');
const router = express.Router();
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// 借书
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // 检查图书是否存在且有库存
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ message: '图书库存不足' });
    }

    // 检查用户是否已借阅此书且未归还
    const existingBorrow = await BorrowRecord.findOne({
      where: {
        userId,
        bookId,
        status: 'borrowed'
      }
    });

    if (existingBorrow) {
      return res.status(400).json({ message: '您已借阅此书,请先归还' });
    }

    // 创建借阅记录
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30天借阅期

    const borrowRecord = await BorrowRecord.create({
      userId,
      bookId,
      dueDate
    });

    // 减少库存
    await book.update({ stock: book.stock - 1 });

    res.status(201).json({ 
      message: '借阅成功', 
      borrowRecord,
      dueDate 
    });
  } catch (error) {
    res.status(500).json({ message: '借阅失败', error: error.message });
  }
});

// 还书
router.post('/return/:id', authenticate, async (req, res) => {
  try {
    const borrowRecord = await BorrowRecord.findByPk(req.params.id);

    if (!borrowRecord) {
      return res.status(404).json({ message: '借阅记录不存在' });
    }

    if (borrowRecord.userId !== req.user.id) {
      return res.status(403).json({ message: '无权操作此记录' });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({ message: '此书已归还' });
    }

    // 更新借阅记录
    await borrowRecord.update({
      returnDate: new Date(),
      status: 'returned'
    });

    // 增加库存
    const book = await Book.findByPk(borrowRecord.bookId);
    await book.update({ stock: book.stock + 1 });

    res.json({ message: '归还成功', borrowRecord });
  } catch (error) {
    res.status(500).json({ message: '归还失败', error: error.message });
  }
});

// 获取借阅历史
router.get('/history', authenticate, async (req, res) => {
  try {
    const records = await BorrowRecord.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Book,
        attributes: ['id', 'title', 'author', 'isbn']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '获取借阅历史失败', error: error.message });
  }
});

// 获取当前借阅(未归还)
router.get('/current', authenticate, async (req, res) => {
  try {
    const records = await BorrowRecord.findAll({
      where: { 
        userId: req.user.id,
        status: 'borrowed'
      },
      include: [{
        model: Book,
        attributes: ['id', 'title', 'author', 'isbn']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: '获取当前借阅失败', error: error.message });
  }
});

module.exports = router;