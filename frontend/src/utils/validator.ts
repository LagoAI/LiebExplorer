/**
 * 验证工具函数
 */

/**
 * 验证URL是否合法
 * @param url URL字符串
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证IP地址是否合法
 * @param ip IP地址字符串
 */
export const isValidIp = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return false;
  }
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return true;
};

/**
 * 验证端口号是否合法
 * @param port 端口号
 */
export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * 验证文件名是否合法
 * @param filename 文件名
 */
export const isValidFilename = (filename: string): boolean => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  return !invalidChars.test(filename);
};

/**
 * 验证是否为正整数
 * @param num 数字
 */
export const isPositiveInteger = (num: number): boolean => {
  return Number.isInteger(num) && num > 0;
};

/**
 * 验证内存大小是否合法(单位: MB)
 * @param size 内存大小
 * @param min 最小值(默认128MB)
 * @param max 最大值(默认16384MB/16GB)
 */
export const isValidMemorySize = (
  size: number,
  min: number = 128,
  max: number = 16384
): boolean => {
  return isPositiveInteger(size) && size >= min && size <= max;
};

/**
 * 验证CPU使用率是否合法
 * @param usage CPU使用率(0-100)
 */
export const isValidCpuUsage = (usage: number): boolean => {
  return usage >= 0 && usage <= 100;
};

/**
 * 验证User Agent是否合法
 * @param ua User Agent字符串
 */
export const isValidUserAgent = (ua: string): boolean => {
  return ua.length >= 5 && ua.length <= 500;
};

/**
 * 验证代理配置是否合法
 * @param config 代理配置对象
 */
export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export const isValidProxyConfig = (config: ProxyConfig): boolean => {
  if (!isValidIp(config.host) && !isValidUrl(config.host)) {
    return false;
  }
  
  if (!isValidPort(config.port)) {
    return false;
  }
  
  if (config.username && config.username.length > 100) {
    return false;
  }
  
  if (config.password && config.password.length > 100) {
    return false;
  }
  
  return true;
};

/**
 * 验证JSON字符串是否合法
 * @param str JSON字符串
 */
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证时间戳是否合法
 * @param timestamp 时间戳
 */
export const isValidTimestamp = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  return date.getTime() > 0;
};
