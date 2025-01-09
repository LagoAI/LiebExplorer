import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { useQuery } from 'react-query';
import { fetchSystemStats, type SystemStats as SystemStatsType } from '../services/api';
import {
  DesktopOutlined,
  RocketOutlined,
  DashboardOutlined,
  HddOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const SystemStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery<SystemStatsType>(
    'systemStats',
    fetchSystemStats,
    {
      refetchInterval: 5000, // 每5秒自动刷新
    }
  );

  if (isLoading || !stats) {
    return <Card loading={true} />;
  }

  return (
    <Card title="系统状态监控" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="总实例数"
              value={stats.totalInstances}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="活动实例"
              value={stats.activeInstances}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="CPU使用率"
              value={stats.cpuUsage}
              suffix="%"
              prefix={<DashboardOutlined />}
            />
            <Progress
              percent={stats.cpuUsage}
              status={stats.cpuUsage > 90 ? 'exception' : 'normal'}
              showInfo={false}
              strokeWidth={6}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="内存使用率"
              value={stats.memoryUsage}
              suffix="%"
              prefix={<DatabaseOutlined />}
            />
            <Progress
              percent={stats.memoryUsage}
              status={stats.memoryUsage > 90 ? 'exception' : 'normal'}
              showInfo={false}
              strokeWidth={6}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card bordered={false}>
            <Statistic
              title="磁盘使用率"
              value={stats.diskUsage}
              suffix="%"
              prefix={<HddOutlined />}
            />
            <Progress
              percent={stats.diskUsage}
              status={stats.diskUsage > 90 ? 'exception' : 'normal'}
              showInfo={false}
              strokeWidth={6}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

// 包装组件以使用 App Context
const SystemStatsWrapper: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <SystemStats />
    </div>
  );
};

export default SystemStatsWrapper;
