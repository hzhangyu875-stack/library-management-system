const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');

const BorrowRecord = sequelize.define('BorrowRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Book,
      key: 'id'
    }
  },
  borrowDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    defaultValue: 'borrowed'
  }
}, {
  tableName: 'borrow_records',
  timestamps: true
});

// 设置关联
User.hasMany(BorrowRecord, { foreignKey: 'userId' });
BorrowRecord.belongsTo(User, { foreignKey: 'userId' });

Book.hasMany(BorrowRecord, { foreignKey: 'bookId' });
BorrowRecord.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = BorrowRecord;