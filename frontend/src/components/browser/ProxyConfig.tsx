import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  InputNumber,
  message,
  Divider,
  Typography
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { isValidIp, isValidPort } from '../../utils/validator';

const { Text } = Typography;

export interface ProxyItem {
  id: string;
  type: 'http' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  location?: string;
  lastChecked?: string;
  status?: 'active' | 'inactive' | 'error';
}

interface ProxyConfigProps {
  proxyList: ProxyItem[];
  currentProxy?: ProxyItem;
  rotationEnabled?: boolean;
  rotationInterval?: number;
  onAddProxy?: (proxy: Omit<ProxyItem, 'id'>) => void;
  onUpdateProxy?: (id: string, proxy: Partial<ProxyItem>) => void;
  onDeleteProxy?: (id: string) => void;
  onEnableRotation?: (enabled: boolean) => void;
  onSetRotationInterval?: (minutes: number) => void;
  onTestProxy?: (id: string) => void;
  loading?: boolean;
}

const ProxyConfig: React.FC<ProxyConfigProps> = ({
  proxyList = [],
  currentProxy,
  rotationEnabled = false,
  rotationInterval = 30,
  onAddProxy,
  onUpdateProxy,
  onDeleteProxy,
  onEnableRotation,
  onSetRotationInterval,
  onTestProxy,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // 添加代理
  const handleAddProxy = async () => {
    try {
      const values = await form.validateFields();
      onAddProxy?.(values);
      form.resetFields();
      message.success('代理添加成功');
    } catch (error) {
      // 表单验证错误
    }
  };

  // 更新代理
  const handleUpdateProxy = async (id: string) => {
    try {
      const values = await form.validateFields();
      onUpdateProxy?.(id, values);
      setEditingId(null);
      form.resetFields();
      message.success('代理更新成功');
    } catch (error) {
      // 表单验证错误
    }
  };

  // 开始编辑
  const startEditing = (record: ProxyItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingId(null);
    form.resetFields();
  };

  // 表格列定义
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'http' ? 'blue' : 'purple'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '服务器',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: ProxyItem) => (
        <Tag color={
          record.status === 'active' ? 'success' :
          record.status === 'error' ? 'error' : 'default'
        }>
          {record.status === 'active' ? '可用' :
           record.status === 'error' ? '错误' : '未知'}
        </Tag>
      ),
    },
    {
      title: '上次检查',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProxyItem) => (
        <Space>
          {editingId === record.id ? (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleUpdateProxy(record.id)}
              >
                保存
              </Button>
              <Button
                size="small"
                onClick={cancelEditing}
              >
                取消
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => startEditing(record)}
              />
              <Popconfirm
                title="确定要删除这个代理吗？"
                onConfirm={() => onDeleteProxy?.(record.id)}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
              <Button
                type="link"
                size="small"
                onClick={() => onTestProxy?.(record.id)}
              >
                测试
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="proxy-config">
      {/* 代理列表 */}
      <Card title="代理列表" className="mb-4">
        <Table
          columns={columns}
          dataSource={proxyList}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      {/* 添加/编辑代理表单 */}
      <Card title={editingId ? "编辑代理" : "添加代理"}>
        <Form
          form={form}
          layout="vertical"
          onFinish={editingId ? () => handleUpdateProxy(editingId) : handleAddProxy}
        >
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="type"
              label="代理类型"
              rules={[{ required: true, message: '请选择代理类型' }]}
            >
              <Select>
                <Select.Option value="http">HTTP</Select.Option>
                <Select.Option value="socks5">SOCKS5</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="host"
              label="服务器地址"
              rules={[
                { required: true, message: '请输入服务器地址' },
                { validator: (_, value) => 
                  isValidIp(value) ? Promise.resolve() : Promise.reject('请输入有效的IP地址')
                }
              ]}
            >
              <Input placeholder="例如: 127.0.0.1" />
            </Form.Item>

            <Form.Item
              name="port"
              label="端口"
              rules={[
                { required: true, message: '请输入端口号' },
                { validator: (_, value) =>
                  isValidPort(value) ? Promise.resolve() : Promise.reject('请输入有效的端口号')
                }
              ]}
            >
              <InputNumber min={1} max={65535} className="w-full" />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
            >
              <Input placeholder="可选" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
            >
              <Input.Password placeholder="可选" />
            </Form.Item>

            <Form.Item
              name="location"
              label="位置"
            >
              <Input placeholder="可选" />
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button 
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                {editingId ? '更新' : '添加'}
              </Button>
              {editingId && (
                <Button onClick={cancelEditing}>
                  取消
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        {/* 代理轮换设置 */}
        <div>
          <Text strong>代理轮换</Text>
          <div className="mt-4 flex items-center gap-8">
            <div>
              <Switch
                checked={rotationEnabled}
                onChange={onEnableRotation}
              />
              <Text className="ml-2">启用自动轮换</Text>
            </div>
            {rotationEnabled && (
              <div>
                <Text>轮换间隔：</Text>
                <InputNumber
                  min={1}
                  max={1440}
                  value={rotationInterval}
                  onChange={onSetRotationInterval}
                  className="ml-2 w-20"
                />
                <Text className="ml-2">分钟</Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProxyConfig;
