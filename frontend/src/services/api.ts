import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',  // API的base URL
  timeout: 30000,   // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 接口类型定义
interface SystemStats {
  totalInstances: number;
  activeInstances: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

interface BrowserInstance {
  id: string;
  status: 'running' | 'stopped';
  currentUrl: string;
  startTime: string;
  memoryUsage: number;
}

interface Settings {
  instanceLimit: number;
  userDataDir: string;
  logLevel: string;
  proxyType: string;
  proxyHost?: string;
  proxyPort?: number;
  proxyUsername?: string;
  proxyPassword?: string;
  proxyRules?: string;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  enableProcessLimit: boolean;
  maxProcesses?: number;
  enableStealth: boolean;
  enableRandomization: boolean;
  customUserAgent?: string;
  fingerprintTemplate?: object;
  enableAutoUpdate: boolean;
  enableAnalytics: boolean;
}

interface CreateInstanceParams {
  instanceCount: number;
}

interface VisitUrlParams {
  id: string;
  url: string;
}

// API 请求函数
export const fetchSystemStats = async (): Promise<SystemStats> => {
  const response = await api.get('/stats');
  return response.data;
};

export const fetchBrowserInstances = async (): Promise<BrowserInstance[]> => {
  const response = await api.get('/instances');
  return response.data;
};

export const createBrowserInstance = async (params: CreateInstanceParams): Promise<BrowserInstance> => {
  const response = await api.post('/instances', params);
  return response.data;
};

export const deleteBrowserInstance = async (id: string): Promise<void> => {
  await api.delete(`/instances/${id}`);
};

export const startBrowserInstance = async (id: string): Promise<void> => {
  await api.post(`/instances/${id}/start`);
};

export const stopBrowserInstance = async (id: string): Promise<void> => {
  await api.post(`/instances/${id}/stop`);
};

export const visitUrl = async (params: VisitUrlParams): Promise<void> => {
  await api.post(`/instances/${params.id}/visit`, { url: params.url });
};

export const fetchSettings = async (): Promise<Settings> => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const response = await api.put('/settings', settings);
  return response.data;
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在这里可以添加认证token等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 处理特定状态码
      switch (status) {
        case 401:
          // 未认证，可以重定向到登录页
          window.location.href = '/login';
          break;
        case 403:
          // 无权限
          console.error('无权限访问');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败');
      }
    }
    return Promise.reject(error);
  }
);

// 导出API实例供其他地方使用
export default api;
