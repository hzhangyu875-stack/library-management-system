import request from '../utils/request';

// 获取图书列表
export const getBooks = (params) => {
  return request.get('/books', { params });
};

// 获取图书详情
export const getBookById = (id) => {
  return request.get(`/books/${id}`);
};

// 添加图书
export const addBook = (data) => {
  return request.post('/books', data);
};

// 更新图书
export const updateBook = (id, data) => {
  return request.put(`/books/${id}`, data);
};

// 删除图书
export const deleteBook = (id) => {
  return request.delete(`/books/${id}`);
};