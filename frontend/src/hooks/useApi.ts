import { useState, useCallback } from 'react';
import { message } from 'antd';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  errorMessage?: string;
  successMessage?: string;
}

export function useApi<T = any, P = any>(
  apiFunction: (params?: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (params?: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(params);
        setData(result);
        
        // 处理成功回调
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        // 显示成功提示
        if (options.successMessage) {
          message.success(options.successMessage);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        // 处理错误回调
        if (options.onError) {
          options.onError(error);
        }
        
        // 显示错误提示
        if (options.errorMessage) {
          message.error(options.errorMessage);
        } else {
          message.error(error.message);
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}

// 使用示例
/*
const {
  data: instances,
  loading,
  error,
  execute: fetchInstances
} = useApi(fetchBrowserInstances, {
  successMessage: '获取实例列表成功',
  errorMessage: '获取实例列表失败'
});

// 调用API
await fetchInstances();
*/

export default useApi;
