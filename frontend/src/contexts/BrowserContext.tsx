import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from './AuthContext';

// 类型定义
export interface BrowserInstance {
  id: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  currentUrl: string;
  startTime: string;
  memoryUsage: number;
  fingerprint: {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    resolution: [number, number];
  };
  proxy: {
    enabled: boolean;
    type: 'http' | 'socks5' | null;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkUsage: {
      sent: number;
      received: number;
    };
  };
}

export interface SystemStats {
  totalInstances: number;
  runningInstances: number;
  cpuUsage: number;
  memoryUsage: number;
  networkUsage: {
    sent: number;
    received: number;
  };
}

interface BrowserState {
  instances: BrowserInstance[];
  selectedInstanceIds: string[];
  systemStats: SystemStats | null;
  loading: {
    instances: boolean;
    stats: boolean;
    operations: boolean;
  };
  error: string | null;
  filters: {
    status?: string[];
    search?: string;
  };
}

type BrowserAction =
  | { type: 'SET_LOADING'; payload: { key: keyof BrowserState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INSTANCES'; payload: BrowserInstance[] }
  | { type: 'SET_SELECTED_INSTANCES'; payload: string[] }
  | { type: 'SET_SYSTEM_STATS'; payload: SystemStats }
  | { type: 'UPDATE_INSTANCE'; payload: { id: string; data: Partial<BrowserInstance> } }
  | { type: 'ADD_INSTANCE'; payload: BrowserInstance }
  | { type: 'REMOVE_INSTANCE'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<BrowserState['filters']> }
  | { type: 'BATCH_UPDATE_INSTANCES'; payload: { ids: string[]; data: Partial<BrowserInstance> } };

// 初始状态
const initialState: BrowserState = {
  instances: [],
  selectedInstanceIds: [],
  systemStats: null,
  loading: {
    instances: false,
    stats: false,
    operations: false
  },
  error: null,
  filters: {}
};

// Reducer
function browserReducer(state: BrowserState, action: BrowserAction): BrowserState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
    case 'SET_ERROR':
      return { 
        ...state,
        error: action.payload,
        loading: { ...state.loading, operations: false }
      };
    case 'SET_INSTANCES':
      return {
        ...state,
        instances: action.payload,
        loading: { ...state.loading, instances: false }
      };
    case 'SET_SELECTED_INSTANCES':
      return {
        ...state,
        selectedInstanceIds: action.payload
      };
    case 'SET_SYSTEM_STATS':
      return {
        ...state,
        systemStats: action.payload,
        loading: { ...state.loading, stats: false }
      };
    case 'UPDATE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map(instance =>
          instance.id === action.payload.id
            ? { ...instance, ...action.payload.data }
            : instance
        )
      };
    case 'ADD_INSTANCE':
      return {
        ...state,
        instances: [...state.instances, action.payload]
      };
    case 'REMOVE_INSTANCE':
      return {
        ...state,
        instances: state.instances.filter(instance => instance.id !== action.payload),
        selectedInstanceIds: state.selectedInstanceIds.filter(id => id !== action.payload)
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'BATCH_UPDATE_INSTANCES':
      return {
        ...state,
        instances: state.instances.map(instance =>
          action.payload.ids.includes(instance.id)
            ? { ...instance, ...action.payload.data }
            : instance
        )
      };
    default:
      return state;
  }
}

// Context
interface BrowserContextType {
  state: BrowserState;
  // 实例管理
  createInstances: (count: number, options?: Partial<BrowserInstance>) => Promise<void>;
  deleteInstances: (ids: string[]) => Promise<void>;
  startInstances: (ids: string[]) => Promise<void>;
  stopInstances: (ids: string[]) => Promise<void>;
  // URL操作
  visitUrl: (ids: string[], url: string) => Promise<void>;
  refreshInstances: (ids: string[]) => Promise<void>;
  // 选择操作
  selectInstances: (ids: string[]) => void;
  clearSelection: () => void;
  // 过滤和搜索
  setFilters: (filters: Partial<BrowserState['filters']>) => void;
  // 代理和指纹
  updateProxy: (id: string, proxyConfig: Partial<BrowserInstance['proxy']>) => Promise<void>;
  updateFingerprint: (id: string, fingerprint: Partial<BrowserInstance['fingerprint']>) => Promise<void>;
  // 系统状态
  refreshSystemStats: () => Promise<void>;
}

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

// Provider组件
export const BrowserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(browserReducer, initialState);
  const { state: authState } = useAuth();

  // 创建实例
  const createInstances = useCallback(async (count: number, options?: Partial<BrowserInstance>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      const newInstances = Array.from({ length: count }, (_, index) => ({
        id: Date.now() + index + '',
        status: 'creating' as const,
        currentUrl: '',
        startTime: new Date().toISOString(),
        memoryUsage: 0,
        fingerprint: {
          userAgent: 'Mozilla/5.0...',
          platform: 'Windows',
          language: 'en-US',
          timezone: 'UTC',
          resolution: [1920, 1080],
          ...options?.fingerprint
        },
        proxy: {
          enabled: false,
          type: null,
          host: '',
          port: 0,
          ...options?.proxy
        },
        performance: {
          cpuUsage: 0,
          memoryUsage: 0,
          networkUsage: { sent: 0, received: 0 }
        },
        ...options
      }));

      newInstances.forEach(instance => {
        dispatch({ type: 'ADD_INSTANCE', payload: instance });
      });

      message.success(`成功创建 ${count} 个实例`);
      await refreshSystemStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('创建实例失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 删除实例
  const deleteInstances = useCallback(async (ids: string[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      ids.forEach(id => {
        dispatch({ type: 'REMOVE_INSTANCE', payload: id });
      });

      message.success(`成功删除 ${ids.length} 个实例`);
      await refreshSystemStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('删除实例失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 启动实例
  const startInstances = useCallback(async (ids: string[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      dispatch({
        type: 'BATCH_UPDATE_INSTANCES',
        payload: {
          ids,
          data: { status: 'running' }
        }
      });

      message.success(`成功启动 ${ids.length} 个实例`);
      await refreshSystemStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('启动实例失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 停止实例
  const stopInstances = useCallback(async (ids: string[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      dispatch({
        type: 'BATCH_UPDATE_INSTANCES',
        payload: {
          ids,
          data: { status: 'stopped' }
        }
      });

      message.success(`成功停止 ${ids.length} 个实例`);
      await refreshSystemStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('停止实例失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 访问URL
  const visitUrl = useCallback(async (ids: string[], url: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      dispatch({
        type: 'BATCH_UPDATE_INSTANCES',
        payload: {
          ids,
          data: { currentUrl: url }
        }
      });

      message.success(`成功访问URL: ${url}`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('访问URL失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 刷新实例
  const refreshInstances = useCallback(async (ids: string[]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'instances', value: true } });
      
      // TODO: 实际API调用
      // const instances = await api.refreshInstances(ids);
      // dispatch({ type: 'SET_INSTANCES', payload: instances });

      message.success('实例刷新成功');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('刷新实例失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'instances', value: false } });
    }
  }, []);

  // 选择实例
  const selectInstances = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTED_INSTANCES', payload: ids });
  }, []);

  // 清除选择
  const clearSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_INSTANCES', payload: [] });
  }, []);

  // 设置过滤器
  const setFilters = useCallback((filters: Partial<BrowserState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // 更新代理配置
  const updateProxy = useCallback(async (
    id: string,
    proxyConfig: Partial<BrowserInstance['proxy']>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      dispatch({
        type: 'UPDATE_INSTANCE',
        payload: { 
          id,
          data: { proxy: proxyConfig }
        }
      });

      message.success('代理配置更新成功');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('更新代理配置失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 更新指纹
  const updateFingerprint = useCallback(async (
    id: string,
    fingerprint: Partial<BrowserInstance['fingerprint']>
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: true } });
      
      // TODO: 实际API调用
      dispatch({
        type: 'UPDATE_INSTANCE',
        payload: { 
          id,
          data: { fingerprint }
        }
      });

      message.success('浏览器指纹更新成功');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('更新浏览器指纹失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'operations', value: false } });
    }
  }, []);

  // 刷新系统状态
  const refreshSystemStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stats', value: true } });
      
      // TODO: 实际API调用
      const mockStats: SystemStats = {
        totalInstances: state.instances.length,
        runningInstances: state.instances.filter(i => i.status === 'running').length,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkUsage: {
          sent: Math.random() * 1024 * 1024,
          received: Math.random() * 1024 * 1024
        }
      };

      dispatch({ type: 'SET_SYSTEM_STATS', payload: mockStats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      message.error('刷新系统状态失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'stats', value: false } });
    }
  }, [state.instances]);

  // 自动刷新系统状态
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const statsTimer = setInterval(refreshSystemStats, 5000);
    return () => clearInterval(statsTimer);
  }, [authState.isAuthenticated]);

  // 自动刷新实例状态
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const instancesTimer = setInterval(() => {
      const runningIds = state.instances
        .filter(instance => instance.status === 'running')
        .map(instance => instance.id);
      
      if (runningIds.length > 0) {
        refreshInstances(runningIds);
      }
    }, 10000);

    return () => clearInterval(instancesTimer);
  }, [authState.isAuthenticated, state.instances]);

  // 提供给子组件的值
  const value = {
    state,
    createInstances,
    deleteInstances,
    startInstances,
    stopInstances,
    visitUrl,
    refreshInstances,
    selectInstances,
    clearSelection,
    setFilters,
    updateProxy,
    updateFingerprint,
    refreshSystemStats
  };

  return (
    <BrowserContext.Provider value={value}>
      {children}
    </BrowserContext.Provider>
  );
};

// Hook
export const useBrowser = () => {
  const context = useContext(BrowserContext);
  if (context === undefined) {
    throw new Error('useBrowser must be used within a BrowserProvider');
  }
  return context;
};

// 获取选中实例的Hook
export const useSelectedInstances = () => {
  const { state } = useBrowser();
  return state.instances.filter(instance => 
    state.selectedInstanceIds.includes(instance.id)
  );
};

// 获取实例状态统计的Hook
export const useInstanceStats = () => {
  const { state } = useBrowser();
  
  return {
    total: state.instances.length,
    running: state.instances.filter(i => i.status === 'running').length,
    stopped: state.instances.filter(i => i.status === 'stopped').length,
    error: state.instances.filter(i => i.status === 'error').length,
    creating: state.instances.filter(i => i.status === 'creating').length
  };
};

// 过滤实例的Hook
export const useFilteredInstances = () => {
  const { state } = useBrowser();
  const { instances, filters } = state;

  return instances.filter(instance => {
    // 状态过滤
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(instance.status)) {
        return false;
      }
    }

    // 搜索过滤
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        instance.id.toLowerCase().includes(searchLower) ||
        instance.currentUrl.toLowerCase().includes(searchLower) ||
        instance.fingerprint.userAgent.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
};
