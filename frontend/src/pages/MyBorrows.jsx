import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Space } from 'antd';
import { getBorrowHistory, getCurrentBorrows, returnBook } from '../api/borrow';
import dayjs from 'dayjs';

const MyBorrows = () => {
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentBorrows(),
        getBorrowHistory()
      ]);
      setCurrent(currentRes);
      setHistory(historyRes);
    } catch (error) {
      message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (id) => {
    try {
      const res = await returnBook(id);
      message.success(res.message);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || '归还失败');
    }
  };

  const columns = [
    {
      title: '书名',
      dataIndex: ['Book', 'title'],
      key: 'title'
    },
    {
      title: '作者',
      dataIndex: ['Book', 'author'],
      key: 'author'
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '应还日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '归还日期',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isOverdue = dayjs().isAfter(dayjs(record.dueDate)) && status === 'borrowed';
        if (status === 'returned') {
          return <Tag color="green">已归还</Tag>;
        }
        if (isOverdue) {
          return <Tag color="red">已逾期</Tag>;
        }
        return <Tag color="blue">借阅中</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'borrowed' && (
          <Button 
            size="small" 
            type="primary"
            onClick={() => handleReturn(record.id)}
          >
            归还
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type={activeTab === 'current' ? 'primary' : 'default'}
          onClick={() => setActiveTab('current')}
        >
          当前借阅
        </Button>
        <Button 
          type={activeTab === 'history' ? 'primary' : 'default'}
          onClick={() => setActiveTab('history')}
        >
          借阅历史
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={activeTab === 'current' ? current : history}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default MyBorrows;