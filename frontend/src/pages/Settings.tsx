import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  InputNumber, 
  Space, 
  message, 
  Divider,
  Select,
  Tabs,
  Upload,
  Alert
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from 'react-query';
import { fetchSettings, updateSettings } from '../services/api';

const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  // 获取设置
  const { data: settings, isLoading } = useQuery('settings', fetchSettings, {
    onSuccess: (data) => {
      form.setFieldsValue(data);
    },
  });

  // 更新设置
  const mutation = useMutation(updateSettings, {
    onSuccess: () => {
      message.success('设置已保存');
    },
    onError: (error: Error) => {
      message.error(`保存失败: ${error.message}`);
    },
  });

  // 处理表单提交
  const handleSubmit = (values: any) => {
    mutation.mutate(values);
  };

  // 代理类型选项
  const proxyTypes = [
    { label: '无代理', value: 'none' },
    { label: 'HTTP代理', value: 'http' },
    { label: 'SOCKS5代理', value: 'socks5' },
    { label: 'SSH隧道', value: 'ssh' }
  ];

  return (
    <Card title="系统设置" loading={isLoading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          instanceLimit: 10,
          proxyType: 'none',
          enableStealth: true,
          enableRandomization: true
        }}
      >
        <Tabs defaultActiveKey="basic">
          {/* 基本设置 */}
          <TabPane tab="基本设置" key="basic">
            <Form.Item
              name="instanceLimit"
              label="实例数量限制"
              tooltip="系统允许创建的最大浏览器实例数量"
              rules={[{ required: true, message: '请输入实例数量限制' }]}
            >
              <InputNumber min={1} max={50} />
            </Form.Item>

            <Form.Item
              name="userDataDir"
              label="用户数据目录"
              tooltip="Chrome用户数据存储路径"
              rules={[{ required: true, message: '请输入用户数据目录' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="logLevel"
              label="日志级别"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="debug">Debug</Option>
                <Option value="info">Info</Option>
                <Option value="warn">Warning</Option>
                <Option value="error">Error</Option>
              </Select>
            </Form.Item>
          </TabPane>

          {/* 代理设置 */}
          <TabPane tab="代理设置" key="proxy">
            <Form.Item
              name="proxyType"
              label="代理类型"
              rules={[{ required: true }]}
            >
              <Select options={proxyTypes} />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.proxyType !== currentValues.proxyType
              }
            >
              {({ getFieldValue }) => {
                const proxyType = getFieldValue('proxyType');
                return proxyType !== 'none' ? (
                  <>
                    <Form.Item
                      name="proxyHost"
                      label="代理服务器"
                      rules={[{ required: true, message: '请输入代理服务器地址' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="proxyPort"
                      label="代理端口"
                      rules={[{ required: true, message: '请输入代理端口' }]}
                    >
                      <InputNumber min={1} max={65535} />
                    </Form.Item>
                    <Form.Item
                      name="proxyUsername"
                      label="用户名"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="proxyPassword"
                      label="密码"
                    >
                      <Input.Password />
                    </Form.Item>
                  </>
                ) : null;
              }}
            </Form.Item>

            <Form.Item
              name="proxyRules"
              label="代理规则"
            >
              <Input.TextArea
                rows={4}
                placeholder="每行一条规则，例如：*.example.com"
              />
            </Form.Item>
          </TabPane>

          {/* 性能设置 */}
          <TabPane tab="性能设置" key="performance">
            <Form.Item
              name="maxMemoryUsage"
              label="最大内存使用(MB)"
              rules={[{ required: true }]}
            >
              <InputNumber min={512} max={8192} />
            </Form.Item>

            <Form.Item
              name="maxCpuUsage"
              label="CPU使用限制(%)"
              rules={[{ required: true }]}
            >
              <InputNumber min={10} max={100} />
            </Form.Item>

            <Form.Item
              name="enableProcessLimit"
              label="启用进程数量限制"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.enableProcessLimit !== currentValues.enableProcessLimit
              }
            >
              {({ getFieldValue }) => 
                getFieldValue('enableProcessLimit') ? (
                  <Form.Item
                    name="maxProcesses"
                    label="最大进程数"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} max={20} />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </TabPane>

          {/* 指纹设置 */}
          <TabPane tab="指纹设置" key="fingerprint">
            <Form.Item
              name="enableStealth"
              label="启用隐身模式"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableRandomization"
              label="启用指纹随机化"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="customUserAgent"
              label="自定义 User Agent"
            >
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item
              name="fingerprintTemplate"
              label="指纹模板"
            >
              <Upload
                accept=".json"
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const template = JSON.parse(reader.result as string);
                      form.setFieldsValue({ fingerprintTemplate: template });
                      message.success('指纹模板已载入');
                    } catch (e) {
                      message.error('无效的指纹模板文件');
                    }
                  };
                  reader.readAsText(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>上传模板</Button>
              </Upload>
            </Form.Item>
          </TabPane>

          {/* 其他设置 */}
          <TabPane tab="其他设置" key="other">
            <Form.Item
              name="enableAutoUpdate"
              label="启用自动更新"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableAnalytics"
              label="启用数据分析"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Alert
              message="注意"
              description="修改某些设置可能需要重启系统才能生效。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </TabPane>
        </Tabs>

        <Divider />

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
              保存设置
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Settings;
