import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  permissions?: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, permissions = [] }) => {
  const { state } = useAuth();
  const location = useLocation();

  // 检查是否已认证
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查权限
  if (permissions.length > 0) {
    const hasPermission = permissions.every(permission => 
      state.user?.permissions.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};

// HOC 版本的路由守卫
export const withAuth = (
  WrappedComponent: React.ComponentType<any>,
  permissions: string[] = []
) => {
  return (props: any) => (
    <AuthGuard permissions={permissions}>
      <WrappedComponent {...props} />
    </AuthGuard>
  );
};
