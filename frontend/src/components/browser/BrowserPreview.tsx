import React from 'react';
import { Card, Space, Tag, Button, Typography, Tooltip, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
  SyncOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { BrowserInstance } from '../../types/browser';

const { Text, Paragraph } = Typography;

interface BrowserPreviewProps {
  instance: BrowserInstance;
  onStart?: () => void;
  onStop?: () => void;
  onDelete?: () => void;
  onVisitUrl?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  loading?: boolean;
}

const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  instance,
  onStart,
  onStop,
  onDelete,
  onVisitUrl,
  onRefresh,
  onSettings,
  loading = false,
}) => {
  // 状态标签颜色映射
  const statusColorMap = {
    creating: 'blue',
    running: 'success',
    stopped: 'default',
    error: 'error',
  };

  // 状态文本映射
  const statusTextMap = {
    creating: '创建中',
    running: '运行中',
    stopped: '已停止',
    error: '错误',
  };

  return (
    <Card
      hoverable
      loading={loading}
      className="browser-preview"
      actions={[
        // 启动/停止按钮
        <Tooltip 
          title={instance.status === 'running' ? '停止' : '启动'}
          key="start-stop"
        >
          <Button
            type="text"
            icon={instance.status === 'running' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={instance.status === 'running' ? onStop : onStart}
            disabled={instance.status === 'creating' || loading}
          />
        </Tooltip>,
        // 访问URL按钮
        <Tooltip title="访问URL" key="visit">
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={onVisitUrl}
            disabled={instance.status !== 'running' || loading}
          />
        </Tooltip>,
        // 刷新按钮
        <Tooltip title="刷新" key="refresh">
          <Button
            type="text"
            icon={<SyncOutlined />}
            onClick={onRefresh}
            disabled={instance.status !== 'running' || loading}
          />
        </Tooltip>,
        // 设置按钮
        <Tooltip title="设置" key="settings">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={onSettings}
            disabled={loading}
          />
        </Tooltip>,
      ]}
    >
      {/* 头部信息 */}
      <div className="mb-4 flex items-center justify-between">
        <Space size="middle">
          <Text strong>#{instance.id}</Text>
          <Tag color={statusColorMap[instance.status]}>
            {statusTextMap[instance.status]}
          </Tag>
        </Space>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={onDelete}
          disabled={loading}
        />
      </div>

      {/* 当前URL */}
      <Paragraph 
        ellipsis={{ rows: 1 }}
        className="mb-3"
      >
        <Text type="secondary">当前URL：</Text>
        {instance.currentUrl || '-'}
      </Paragraph>

      {/* 系统资源使用情况 */}
      <div className="mb-3">
        <Text type="secondary">CPU使用率：</Text>
        <Progress
          percent={Math.round(instance.performance.cpuUsage)}
          size="small"
          status={instance.performance.cpuUsage > 80 ? 'exception' : 'normal'}
        />
      </div>

      <div className="mb-3">
        <Text type="secondary">内存使用：</Text>
        <Progress
          percent={Math.round((instance.performance.memoryUsage / instance.performance.memoryLimit) * 100)}
          size="small"
          status={instance.performance.memoryUsage > instance.performance.memoryLimit * 0.8 ? 'exception' : 'normal'}
        />
      </div>

      {/* 指纹信息 */}
      <div className="mb-2">
        <Text type="secondary">平台：</Text>
        <Text>{instance.fingerprint.platform}</Text>
      </div>

      <div className="mb-2">
        <Text type="secondary">语言：</Text>
        <Text>{instance.fingerprint.language}</Text>
      </div>

      {/* 代理信息 */}
      {instance.proxy.enabled && (
        <div className="mt-3">
          <Tag color="blue">
            代理：{instance.proxy.type} - {instance.proxy.host}:{instance.proxy.port}
          </Tag>
        </div>
      )}
    </Card>
  );
};

export default BrowserPreview;
