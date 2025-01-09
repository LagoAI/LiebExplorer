import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, List, Tag } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatBytes, formatDuration } from '../../utils/format';

const { Text } = Typography;

interface PerformanceData {
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkUsage: {
    sent: number;
    received: number;
  };
  timestamp: number;
}

interface BrowserMonitorProps {
  instanceId: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  currentPerformance: PerformanceData;
  historicalData: PerformanceData[];
  onRefresh?: () => void;
  loading?: boolean;
}

const BrowserMonitor: React.FC<BrowserMonitorProps> = ({
  instanceId,
  status,
  uptime,
  currentPerformance,
  historicalData,
  loading = false,
}) => {
  // 计算内存使用百分比
  const memoryUsagePercent = Math.round(
    (currentPerformance.memoryUsage / currentPerformance.memoryLimit) * 100
  );

  // 计算网络使用总量
  const totalNetworkUsage = 
    currentPerformance.networkUsage.sent + 
    currentPerformance.networkUsage.received;

  return (
    <div className="browser-monitor">
      {/* 基本状态信息 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="实例状态"
              value={status}
              valueStyle={{ 
                color: status === 'running' ? '#52c41a' : 
                       status === 'error' ? '#f5222d' : '#d9d9d9'
              }}
              prefix={
                <Tag color={
                  status === 'running' ? 'success' : 
                  status === 'error' ? 'error' : 'default'
                }>
                  {status === 'running' ? '运行中' : 
                   status === 'error' ? '错误' : '已停止'}
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行时间"
              value={formatDuration(uptime)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={currentPerformance.cpuUsage}
              suffix="%"
              valueStyle={{ 
                color: currentPerformance.cpuUsage > 80 ? '#f5222d' : '#52c41a'
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用"
              value={formatBytes(currentPerformance.memoryUsage)}
              suffix={`/ ${formatBytes(currentPerformance.memoryLimit)}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能图表 */}
      <Card title="性能监控" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={historicalData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value}%`, 'CPU使用率']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={historicalData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [formatBytes(value), '内存使用']}
                  />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 详细指标 */}
      <Card title="性能指标">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="mb-4">
              <Text strong>CPU使用率</Text>
              <Progress
                percent={Math.round(currentPerformance.cpuUsage)}
                status={currentPerformance.cpuUsage > 80 ? 'exception' : 'normal'}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="mb-4">
              <Text strong>内存使用率</Text>
              <Progress
                percent={memoryUsagePercent}
                status={memoryUsagePercent > 80 ? 'exception' : 'normal'}
              />
            </div>
          </Col>
          <Col span={8}>
            <List size="small">
              <List.Item>
                <Text>发送数据：{formatBytes(currentPerformance.networkUsage.sent)}</Text>
              </List.Item>
              <List.Item>
                <Text>接收数据：{formatBytes(currentPerformance.networkUsage.received)}</Text>
              </List.Item>
              <List.Item>
                <Text>总流量：{formatBytes(totalNetworkUsage)}</Text>
              </List.Item>
            </List>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BrowserMonitor;
