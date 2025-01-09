import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress } from 'antd';
import { ChromeOutlined, DesktopOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { fetchSystemStats, fetchBrowserInstances } from '../services/api';

const Dashboard: React.FC = () => {
  // 获取系统统计信息
  const { data: stats = {
    totalInstances: 0,
    activeInstances: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0
  } } = useQuery('systemStats', fetchSystemStats);

  // 获取浏览器实例列表
  const { data: instances = [] } = useQuery('browserInstances', fetchBrowserInstances);

  // 表格列定义
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
        <span style={{ color: status === 'running' ? '#52c41a' : '#ff4d4f' }}>
          {status === 'running' ? '运行中' : '已停止'}
        </span>
      ),
    },
    {
      title: '当前URL',
      dataIndex: 'currentUrl',
      key: 'currentUrl',
      ellipsis: true,
    },
    {
      title: '内存使用',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (mem: number) => `${Math.round(mem / 1024 / 1024)} MB`,
    },
    {
      title: '启动时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总实例数"
              value={stats.totalInstances}
              prefix={<ChromeOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="活跃实例"
              value={stats.activeInstances}
              prefix={<NodeIndexOutlined />}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="系统负载"
              value={stats.cpuUsage}
              prefix={<DesktopOutlined />}
              suffix="%"
              valueStyle={{ color: stats.cpuUsage > 80 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card title="CPU使用率">
            <Progress type="dashboard" percent={Math.round(stats.cpuUsage)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="内存使用率">
            <Progress type="dashboard" percent={Math.round(stats.memoryUsage)} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="磁盘使用率">
            <Progress type="dashboard" percent={Math.round(stats.diskUsage)} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} title="实例监控">
        <Table
          columns={columns}
          dataSource={instances}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
