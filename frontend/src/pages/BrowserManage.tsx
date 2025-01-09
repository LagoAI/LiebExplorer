import React, { useState } from 'react';
import { 
  Card,
  Button,
  Table,
  Form,
  Input,
  Modal,
  message,
  Space,
  Tooltip,
  Badge,
  InputNumber 
} from 'antd';
import { 
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LinkOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  fetchBrowserInstances,
  createBrowserInstance,
  deleteBrowserInstance,
  startBrowserInstance,
  stopBrowserInstance,
  visitUrl 
} from '../services/api';

const BrowserManage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [visitUrlModalVisible, setVisitUrlModalVisible] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [urlForm] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取浏览器实例列表
  const { data: instances = [], isLoading } = useQuery(
    'browserInstances',
    fetchBrowserInstances
  );

  // 创建新实例
  const createMutation = useMutation(createBrowserInstance, {
    onSuccess: () => {
      message.success('实例创建成功');
      queryClient.invalidateQueries('browserInstances');
      setCreateModalVisible(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(`创建失败: ${error.message}`);
    },
  });

  // 删除实例
  const deleteMutation = useMutation(deleteBrowserInstance, {
    onSuccess: () => {
      message.success('实例删除成功');
      queryClient.invalidateQueries('browserInstances');
    },
    onError: (error: Error) => {
      message.error(`删除失败: ${error.message}`);
    },
  });

  // 启动实例
  const startMutation = useMutation(startBrowserInstance, {
    onSuccess: () => {
      message.success('实例启动成功');
      queryClient.invalidateQueries('browserInstances');
    },
    onError: (error: Error) => {
      message.error(`启动失败: ${error.message}`);
    },
  });

  // 停止实例
  const stopMutation = useMutation(stopBrowserInstance, {
    onSuccess: () => {
      message.success('实例停止成功');
      queryClient.invalidateQueries('browserInstances');
    },
    onError: (error: Error) => {
      message.error(`停止失败: ${error.message}`);
    },
  });

  // 访问URL
  const visitUrlMutation = useMutation(visitUrl, {
    onSuccess: () => {
      message.success('URL访问请求已发送');
      queryClient.invalidateQueries('browserInstances');
      setVisitUrlModalVisible(false);
      urlForm.resetFields();
    },
    onError: (error: Error) => {
      message.error(`访问失败: ${error.message}`);
    },
  });

  const columns = [
    {
      title: '实例ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'running' ? 'success' : 'default'} 
          text={status === 'running' ? '运行中' : '已停止'} 
        />
      ),
    },
    {
      title: '当前URL',
      dataIndex: 'currentUrl',
      key: 'currentUrl',
      ellipsis: true,
    },
    {
      title: '启动时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'running' ? (
            <Tooltip title="停止">
              <Button
                icon={<PauseCircleOutlined />}
                onClick={() => stopMutation.mutate(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="启动">
              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => startMutation.mutate(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="访问URL">
            <Button
              icon={<LinkOutlined />}
              disabled={record.status !== 'running'}
              onClick={() => {
                setSelectedInstanceId(record.id);
                setVisitUrlModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteMutation.mutate(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="浏览器实例管理"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              新建实例
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => queryClient.invalidateQueries('browserInstances')}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={instances}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      {/* 创建实例对话框 */}
      <Modal
        title="新建浏览器实例"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item
            name="instanceCount"
            label="实例数量"
            rules={[{ required: true, message: '请输入实例数量' }]}
          >
            <InputNumber min={1} max={10} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 访问URL对话框 */}
      <Modal
        title="访问URL"
        open={visitUrlModalVisible}
        onCancel={() => setVisitUrlModalVisible(false)}
        onOk={() => urlForm.submit()}
        confirmLoading={visitUrlMutation.isLoading}
      >
        <Form
          form={urlForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedInstanceId) {
              visitUrlMutation.mutate({
                id: selectedInstanceId,
                url: values.url,
              });
            }
          }}
        >
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: '请输入URL' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrowserManage;
