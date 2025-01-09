/**
 * 浏览器工具函数
 */

// 浏览器指纹类型定义
export interface BrowserFingerprint {
  userAgent: string;
  platform: string;
  screenResolution: [number, number];
  timezone: string;
  language: string;
  doNotTrack: boolean | null;
  webglVendor?: string;
  webglRenderer?: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  cpuClass?: string;
  plugins: string[];
}

// 代理配置类型定义
export interface ProxyConfig {
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
}

/**
 * 生成随机浏览器指纹
 */
export const generateFingerprint = (): BrowserFingerprint => {
  // 常用操作系统平台
  const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
  
  // 常用分辨率
  const resolutions = [
    [1920, 1080],
    [2560, 1440],
    [1440, 900],
    [1366, 768]
  ];

  // 常用时区
  const timezones = [
    'America/New_York',
    'Europe/London',
    'Asia/Shanghai',
    'Asia/Tokyo'
  ];

  // 常用语言
  const languages = ['en-US', 'en-GB', 'zh-CN', 'ja-JP'];

  // CPU核心数范围
  const cores = [2, 4, 6, 8, 12, 16];

  // 内存大小范围(GB)
  const memories = [4, 8, 16, 32];

  // 随机选择一个数组元素
  const randomChoice = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  return {
    userAgent: generateUserAgent(),
    platform: randomChoice(platforms),
    screenResolution: randomChoice(resolutions) as [number, number],
    timezone: randomChoice(timezones),
    language: randomChoice(languages),
    doNotTrack: Math.random() > 0.5 ? null : Math.random() > 0.5,
    webglVendor: 'Google Inc. (Intel)',
    webglRenderer: 'ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0)',
    hardwareConcurrency: randomChoice(cores),
    deviceMemory: randomChoice(memories),
    plugins: generatePluginList()
  };
};

/**
 * 生成随机User Agent
 */
export const generateUserAgent = (): string => {
  const chromeVersions = ['90.0.4430.212', '91.0.4472.124', '92.0.4515.159'];
  const windowsVersions = ['10.0', '6.1'];
  const version = randomChoice(chromeVersions);
  const windowsVersion = randomChoice(windowsVersions);
  
  return `Mozilla/5.0 (Windows NT ${windowsVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
};

/**
 * 生成插件列表
 */
export const generatePluginList = (): string[] => {
  const commonPlugins = [
    'Chrome PDF Plugin',
    'Chrome PDF Viewer',
    'Native Client',
  ];
  
  return commonPlugins;
};

/**
 * 格式化代理配置字符串
 * @param config 代理配置
 */
export const formatProxyString = (config: ProxyConfig): string => {
  const { type, host, port, username, password } = config;
  if (username && password) {
    return `${type}://${username}:${password}@${host}:${port}`;
  }
  return `${type}://${host}:${port}`;
};

/**
 * 解析代理配置字符串
 * @param proxyString 代理配置字符串
 */
export const parseProxyString = (proxyString: string): ProxyConfig | null => {
  try {
    const regex = /^(http|https|socks4|socks5):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/;
    const match = proxyString.match(regex);
    
    if (!match) return null;
    
    const [, type, username, password, host, port] = match;
    
    return {
      type: type as ProxyConfig['type'],
      host,
      port: parseInt(port, 10),
      ...(username && password ? { username, password } : {})
    };
  } catch {
    return null;
  }
};

/**
 * 获取系统性能指标
 */
export const getPerformanceMetrics = async () => {
  if ('performance' in window) {
    const metrics = {
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      } : null,
      navigation: performance.getEntriesByType('navigation').map(entry => ({
        type: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration,
      })),
      resources: performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        type: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration,
      }))
    };
    
    // 清除性能条目
    performance.clearResourceTimings();
    
    return metrics;
  }
  
  return null;
};

/**
 * 检查WebGL支持情况
 */
export const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

/**
 * 检查WebRTC支持情况
 */
export const checkWebRTCSupport = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};
