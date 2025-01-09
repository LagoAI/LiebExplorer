/**
 * 存储工具函数
 */

const PREFIX = 'lei_browser_';

/**
 * 本地存储类
 */
class Storage {
  private prefix: string;
  private storage: WindowStorage;

  constructor(type: 'local' | 'session' = 'local') {
    this.prefix = PREFIX;
    this.storage = type === 'local' ? window.localStorage : window.sessionStorage;
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   * @param expire 过期时间(毫秒)，可选
   */
  set(key: string, value: any, expire?: number): void {
    const data = {
      value,
      time: Date.now(),
      expire: expire ? Date.now() + expire : null
    };
    
    try {
      const stringData = JSON.stringify(data);
      this.storage.setItem(this.prefix + key, stringData);
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param defaultValue 默认值
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    const item = this.storage.getItem(this.prefix + key);
    
    if (!item) return defaultValue;

    try {
      const data = JSON.parse(item);
      
      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key);
        return defaultValue;
      }
      
      return data.value;
    } catch {
      return defaultValue;
    }
  }

  /**
   * 删除存储项
   * @param key 键名
   */
  remove(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  /**
   * 清空存储
   * @param force 是否清除所有存储，包括非本应用前缀的
   */
  clear(force: boolean = false): void {
    if (force) {
      this.storage.clear();
    } else {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    }
  }

  /**
   * 获取所有存储项
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    const keys = Object.keys(this.storage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const realKey = key.slice(this.prefix.length);
        result[realKey] = this.get(realKey);
      }
    });
    
    return result;
  }

  /**
   * 获取存储使用量
   */
  getSize(): number {
    let size = 0;
    const keys = Object.keys(this.storage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const item = this.storage.getItem(key) || '';
        size += item.length * 2; // UTF-16 编码每个字符占2字节
      }
    });
    
    return size;
  }
}

/**
 * localStorage实例
 */
export const localStorage = new Storage('local');

/**
 * sessionStorage实例
 */
export const sessionStorage = new Storage('session');

// 示例用法:
/*
// 设置项
localStorage.set('user', { name: 'test', age: 18 });
localStorage.set('token', 'xxx', 7200000); // 2小时后过期

// 获取项
const user = localStorage.get('user');
const token = localStorage.get('token');

// 删除项
localStorage.remove('token');

// 清空所有
localStorage.clear();
*/
