import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tabs,
  Switch,
  Collapse,
  Tag,
  Typography,
  Tooltip,
  Alert,
  Upload,
  message
} from 'antd';
import {
  SyncOutlined,
  SaveOutlined,
  UploadOutlined,
  CopyOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { browserUtils } from '../../utils';

const { Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

export interface Fingerprint {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  timezone: string;
  resolution: [number, number];
  colorDepth: number;
  pixelRatio: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  webgl: {
    vendor: string;
    renderer: string;
    glVersion: string;
  };
  plugins: Array<{
    name: string;
    description: string;
    filename: string;
  }>;
  fonts: string[];
}

interface FingerprintEditorProps {
  value?: Partial<Fingerprint>;
  onChange?: (fingerprint: Partial<Fingerprint>) => void;
  onSave?: (fingerprint: Fingerprint) => void;
  onGenerate?: () => void;
  loading?: boolean;
}

const FingerprintEditor: React.FC<FingerprintEditorProps> = ({
  value,
  onChange,
  onSave,
  onGenerate,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  // 生成随机指纹
  const handleGenerate = () => {
    const newFingerprint = browserUtils.generateFingerprint();
    form.setFieldsValue(newFingerprint);
    onChange?.(newFingerprint);
  };

  // 处理表单值变化
  const handleValuesChange = (changedValues: any, allValues: any) => {
    onChange?.(allValues);
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave?.(values);
      message.success('指纹保存成功');
    } catch (error) {
      message.error('请检查表单填写是否正确');
    }
  };

  // 处理导入
  const handleImport: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        form.setFieldsValue(content);
        onChange?.(content);
        message.success('指纹导入成功');
      } catch (error) {
        message.error('指纹文件格式错误');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 处理复制当前指纹
  const handleCopy = () => {
    const values = form.getFieldsValue();
    navigator.clipboard.writeText(JSON.stringify(values, null, 2))
      .then(() => message.success('指纹已复制到剪贴板'))
      .catch(() => message.error('复制失败'));
  };

  return (
    <div className="fingerprint-editor">
      <Card
        title="浏览器指纹编辑器"
        extra={
          <Space>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />}>
                导入
              </Button>
            </Upload>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
            >
              复制
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={handleGenerate}
            >
              随机生成
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Alert
          message="提示"
          description="修改指纹可能会影响浏览器的正常使用，请确保设置的值合理有效。"
          type="warning"
          showIcon
          className="mb-4"
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={value}
          onValuesChange={handleValuesChange}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="userAgent"
                      label={
                        <Space>
                          <span>User Agent</span>
                          <Tooltip title="浏览器用户代理字符串">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      rules={[{ required: true, message: '请输入User Agent' }]}
                    >
                      <TextArea rows={3} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name="platform"
                        label="操作系统"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Select.Option value="Win32">Windows</Select.Option>
                          <Select.Option value="MacIntel">MacOS</Select.Option>
                          <Select.Option value="Linux x86_64">Linux</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="language"
                        label="语言"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Select.Option value="en-US">English (US)</Select.Option>
                          <Select.Option value="zh-CN">Chinese</Select.Option>
                          <Select.Option value="ja-JP">Japanese</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="timezone"
                        label="时区"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Select.Option value="Asia/Shanghai">Asia/Shanghai</Select.Option>
                          <Select.Option value="America/New_York">America/New_York</Select.Option>
                          <Select.Option value="Europe/London">Europe/London</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name={['resolution', 0]}
                        label="屏幕分辨率"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Select.Option value={1920}>1920x1080</Select.Option>
                          <Select.Option value={2560}>2560x1440</Select.Option>
                          <Select.Option value={1366}>1366x768</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                ),
              },
              {
                key: 'hardware',
                label: '硬件信息',
                children: (
                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                      name="hardwareConcurrency"
                      label="CPU核心数"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        {[2, 4, 6, 8, 12, 16].map(cores => (
                          <Select.Option key={cores} value={cores}>
                            {cores} 核
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="deviceMemory"
                      label="内存大小(GB)"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        {[4, 8, 16, 32].map(memory => (
                          <Select.Option key={memory} value={memory}>
                            {memory} GB
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="pixelRatio"
                      label="设备像素比"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        {[1, 1.5, 2, 3].map(ratio => (
                          <Select.Option key={ratio} value={ratio}>
                            {ratio}x
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'webgl',
                label: 'WebGL',
                children: (
                  <div>
                    <Form.Item
                      name={['webgl', 'vendor']}
                      label="WebGL供应商"
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name={['webgl', 'renderer']}
                      label="WebGL渲染器"
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name={['webgl', 'glVersion']}
                      label="WebGL版本"
                    >
                      <Input />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'plugins',
                label: '插件和字体',
                children: (
                  <div>
                    <Form.List name="plugins">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} className="block mb-2" align="baseline">
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                rules={[{ required: true }]}
                              >
                                <Input placeholder="插件名称" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'description']}
                              >
                                <Input placeholder="描述" />
                              </Form.Item>
                              <Button onClick={() => remove(name)} type="text" danger>
                                删除
                              </Button>
                            </Space>
                          ))}
                          <Button type="dashed" onClick={() => add()} block>
                            添加插件
                          </Button>
                        </>
                      )}
                    </Form.List>

                    <Divider />

                    <Form.List name="fonts">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} className="block mb-2" align="baseline">
                              <Form.Item
                                {...restField}
                                name={name}
                                rules={[{ required: true }]}
                              >
                                <Input placeholder="字体名称" />
                              </Form.Item>
                              <Button onClick={() => remove(name)} type="text" danger>
                                删除
                              </Button>
                            </Space>
                          ))}
                          <Button type="dashed" onClick={() => add()} block>
                            添加字体
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </div>
                ),
              }
            ]}
          />
        </Form>
      </Card>
    </div>
  );
};

export default FingerprintEditor;
