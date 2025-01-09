/**
 * 请求工具函数
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * 请求重试配置
 */
interface RetryConfig {
  retries: number;       // 重试次数
  retryDelay: number;    // 重试延迟(ms)
  retryCondition?: (error: AxiosError) => boolean;  // 重试条件
}

/**
 * 并发控制配置
 */
interface ConcurrencyConfig {
  maxConcurrent: number;  // 最大并发数
  queueSize: number;      // 队列大小
}

/**
 * 缓存配置
 */
interface CacheConfig {
  maxAge: number;        // 缓存时间(ms)
  capacity: number;      // 缓存容量
}

/**
 * 创建支持重试的axios实例
 */
export const createRetryableRequest = (config: AxiosRequestConfig, retryConfig: RetryConfig) => {
  const instance = axios.create(config);

  // 添加重试拦截器
  instance.interceptors.response.use(null, async (error: AxiosError) => {
    const { retries = 3, retryDelay = 1000, retryCondition } = retryConfig;
    
    let retryCount = 0;
    const shouldRetry = retryCondition || ((error: AxiosError) => {
      const { response } = error;
      return !response || response.status >= 500;
    });

    const axiosConfig = error.config;
    if (!axiosConfig) return Promise.reject(error);

    const retry = async (): Promise<AxiosResponse> => {
      try {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return await instance.request(axiosConfig);
      } catch (retryError) {
        if (retryCount < retries && shouldRetry(retryError as AxiosError)) {
          retryCount++;
          return retry();
        }
        throw retryError;
      }
    };

    if (shouldRetry(error)) {
      return retry();
    }
    
    return Promise.reject(error);
  });

  return instance;
};

/**
 * 创建具有并发控制的请求函数
 */
export const createConcurrencyControlledRequest = (
  config: AxiosRequestConfig,
  concurrencyConfig: ConcurrencyConfig
) => {
  const instance = axios.create(config);
  const queue: (() => Promise<void>)[] = [];
  let activeCount = 0;

  const processQueue = async () => {
    if (activeCount >= concurrencyConfig.maxConcurrent || queue.length === 0) {
      return;
    }

    const task = queue.shift();
    if (task) {
      activeCount++;
      try {
        await task();
      } finally {
        activeCount--;
        processQueue();
      }
    }
  };

  return async <T>(config: AxiosRequestConfig): Promise<T> => {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          const response = await instance.request(config);
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      };

      if (activeCount < concurrencyConfig.maxConcurrent) {
        task();
      } else if (queue.length < concurrencyConfig.queueSize) {
        queue.push(task);
      } else {
        reject(new Error('Request queue is full'));
      }
    });
  };
};

/**
 * 简单的LRU缓存实现
 */
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; timestamp: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item) {
      // 更新位置
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    }
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * 创建支持缓存的请求函数
 */
export const createCacheableRequest = (
  config: AxiosRequestConfig,
  cacheConfig: CacheConfig
) => {
  const instance = axios.create(config);
  const cache = new LRUCache<string, { data: any; timestamp: number }>(cacheConfig.capacity);

  return async <T>(config: AxiosRequestConfig): Promise<T> => {
    const cacheKey = JSON.stringify({
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
    });

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheConfig.maxAge) {
      return cached.data;
    }

    const response = await instance.request(config);
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  };
};

/**
 * 创建取消令牌
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * 判断请求是否被取消
 */
export const isRequestCancelled = (error: any): boolean => {
  return axios.isCancel(error);
};

// 使用示例:
/*
// 创建支持重试的请求
const retryableRequest = createRetryableRequest(
  { baseURL: '/api' },
  { retries: 3, retryDelay: 1000 }
);

// 创建支持并发控制的请求
const concurrentRequest = createConcurrencyControlledRequest(
  { baseURL: '/api' },
  { maxConcurrent: 5, queueSize: 10 }
);

// 创建支持缓存的请求
const cacheableRequest = createCacheableRequest(
  { baseURL: '/api' },
  { maxAge: 5000, capacity: 100 }
);
*/
