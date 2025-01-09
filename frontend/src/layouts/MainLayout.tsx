import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ChromeOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import BrowserManage from '../pages/BrowserManage';
import Settings from '../pages/Settings';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/browser',
      icon: <ChromeOutlined />,
      label: '浏览器管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    return [pathname === '/' ? '/' : `/${pathname.split('/')[1]}`];
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Title level={4} style={{ display: 'inline-block', margin: '0 0 0 24px' }}>
            Lei Browser 控制中心
          </Title>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{
              float: 'right',
              margin: '16px 24px',
            }}
            onClick={() => {/* TODO: 处理登出逻辑 */}}
          >
            退出登录
          </Button>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/browser" element={<BrowserManage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
