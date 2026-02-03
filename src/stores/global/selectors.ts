/**
 * Global Store Selectors
 * 提供可复用的状态选择器，避免不必要的重渲染
 */

import type { GlobalStore } from '../types';

// ============== Site Selectors ==============

export const siteSelectors = {
  /** 获取网站 Logo */
  logo: (state: GlobalStore) => state.logo,
  /** 获取网站标题 */
  title: (state: GlobalStore) => state.title,
  /** 获取网站描述 */
  describe: (state: GlobalStore) => state.describe,
};

// ============== Layout Selectors ==============

export const layoutSelectors = {
  /** 获取布局类型 */
  layout: (state: GlobalStore) => state.layout,
};

// ============== Theme Selectors ==============

export const themeSelectors = {
  /** 获取主题配置 */
  themeConfig: (state: GlobalStore) => state.themeConfig,
  /** 获取主色调 */
  colorPrimary: (state: GlobalStore) => state.themeConfig.colorPrimary,
};

// ============== 组合 Selectors ==============

export const globalSelectors = {
  ...siteSelectors,
  ...layoutSelectors,
  ...themeSelectors,
};
