import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { localStorage } from '../utils/storage';

// 类型定义
export interface User {
  id: string;
  username: string;
  token: string;
  role: 'admin' | 'user';
  permissions: string[];  // 用户权限列表
  expiresAt: number;     // token过期时间
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;   // 是否已初始化
}

type AuthAction = 
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: User | null }
  | { type: 'INIT_FAILURE'; payload: string }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: Partial<User> }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// 初始状态
const initialState: AuthState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  initialized: false
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, loading: true, initialized: false };
    case 'INIT_SUCCESS':
      return {
        ...state,
        loading: false,
        initialized: true,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'INIT_FAILURE':
      return {
        ...state,
        loading: false,
        initialized: true,
        error: action.payload
      };
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        isAuthenticated: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null
      };
    case 'TOKEN_REFRESHED':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    default:
      return state;
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'INIT_START' });
      try {
        // 从localStorage获取用户信息
        const savedUser = localStorage.get<User>('user');
        
        if (savedUser) {
          // 检查token是否过期
          if (savedUser.expiresAt && savedUser.expiresAt > Date.now()) {
            dispatch({ type: 'INIT_SUCCESS', payload: savedUser });
          } else {
            // token过期，尝试刷新
            try {
              await refreshToken();
            } catch {
              localStorage.remove('user');
              dispatch({ type: 'INIT_SUCCESS', payload: null });
            }
          }
        } else {
          dispatch({ type: 'INIT_SUCCESS', payload: null });
        }
      } catch (error) {
        dispatch({ type: 'INIT_FAILURE', payload: String(error) });
      }
    };

    initAuth();
  }, []);

  // 登录方法
  const login = useCallback(async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      // TODO: 替换为实际的API调用
      const mockUser: User = {
        id: '1',
        username,
        token: 'mock-token',
        role: 'admin',
        permissions: ['browser.create', 'browser.delete', 'browser.manage'],
        expiresAt: Date.now() + 3600000 // 1小时后过期
      };

      // 保存到localStorage
      localStorage.set('user', mockUser);

      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
      message.success('登录成功');
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: String(error) });
      message.error('登录失败');
    }
  }, []);

  // 登出方法
  const logout = useCallback(() => {
    localStorage.remove('user');
    dispatch({ type: 'LOGOUT' });
    message.success('已退出登录');
  }, []);

  // 刷新token
  const refreshToken = useCallback(async () => {
    try {
      if (!state.user) return;

      // TODO: 替换为实际的API调用
      const refreshedData = {
        token: 'new-mock-token',
        expiresAt: Date.now() + 3600000
      };

      // 更新localStorage
      localStorage.set('user', { ...state.user, ...refreshedData });

      dispatch({ type: 'TOKEN_REFRESHED', payload: refreshedData });
    } catch (error) {
      message.error('刷新token失败');
      logout();
    }
  }, [state.user]);

  // 检查权限
  const hasPermission = useCallback((permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  }, [state.user]);

  // 更新用户信息
  const updateUser = useCallback((userData: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...userData };
    localStorage.set('user', updatedUser);
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, [state.user]);

  // 自动刷新token
  useEffect(() => {
    if (!state.user?.expiresAt) return;

    const timeUntilExpiry = state.user.expiresAt - Date.now();
    // 在过期前5分钟刷新token
    const refreshTime = timeUntilExpiry - 300000;

    if (refreshTime <= 0) {
      refreshToken();
      return;
    }

    const timer = setTimeout(refreshToken, refreshTime);
    return () => clearTimeout(timer);
  }, [state.user?.expiresAt]);

  // 提供给子组件的值
  const value = {
    state,
    login,
    logout,
    refreshToken,
    hasPermission,
    updateUser
  };

  if (!state.initialized) {
    return null; // 或者返回loading组件
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 权限检查Hook
export const usePermission = () => {
  const { hasPermission } = useAuth();
  return hasPermission;
};

// 请求认证Hook
export const useRequireAuth = () => {
  const { state } = useAuth();
  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading
  };
};
