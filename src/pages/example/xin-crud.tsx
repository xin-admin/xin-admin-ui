import React, { useRef } from 'react';
import { Card, Typography, Tag, Space, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import XinCrud from '@/components/XinTablePro';
import type { XinCrudRef, XinCrudColumn } from '@/components/XinTablePro';

const { Title, Paragraph, Text } = Typography;

// 模拟用户数据类型
interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: number;
  role: string;
  department: string;
  createTime: string;
  avatar?: string;
}

// 模拟数据
const mockData: User[] = [
  { id: 1, username: 'admin', nickname: '管理员', email: 'admin@example.com', phone: '13800138001', status: 1, role: 'admin', department: '技术部', createTime: '2024-01-01 10:00:00' },
  { id: 2, username: 'zhangsan', nickname: '张三', email: 'zhangsan@example.com', phone: '13800138002', status: 1, role: 'user', department: '产品部', createTime: '2024-01-02 11:00:00' },
  { id: 3, username: 'lisi', nickname: '李四', email: 'lisi@example.com', phone: '13800138003', status: 0, role: 'user', department: '设计部', createTime: '2024-01-03 12:00:00' },
  { id: 4, username: 'wangwu', nickname: '王五', email: 'wangwu@example.com', phone: '13800138004', status: 1, role: 'editor', department: '运营部', createTime: '2024-01-04 13:00:00' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', email: 'zhaoliu@example.com', phone: '13800138005', status: 1, role: 'user', department: '技术部', createTime: '2024-01-05 14:00:00' },
];

// 列配置 - 统一配置搜索、表格、表单
const columns: XinCrudColumn<User>[] = [
  {
    label: '用户名',
    dataIndex: 'username',
    valueType: 'text',
    width: 120,
    rules: [{ required: true, message: '请输入用户名' }],
    fieldProps: { placeholder: '请输入用户名' },
  },
  {
    label: '昵称',
    dataIndex: 'nickname',
    valueType: 'text',
    width: 120,
    hideInSearch: true,
    fieldProps: { placeholder: '请输入昵称' },
  },
  {
    label: '邮箱',
    dataIndex: 'email',
    valueType: 'text',
    width: 180,
    ellipsis: true,
    hideInSearch: true,
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效的邮箱' },
    ],
    fieldProps: { placeholder: '请输入邮箱' },
  },
  {
    label: '手机号',
    dataIndex: 'phone',
    valueType: 'text',
    width: 130,
    hideInSearch: true,
    fieldProps: { placeholder: '请输入手机号' },
  },
  {
    label: '状态',
    dataIndex: 'status',
    valueType: 'select',
    width: 100,
    align: 'center',
    valueEnum: {
      1: { text: '启用', status: 'success' },
      0: { text: '禁用', status: 'default' },
    },
    fieldProps: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    label: '角色',
    dataIndex: 'role',
    valueType: 'select',
    width: 100,
    valueEnum: {
      admin: { text: '管理员', color: 'red' },
      editor: { text: '编辑者', color: 'blue' },
      user: { text: '普通用户', color: 'default' },
    },
    fieldProps: {
      placeholder: '请选择角色',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑者', value: 'editor' },
        { label: '普通用户', value: 'user' },
      ],
    },
  },
  {
    label: '部门',
    dataIndex: 'department',
    valueType: 'select',
    width: 100,
    hideInSearch: true,
    fieldProps: {
      placeholder: '请选择部门',
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '运营部', value: '运营部' },
      ],
    },
  },
  {
    label: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
    width: 180,
    hideInSearch: true,
    hideInForm: true,
  },
];

// 模拟 API 请求
const mockRequest = {
  list: async (params: Record<string, any>) => {
    console.log('查询参数:', params);
    // 模拟搜索过滤
    let result = [...mockData];
    if (params.username) {
      result = result.filter(item => item.username.includes(params.username));
    }
    if (params.status !== undefined && params.status !== null) {
      result = result.filter(item => item.status === params.status);
    }
    if (params.role) {
      result = result.filter(item => item.role === params.role);
    }
    // 模拟分页
    const { page = 1, pageSize = 10 } = params;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: result.slice(start, end),
      total: result.length,
    };
  },
  create: async (data: User) => {
    console.log('新增数据:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  update: async (id: number, data: User) => {
    console.log('更新数据:', id, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  delete: async (id: number) => {
    console.log('删除数据:', id);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};

export default function XinCrudExample() {
  const crudRef = useRef<XinCrudRef<User>>(undefined);

  return (
    <div className="p-4 space-y-6">
      <Typography>
        <Title level={2}>XinCrud 表格组件示例</Title>
        <Paragraph>
          <Text>
            XinCrud 是一个集成了搜索、表格、表单的 CRUD 组件，
            通过统一的列配置实现搜索、表格展示和表单编辑功能。
          </Text>
        </Paragraph>
      </Typography>

      {/* 基础用法 */}
      <Card title="基础用法 - 用户管理">
        <XinCrud<User>
          crudRef={crudRef}
          columns={columns}
          rowKey="id"
          request={mockRequest}
          headerTitle="用户列表"
          rowSelection={true}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          toolbar={{
            addShow: true,
            addText: '新增用户',
            batchDeleteShow: true,
          }}
          operateConfig={{
            editShow: true,
            deleteShow: (record) => record.username !== 'admin', // admin 不可删除
          }}
          modalProps={{
            title: undefined, // 使用默认标题
            width: 600,
          }}
          createTitle="新增用户"
          editTitle="编辑用户"
          formGrid={true}
          formRowProps={{ gutter: [16, 0] }}
          formColProps={{ span: 12 }}
          searchColProps={{ span: 6 }}
          successMessage={{
            create: '用户创建成功',
            update: '用户更新成功',
            delete: '用户删除成功',
          }}
          beforeSubmit={async (data, mode) => {
            console.log('提交前处理:', mode, data);
            return data;
          }}
          afterSubmit={(data, mode) => {
            console.log('提交后回调:', mode, data);
          }}
          beforeDelete={async (record) => {
            if (record.username === 'admin') {
              message.error('不能删除管理员账户');
              return false;
            }
            return true;
          }}
          toolBarRender={[
            <Button 
              key="refresh" 
              icon={<ReloadOutlined />}
              onClick={() => crudRef.current?.reload()}
            >
              刷新
            </Button>
          ]}
        />
      </Card>

      {/* 使用说明 */}
      <Card title="功能说明">
        <Typography>
          <Paragraph>
            <Text strong>核心特性：</Text>
          </Paragraph>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Text strong>统一列配置：</Text>
              使用 <Text code>XinCrudColumn</Text> 类型，一套配置同时控制搜索栏、表格列和表单字段
            </li>
            <li>
              <Text strong>灵活的显示控制：</Text>
              通过 <Text code>hideInSearch</Text>、<Text code>hideInTable</Text>、
              <Text code>hideInForm</Text>、<Text code>hideInCreate</Text>、
              <Text code>hideInEdit</Text> 控制字段在不同场景的显示
            </li>
            <li>
              <Text strong>值枚举渲染：</Text>
              配置 <Text code>valueEnum</Text> 自动渲染 Badge 或 Tag 样式
            </li>
            <li>
              <Text strong>自定义请求：</Text>
              支持 <Text code>api</Text> 接口前缀或自定义 <Text code>request</Text> 方法
            </li>
            <li>
              <Text strong>权限控制：</Text>
              配置 <Text code>accessName</Text> 自动集成 AuthButton 权限按钮
            </li>
            <li>
              <Text strong>钩子函数：</Text>
              支持 <Text code>beforeSubmit</Text>、<Text code>afterSubmit</Text>、
              <Text code>beforeDelete</Text>、<Text code>afterDelete</Text> 等钩子
            </li>
          </ul>
        </Typography>
      </Card>

      {/* 代码示例 */}
      <Card title="代码示例">
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
{`import XinCrud from '@/components/XinCrud';
import type { XinCrudColumn } from '@/components/XinCrud';

// 定义列配置
const columns: XinCrudColumn<User>[] = [
  {
    label: '用户名',
    dataIndex: 'username',
    valueType: 'text',
    rules: [{ required: true }],
  },
  {
    label: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
      1: { text: '启用', status: 'success' },
      0: { text: '禁用', status: 'default' },
    },
    fieldProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 使用组件
<XinCrud
  columns={columns}
  api="/api/users"  // 或使用 request 自定义请求
  rowKey="id"
  accessName="user"
  headerTitle="用户管理"
/>`}
        </pre>
      </Card>
    </div>
  );
}
