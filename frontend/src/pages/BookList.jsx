import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message, Modal, Tag } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { getBooks, deleteBook } from '../api/books';
import { borrowBook } from '../api/borrow';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const { user } = useAuth();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getBooks({ page, limit: 10, search });
      setBooks(res.books);
      setTotal(res.total);
    } catch (error) {
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search]);

  const handleBorrow = async (bookId) => {
    try {
      const res = await borrowBook(bookId);
      message.success(res.message);
      fetchBooks();
    } catch (error) {
      message.error(error.response?.data?.message || '借阅失败');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除?',
      content: '删除后无法恢复',
      onOk: async () => {
        try {
          await deleteBook(id);
          message.success('删除成功');
          fetchBooks();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const columns = [
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
    { title: '书名', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'author', key: 'author' },
    { title: '出版社', dataIndex: 'publisher', key: 'publisher' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { 
      title: '库存', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `剩余 ${stock}` : '已借完'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {user?.role === 'admin' && (
            <>
              <Button 
                size="small" 
                onClick={() => {
                  setEditingBook(record);
                  setModalVisible(true);
                }}
              >
                编辑
              </Button>
              <Button 
                size="small" 
                danger 
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            </>
          )}
          {record.stock > 0 && (
            <Button 
              size="small" 
              type="primary"
              onClick={() => handleBorrow(record.id)}
            >
              借阅
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索书名、作者、ISBN"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        {user?.role === 'admin' && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBook(null);
              setModalVisible(true);
            }}
          >
            添加图书
          </Button>
        )}
      </Space>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage
        }}
      />

      <BookForm
        visible={modalVisible}
        book={editingBook}
        onClose={() => {
          setModalVisible(false);
          setEditingBook(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingBook(null);
          fetchBooks();
        }}
      />
    </div>
  );
};

export default BookList;