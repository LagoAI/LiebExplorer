/**
 * 工具函数统一导出
 */

// 格式化工具
export * as formatUtils from './format';

// 验证工具
export * as validatorUtils from './validator';

// 存储工具
export * as storageUtils from './storage';

// 浏览器工具
export * as browserUtils from './browser';

// 请求工具
export * as requestUtils from './request';

// 常用工具
export * as commonUtils from './common';

// 重新导出一些常用函数，方便直接使用
export {
  formatDateTime,
  formatFileSize,
  formatNumber,
  formatPercent,
  formatDuration
} from './format';

export {
  isValidUrl,
  isValidIp,
  isValidPort,
  isValidJson
} from './validator';

export {
  localStorage,
  sessionStorage
} from './storage';

export {
  generateFingerprint,
  formatProxyString,
  parseProxyString
} from './browser';

export {
  createRetryableRequest,
  createCacheableRequest,
  createCancelToken
} from './request';
