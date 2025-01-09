import React, { useState } from 'react';
import {
  Space,
  Button,
  Dropdown,
  Modal,
  Input,
  Form,
  Alert,
  Tooltip,
  Typography,
  Tag
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
  SyncOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { isValidUrl } from '../../utils/validator';

const { Text } = Typography;

interface BrowserBatchActionsProps {
  selectedIds: string[];
  totalSelected: number;
  onBatchStart?: (ids: string[]) => void;
  onBatchStop?: (ids: string[]) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchVisitUrl?: (ids: string[], url: string) => void;
  onBatchRefresh?: (ids: string[]) => void;
  onBatchSettings?: (ids: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

const BrowserBatchActions: React.FC<BrowserBatchActionsProps> = ({
  selectedIds,
  totalSelected,
  onBatchStart,
  onBatchStop,
  onBatchDelete,
  onBatchVisitUrl,
  onBatchRefresh,
  onBatchSettings,
  loading = false,
  disabled = false,
}) => {
  const [visitUrlVisible, setVisitUrlVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [form] = Form.useForm();

  // 批量访问URL
  const handleBatchVisitUrl = async () => {
    try {
      const { url } = await form.validateFields();
      onBatchVisitUrl?.(selectedIds, url);
      setVisitUrlVisible(false);
      form.resetFields();
    } catch (error) {
      // 表单验证错误
    }
  };

  // 确认批量删除
  const handleBatchDelete = () => {
    onBatchDelete?.(selectedIds);
    setDeleteConfirmVisible(false);
  };

  // 更多操作菜单
  const moreActions: MenuProps['items'] = [
    {
      key: 'refresh',
      label: '刷新选中',
      icon: <SyncOutlined />,
      onClick: () => onBatchRefresh?.(selectedIds),
    },
    {
      key: 'settings',
      label: '批量设置',
      icon: <SettingOutlined />,
      onClick: () => onBatchSettings?.(selectedIds),
    },
  ];

  return (
    <div className="browser-batch-actions bg-white p-4 border-b flex items-center justify-between">
      {/* 选中数量显示 */}
      <div>
        <Text>已选择</Text>
        <Tag color="blue" className="mx-2">
          {totalSelected}
        </Tag>
        <Text>个实例</Text>
      </div>

      {/* 操作按钮组 */}
      <Space>
        {/* 启动按钮 */}
        <Tooltip title="批量启动">
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => onBatchStart?.(selectedIds)}
            disabled={disabled || loading}
          >
            启动
          </Button>
        </Tooltip>

        {/* 停止按钮 */}
        <Tooltip title="批量停止">
          <Button
            icon={<PauseCircleOutlined />}
            onClick={() => onBatchStop?.(selectedIds)}
            disabled={disabled || loading}
          >
            停止
          </Button>
        </Tooltip>

        {/* 访问URL按钮 */}
        <Tooltip title="批量访问URL">
          <Button
            icon={<LinkOutlined />}
            onClick={() => setVisitUrlVisible(true)}
            disabled={disabled || loading}
          >
            访问URL
          </Button>
        </Tooltip>

        {/* 删除按钮 */}
        <Tooltip title="批量删除">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteConfirmVisible(true)}
            disabled={disabled || loading}
          >
            删除
          </Button>
        </Tooltip>

        {/* 更多操作下拉菜单 */}
        <Dropdown menu={{ items: moreActions }} disabled={disabled || loading}>
          <Button>
            更多 <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      {/* 访问URL对话框 */}
      <Modal
        title="批量访问URL"
        open={visitUrlVisible}
        onCancel={() => setVisitUrlVisible(false)}
        onOk={handleBatchVisitUrl}
        confirmLoading={loading}
      >
        <Alert
          message="提示"
          description={`将对${totalSelected}个选中的实例执行访问URL操作`}
          type="info"
          showIcon
          className="mb-4"
        />
        <Form form={form}>
          <Form.Item
            name="url"
            label="URL地址"
            rules={[
              { required: true, message: '请输入URL' },
              {
                validator: async (_, value) => {
                  if (value && !isValidUrl(value)) {
                    throw new Error('请输入有效的URL地址');
                  }
                },
              },
            ]}
          >
            <Input placeholder="请输入要访问的URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认对话框 */}
      <Modal
        title="确认删除"
        open={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        onOk={handleBatchDelete}
        okType="danger"
        confirmLoading={loading}
      >
        <Alert
          message="警告"
          description={`确定要删除${totalSelected}个选中的浏览器实例吗？此操作不可恢复。`}
          type="warning"
          showIcon
          className="mb-4"
        />
        <Text type="secondary">
          删除后，所有相关的数据和配置都将被清除。
        </Text>
      </Modal>
    </div>
  );
};

export default BrowserBatchActions;
