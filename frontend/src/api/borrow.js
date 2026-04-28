import request from '../utils/request';

// 借书
export const borrowBook = (bookId) => {
  return request.post('/borrow', { bookId });
};

// 还书
export const returnBook = (recordId) => {
  return request.post(`/borrow/return/${recordId}`);
};

// 获取借阅历史
export const getBorrowHistory = () => {
  return request.get('/borrow/history');
};

// 获取当前借阅
export const getCurrentBorrows = () => {
  return request.get('/borrow/current');
};