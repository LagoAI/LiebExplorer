import React, { useEffect } from 'react';
import { Card, Progress, Row, Col, Statistic } from 'antd';
import {
  DashboardOutlined,
  RocketOutlined,
  AlertOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';

interface BrowserStats {
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: {
    sent: number;
    received: number;
  };
  uptime: number;
}

interface BrowserMonitorProps {
  instanceId: string;
  status: 'running' | 'stopped' | 'error';
  stats?: BrowserStats;
  onRefresh?: () => void;
  refreshInterval?: number;
}

const BrowserMonitor: React.FC<BrowserMonitorProps> = ({
  instanceId,
  status,
  stats,
  onRefresh,
  refreshInterval = 5000,
}) => {
  // 自动刷新
  useEffect(() => {
    if (status === 'running' && onRefresh) {
      const timer = setInterval(onRefresh, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [status, onRefresh, refreshInterval]);

  // 格式化网络流量
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 格式化运行时间
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}天${hours}小时`;
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  const statusColor = {
    running: '#52c41a',
    stopped: '#ff4d4f',
    error: '#faad14',
  };

  return (
    <div className="browser-monitor">
      {/* 状态指示器 */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="实例状态"
              value={status === 'running' ? '运行中' : status === 'stopped' ? '已停止' : '错误'}
              valueStyle={{ color: statusColor[status] }}
              prefix={<DashboardOutlined />}
            />
          </Col>
          {stats && (
            <>
              <Col span={6}>
                <Statistic
                  title="运行时间"
                  value={formatUptime(stats.uptime)}
                  prefix={<FieldTimeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="发送流量"
                  value={formatBytes(stats.networkUsage.sent)}
                  prefix={<RocketOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="接收流量"
                  value={formatBytes(stats.networkUsage.received)}
                  prefix={<AlertOutlined />}
                />
              </Col>
            </>
          )}
        </Row>
      </Card>

      {/* 性能指标 */}
      {stats && (
        <Card title="性能监控">
          <Row gutter={16}>
            <Col span={12}>
              <div className="text-center mb-4">
                <h4>CPU使用率</h4>
                <Progress
                  type="dashboard"
                  percent={Number(stats.cpuUsage.toFixed(1))}
                  strokeColor={
                    stats.cpuUsage > 80 ? '#ff4d4f' :
                    stats.cpuUsage > 60 ? '#faad14' : '#52c41a'
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center mb-4">
                <h4>内存使用率</h4>
                <Progress
                  type="dashboard"
                  percent={Number(((stats.memoryUsage / 1024 / 1024) * 100).toFixed(1))}
                  format={percent => `${percent}%\n${(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB`}
                  strokeColor={
                    stats.memoryUsage > 800 * 1024 * 1024 ? '#ff4d4f' :
                    stats.memoryUsage > 500 * 1024 * 1024 ? '#faad14' : '#52c41a'
                  }
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div className="text-center">
                <h4>网络流量</h4>
                <div style={{ height: 200 }}>
                  {/* 这里可以添加网络流量图表，使用Ant Design Charts */}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default BrowserMonitor;
