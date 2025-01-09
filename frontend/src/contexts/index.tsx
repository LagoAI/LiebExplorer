import React from 'react';
import { AuthProvider } from './AuthContext';
import { BrowserProvider } from './BrowserContext';
import { SettingsProvider } from './SettingsContext';

// 组合所有Provider
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserProvider>
          {children}
        </BrowserProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

// 导出所有Context相关hook和类型
export * from './AuthContext';
export * from './BrowserContext';
export * from './SettingsContext';
