import axios from 'axios';
import type { AxiosError } from 'axios';

// API 基础配置
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 接口类型定义
export interface SystemStats {
    totalInstances: number;
    activeInstances: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
}

export interface BrowserInstance {
    id: string;
    status: 'running' | 'stopped';
    currentUrl: string;
    startTime: string;
    memoryUsage: number;
    fingerprint: Record<string, any>;
    performance: Record<string, any>;
}

export interface Settings {
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

export interface CreateInstanceParams {
    instanceCount: number;
}

export interface VisitUrlParams {
    id: string;
    url: string;
}

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
    async (error: AxiosError) => {
        const { config } = error;
        if (!config) {
            return Promise.reject(error);
        }

        // 重试配置
        const retryConfig = config as any;
        retryConfig.retryCount = retryConfig.retryCount || 0;
        const maxRetries = 3;
        const retryDelay = 1000;

        // 处理错误状态
        if (error.response) {
            const { status } = error.response;
            switch (status) {
                case 401:
                    // 未认证，重定向到登录页
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('无权限访问');
                    break;
                case 500:
                    console.error('服务器错误');
                    break;
                default:
                    // 如果是网络错误或CORS错误，尝试重试
                    if (retryConfig.retryCount < maxRetries) {
                        retryConfig.retryCount += 1;
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return api(retryConfig);
                    }
            }
        }

        return Promise.reject(error);
    }
);

// API 请求函数
export const fetchSystemStats = async (): Promise<SystemStats> => {
    const response = await api.get('/stats');
    return response.data;
};

export const fetchBrowserInstances = async (): Promise<BrowserInstance[]> => {
    const response = await api.get('/browser/instances');
    return response.data;
};

export const createBrowserInstance = async (params: CreateInstanceParams): Promise<BrowserInstance[]> => {
    const response = await api.post('/browser/instances', params);
    return response.data;
};

export const deleteBrowserInstance = async (id: string): Promise<void> => {
    await api.delete(`/browser/instances/${id}`);
};

export const startBrowserInstance = async (id: string): Promise<void> => {
    await api.post(`/browser/instances/${id}/start`);
};

export const stopBrowserInstance = async (id: string): Promise<void> => {
    await api.post(`/browser/instances/${id}/stop`);
};

export const visitUrl = async (params: VisitUrlParams): Promise<void> => {
    await api.post(`/browser/instances/${params.id}/visit`, { url: params.url });
};

export const fetchSettings = async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.put('/settings', settings);
    return response.data;
};

// 批量操作接口
export const batchVisitUrl = async (instanceIds: string[], url: string): Promise<void> => {
    await api.post('/browser/instances/batch/visit', { instance_ids: instanceIds, url });
};

export const batchDeleteInstances = async (instanceIds: string[]): Promise<void> => {
    await api.delete('/browser/instances/batch', { data: { instance_ids: instanceIds } });
};

// 错误处理工具函数
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    return '未知错误';
};

export default api;
