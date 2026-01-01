/**
 * Auth Store Selectors
 * 提供可复用的状态选择器，避免不必要的重渲染
 */

import type { AuthStore } from '../types';

// ============== User Selectors ==============

export const userSelectors = {
  /** 获取用户信息 */
  user: (state: AuthStore) => state.user,
  /** 获取用户ID */
  userId: (state: AuthStore) => state.user?.id,
  /** 获取用户名 */
  username: (state: AuthStore) => state.user?.username,
  /** 获取用户昵称 */
  nickname: (state: AuthStore) => state.user?.nickname,
  /** 获取用户头像 */
  avatarUrl: (state: AuthStore) => state.user?.avatar_url,
  /** 获取权限列表 */
  access: (state: AuthStore) => state.access,
  /** 检查是否有指定权限 */
  hasAccess: (accessKey: string) => (state: AuthStore) => state.access.includes(accessKey),
};

// ============== Menu Selectors ==============

export const menuSelectors = {
  /** 获取菜单列表 */
  menus: (state: AuthStore) => state.menus,
  /** 获取菜单映射 */
  menuMap: (state: AuthStore) => state.menuMap,
  /** 获取面包屑映射 */
  breadcrumbMap: (state: AuthStore) => state.breadcrumbMap,
  /** 获取是否使用本地路由 */
  localRoute: (state: AuthStore) => state.localRoute,
  /** 根据 key 获取菜单项 */
  getMenuByKey: (key: string) => (state: AuthStore) => state.menuMap[key],
  /** 根据 key 获取面包屑 */
  getBreadcrumbByKey: (key: string) => (state: AuthStore) => state.breadcrumbMap[key],
};

// ============== Authentication Selectors ==============

export const authenticationSelectors = {
  /** 获取初始化状态 */
  initialized: (state: AuthStore) => state.initialized,
  /** 获取登录方法 */
  login: (state: AuthStore) => state.login,
  /** 获取登出方法 */
  logout: (state: AuthStore) => state.logout,
  /** 获取用户信息方法 */
  getInfo: (state: AuthStore) => state.getInfo,
  /** 获取应用初始化方法 */
  initApp: (state: AuthStore) => state.initApp,
  /** 获取认证检查方法 */
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
};

// ============== 组合 Selectors ==============

export const authSelectors = {
  ...userSelectors,
  ...menuSelectors,
  ...authenticationSelectors,
};
