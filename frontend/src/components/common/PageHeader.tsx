import React from 'react';
import { PageHeader as AntPageHeader } from '@ant-design/pro-components';
import { Breadcrumb, Space, Button, Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface PageHeaderProps {
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  backIcon?: boolean | React.ReactNode;
  onBack?: () => void;
  tags?: React.ReactNode[];
  extra?: React.ReactNode[];
  breadcrumb?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subTitle,
  backIcon = false,
  onBack,
  tags = [],
  extra = [],
  breadcrumb,
  loading = false,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 默认的返回处理函数
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200">
      {/* 面包屑 */}
      {breadcrumb || (
        <Breadcrumb
          className="mb-4"
          items={[
            { title: '首页', path: '/' },
            ...location.pathname
              .split('/')
              .filter(Boolean)
              .map((path, index, array) => ({
                title: path.charAt(0).toUpperCase() + path.slice(1),
                path: `/${array.slice(0, index + 1).join('/')}`,
              })),
          ]}
        />
      )}

      {/* 头部内容 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* 返回按钮 */}
          {backIcon && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="mr-4"
            />
          )}
          
          {/* 标题和副标题 */}
          <div>
            <h1 className="text-2xl font-medium m-0">
              {title}
              {subTitle && (
                <span className="text-sm text-gray-500 ml-4">
                  {subTitle}
                </span>
              )}
            </h1>
          </div>

          {/* 标签 */}
          {tags.length > 0 && (
            <Space className="ml-4">
              {tags.map((tag, index) => (
                <React.Fragment key={index}>{tag}</React.Fragment>
              ))}
            </Space>
          )}
        </div>

        {/* 额外的操作按钮 */}
        {extra.length > 0 && (
          <Space size="middle">
            {extra.map((item, index) => (
              <React.Fragment key={index}>{item}</React.Fragment>
            ))}
          </Space>
        )}
      </div>

      {/* 子内容 */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

// 预设的标签组件
export const StatusTag: React.FC<{
  status: 'success' | 'processing' | 'error' | 'warning' | 'default';
  text: string;
}> = ({ status, text }) => (
  <Tag color={status === 'processing' ? 'blue' : status}>{text}</Tag>
);

// 预设的操作按钮组件
export const ActionButton: React.FC<{
  key?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'link';
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
}> = ({ icon, children, ...props }) => (
  <Button {...props} icon={icon}>
    {children}
  </Button>
);

export default PageHeader;
