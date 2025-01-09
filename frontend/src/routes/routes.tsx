import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import {
  DashboardOutlined,
  ChromeOutlined,
  SettingOutlined,
  ProfileOutlined,
  TeamOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';

// 布局组件
import MainLayout from '../layouts/MainLayout';

// 页面组件
import Dashboard from '../pages/Dashboard';
import BrowserManage from '../pages/BrowserManage';
import BrowserDetail from '../pages/BrowserDetail';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import UserManage from '../pages/UserManage';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

// 权限定义
export enum Permission {
  BROWSER_VIEW = 'browser.view',
  BROWSER_MANAGE = 'browser.manage',
  SETTINGS_VIEW = 'settings.view',
  USER_MANAGE = 'user.manage',
}

// 路由配置接口
export interface RouteConfig extends RouteObject {
  auth?: boolean;               // 是否需要认证
  permission?: Permission[];    // 所需权限
  icon?: React.ReactNode;       // 菜单图标
  hideInMenu?: boolean;         // 是否在菜单中隐藏
  hideChildrenInMenu?: boolean; // 隐藏子菜单
  name?: string;               // 路由名称
  children?: RouteConfig[];    // 子路由
}

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <MainLayout />,
    auth: true,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
        hideInMenu: true,
      },
      {
        path: 'dashboard',
        name: '仪表盘',
        element: <Dashboard />,
        icon: <DashboardOutlined />,
      },
      {
        path: 'browser',
        name: '浏览器管理',
        icon: <ChromeOutlined />,
        permission: [Permission.BROWSER_VIEW],
        children: [
          {
            index: true,
            element: <BrowserManage />,
          },
          {
            path: ':id',
            element: <BrowserDetail />,
            hideInMenu: true,
          },
        ],
      },
      {
        path: 'settings',
        name: '系统设置',
        element: <Settings />,
        icon: <SettingOutlined />,
        permission: [Permission.SETTINGS_VIEW],
      },
      {
        path: 'profile',
        name: '个人中心',
        element: <Profile />,
        icon: <ProfileOutlined />,
        hideInMenu: true,
      },
      {
        path: 'users',
        name: '用户管理',
        element: <UserManage />,
        icon: <TeamOutlined />,
        permission: [Permission.USER_MANAGE],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
