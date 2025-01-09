/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param format 格式化模式，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认2
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 格式化数字（添加千位分隔符）
 * @param num 数字
 * @param decimals 小数位数，默认2
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * 格式化百分比
 * @param num 数字(0-1)
 * @param decimals 小数位数，默认2
 */
export const formatPercent = (num: number, decimals: number = 2): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * 格式化时间差
 * @param ms 毫秒数
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`;
  return `${seconds}秒`;
};

/**
 * 格式化URL
 * @param url URL字符串
 */
export const formatUrl = (url: string): string => {
  try {
    const urlObject = new URL(url);
    // 移除末尾的斜杠
    return urlObject.href.replace(/\/$/, '');
  } catch {
    // 如果URL不合法，添加https://前缀再试
    if (!/^https?:\/\//i.test(url)) {
      return formatUrl(`https://${url}`);
    }
    return url;
  }
};

/**
 * 格式化内存大小
 * @param bytes 字节数
 */
export const formatMemorySize = (bytes: number): string => {
  return formatFileSize(bytes);
};

/**
 * 格式化CPU使用率
 * @param usage CPU使用率(0-100)
 */
export const formatCpuUsage = (usage: number): string => {
  return `${usage.toFixed(1)}%`;
};
