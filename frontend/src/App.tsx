import React from 'react';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { ThemeConfig } from 'antd';

// 主题配置
const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 4,
    // 可以添加其他主题配置
  },
};

// React Query 错误处理函数
const handleQueryError = (error: any) => {
  if (error?.response) {
    message.error(error.response.data?.message || '请求失败');
  } else if (error?.message) {
    message.error(error.message);
  } else {
    message.error('未知错误');
  }
};

// React Query 客户端配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 1000, // 数据5秒内认为是新鲜的
      cacheTime: 10 * 60 * 1000, // 缓存10分钟
      onError: handleQueryError,
    },
    mutations: {
      onError: handleQueryError,
      retry: false,
    },
  },
});

// 全局消息配置
message.config({
  duration: 3,
  maxCount: 3,
});

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      componentSize="middle"
      // 可以添加其他全局配置
      form={{ 
        validateMessages: { 
          required: '${label}不能为空',
          // 其他验证消息配置
        } 
      }}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MainLayout />
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
