import React from 'react';
import { useRoutes } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { RouteConfig } from './routes';
import { AuthGuard } from './AuthGuard';
import { useAuth } from '../contexts/AuthContext';

// 生成路由配置
export const generateRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  return routes.map(route => {
    const newRoute = { ...route };

    // 处理需要认证的路由
    if (newRoute.auth) {
      const element = newRoute.element;
      newRoute.element = (
        <AuthGuard permissions={newRoute.permission}>
          {element}
        </AuthGuard>
      );
    }

    // 递归处理子路由
    if (newRoute.children) {
      newRoute.children = generateRoutes(newRoute.children);
    }

    return newRoute;
  });
};

// 生成菜单项
export const generateMenuItems = (
  routes: RouteConfig[],
  parentPath: string = ''
): MenuProps['items'] => {
  const { hasPermission } = useAuth();

  return routes
    .filter(route => 
      !route.hideInMenu && 
      (!route.permission || route.permission.every(p => hasPermission(p)))
    )
    .map(route => {
      const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;

      // 基础菜单项
      const menuItem = {
        key: fullPath,
        icon: route.icon,
        label: route.name,
      };

      // 处理子菜单
      if (route.children && !route.hideChildrenInMenu) {
        const children = generateMenuItems(route.children, fullPath);
        if (children && children.length > 0) {
          return {
            ...menuItem,
            children,
          };
        }
      }

      return menuItem;
    })
    .filter(Boolean);
};

// 路由渲染组件
const RouterGenerator: React.FC<{ routes: RouteConfig[] }> = ({ routes }) => {
  const processedRoutes = generateRoutes(routes);
  const element = useRoutes(processedRoutes);
  return element;
};

export default RouterGenerator;
