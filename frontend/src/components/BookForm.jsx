import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import { addBook, updateBook } from '../api/books';
import dayjs from 'dayjs';

const BookForm = ({ visible, book, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (book) {
        form.setFieldsValue({
          ...book,
          publishDate: book.publishDate ? dayjs(book.publishDate) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, book]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.format('YYYY-MM-DD') : null
      };

      if (book) {
        await updateBook(book.id, data);
        message.success('更新成功');
      } else {
        await addBook(data);
        message.success('添加成功');
      }
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  return (
    <Modal
      title={book ? '编辑图书' : '添加图书'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="isbn"
          label="ISBN"
          rules={[{ required: true, message: '请输入ISBN' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="title"
          label="书名"
          rules={[{ required: true, message: '请输入书名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="author"
          label="作者"
          rules={[{ required: true, message: '请输入作者' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="publisher" label="出版社">
          <Input />
        </Form.Item>

        <Form.Item name="category" label="分类">
          <Input />
        </Form.Item>

        <Form.Item name="publishDate" label="出版日期">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="price" label="价格">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="total"
          label="总数量"
          rules={[{ required: true, message: '请输入总数量' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="stock"
          label="库存"
          rules={[{ required: true, message: '请输入库存' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="简介">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookForm;