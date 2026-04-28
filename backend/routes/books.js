const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { authenticate, isAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// 获取所有图书(支持搜索和分页)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      books: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '获取图书列表失败', error: error.message });
  }
});

// 获取单本图书
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: '获取图书失败', error: error.message });
  }
});

// 添加图书(仅管理员)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ message: '图书添加成功', book });
  } catch (error) {
    res.status(500).json({ message: '添加图书失败', error: error.message });
  }
});

// 更新图书(仅管理员)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    await book.update(req.body);
    res.json({ message: '图书更新成功', book });
  } catch (error) {
    res.status(500).json({ message: '更新图书失败', error: error.message });
  }
});

// 删除图书(仅管理员)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: '图书不存在' });
    }

    await book.destroy();
    res.json({ message: '图书删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除图书失败', error: error.message });
  }
});

module.exports = router;