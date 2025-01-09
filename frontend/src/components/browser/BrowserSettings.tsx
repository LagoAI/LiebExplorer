import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Tabs,
  Space,
  Alert,
  Typography,
  Divider,
  message
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  RedoOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { ProxyConfig } from './ProxyConfig';
import { FingerprintEditor } from './FingerprintEditor';

const { Text } = Typography;

// 类型定义
export interface BrowserSettings {
  basic: {
    name: string;
    maxMemory: number;
    maxCpu: number;
    downloadPath: string;
    userDataDir: string;
  };
  proxy: {
    enabled: boolean;
    type: 'http' | 'socks5';
    host: string;
    port: number;
    username?: string;
    password?: string;
    rotationEnabled: boolean;
    rotationInterval: number;
  };
  fingerprint: {
    enabled: boolean;
    userAgent: string;
    platform: string;
    resolution: [number, number];
    language: string;
    timezone: string;
    webgl: {
      vendor: string;
      renderer: string;
    };
  };
  network: {
    blockImages: boolean;
    blockCss: boolean;
    blockJs: boolean;
    customHeaders: Record<string, string>;
    requestInterception: boolean;
    cacheEnabled: boolean;
  };
  automation: {
    hideAutomation: boolean;
    stealthMode: boolean;
    scriptsEnabled: boolean;
  };
}

interface BrowserSettingsProps {
  instanceId: string;
  settings: BrowserSettings;
  onSave: (settings: BrowserSettings) => Promise<void>;
  onReset: () => Promise<void>;
  loading?: boolean;
}

const BrowserSettings: React.FC<BrowserSettingsProps> = ({
  instanceId,
  settings,
  onSave,
  onReset,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
      message.success('设置保存成功');
    } catch (error) {
      message.error('请检查表单填写是否正确');
    }
  };

  // 处理重置
  const handleReset = async () => {
    try {
      await onReset();
      form.setFieldsValue(settings);
      message.success('设置已重置');
    } catch (error) {
      message.error('重置设置失败');
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'basic',
      label: '基本设置',
      children: (
        <div className="grid grid-cols-2 gap-6">
          <Card title="实例信息" size="small">
            <Form.Item
              name={['basic', 'name']}
              label="实例名称"
              rules={[{ required: true }]}
            >
              <Input placeholder="给浏览器实例起个名字" />
            </Form.Item>

            <Form.Item
              name={['basic', 'userDataDir']}
              label="用户数据目录"
            >
              <Input placeholder="浏览器数据存储路径" />
            </Form.Item>

            <Form.Item
              name={['basic', 'downloadPath']}
              label="下载路径"
            >
              <Input placeholder="文件下载保存路径" />
            </Form.Item>
          </Card>

          <Card title="资源限制" size="small">
            <Form.Item
              name={['basic', 'maxMemory']}
              label="最大内存"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={256}
                max={8192}
                formatter={value => `${value}MB`}
                parser={value => value!.replace('MB', '')}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name={['basic', 'maxCpu']}
              label="CPU限制"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                max={100}
                formatter={value => `${value}%`}
                parser={value => value!.replace('%', '')}
                className="w-full"
              />
            </Form.Item>
          </Card>
        </div>
      ),
    },
    {
      key: 'network',
      label: '网络设置',
      children: (
        <div className="grid grid-cols-2 gap-6">
          <Card title="资源控制" size="small">
            <Form.Item
              name={['network', 'blockImages']}
              label="阻止图片"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={['network', 'blockCss']}
              label="阻止CSS"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={['network', 'blockJs']}
              label="阻止JavaScript"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={['network', 'cacheEnabled']}
              label="启用缓存"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Card>

          <Card title="请求设置" size="small">
            <Form.Item
              name={['network', 'requestInterception']}
              label="请求拦截"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="自定义请求头"
              name={['network', 'customHeaders']}
            >
              <Input.TextArea
                rows={4}
                placeholder="每行一个请求头，格式：Header: Value"
              />
            </Form.Item>
          </Card>
        </div>
      ),
    },
    {
      key: 'automation',
      label: '自动化设置',
      children: (
        <Card title="自动化选项">
          <Form.Item
            name={['automation', 'hideAutomation']}
            label="隐藏自动化特征"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['automation', 'stealthMode']}
            label="隐身模式"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name={['automation', 'scriptsEnabled']}
            label="启用自动化脚本"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Alert
            message="注意"
            description="开启自动化功能可能会增加被检测的风险"
            type="warning"
            showIcon
            className="mt-4"
          />
        </Card>
      ),
    },
    {
      key: 'proxy',
      label: '代理设置',
      children: (
        <ProxyConfig
          proxyList={[]}  // 这里应该传入实际的代理列表
          currentProxy={settings.proxy}
          rotationEnabled={settings.proxy.rotationEnabled}
          rotationInterval={settings.proxy.rotationInterval}
        />
      ),
    },
    {
      key: 'fingerprint',
      label: '指纹设置',
      children: (
        <FingerprintEditor
          value={settings.fingerprint}
        />
      ),
    },
  ];

  return (
    <div className="browser-settings">
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <SettingOutlined />
          <Text strong>浏览器实例设置</Text>
          <Tag color="blue">#{instanceId}</Tag>
        </Space>

        <Space>
          <Button
            icon={<RedoOutlined />}
            onClick={handleReset}
            disabled={loading}
          >
            重置
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            保存设置
          </Button>
        </Space>
      </div>

      <Alert
        message="设置说明"
        description="修改这些设置可能会影响浏览器实例的性能和稳定性，请谨慎操作。某些设置需要重启浏览器实例才能生效。"
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Form>
    </div>
  );
};

export default BrowserSettings;
