/**
 * 认证 Slice
 * 管理登录、登出、初始化等认证相关操作
 */

import type { StateCreator } from 'zustand';
import type { AuthStore, AuthenticationState, AuthenticationAction } from '@/stores';
import type { LoginParams, InfoResponse } from "@/api/sys/sysUser";
import { info, login, logout } from "@/api/sys/sysUser";
import defaultRoute from "@/router/default";
import { buildMenuIndexes } from './menu';

export type AuthenticationSlice = AuthenticationState & AuthenticationAction;

/**
 * 认证初始状态
 */
export const initialAuthenticationState: AuthenticationState = {
  initialized: false,
};

/**
 * 创建认证 Slice
 */
export const createAuthenticationSlice: StateCreator<AuthStore, [], [], AuthenticationSlice> = (set, get) => ({
  ...initialAuthenticationState,
  
  login: async (params: LoginParams) => {
    try {
      const { data } = await login(params);
      if (!data.success || !data.data) {
        return false;
      }
      // 只存储到 localStorage，作为单一真实来源
      localStorage.setItem("token", data.data.plainTextToken);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  },
  
  getInfo: async () => {
    try {
      const result = await info();
      const data: InfoResponse = result.data.data!;
      const menus = get().localRoute ? defaultRoute : data.menus;
      const { menuMap, breadcrumbMap } = buildMenuIndexes(menus);
      set({
        menus,
        menuMap,
        breadcrumbMap,
        user: data.info,
        access: data.access,
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      set({ 
        user: null, 
        access: [], 
        menus: [], 
        menuMap: {}, 
        breadcrumbMap: {} 
      });
    }
  },
  
  initApp: async () => {
    const state = get();
    if (state.initialized) return;
    
    const hasToken = !!localStorage.getItem('token');
    
    if (hasToken) {
      await state.getInfo();
    } else {
      const { menuMap, breadcrumbMap } = buildMenuIndexes(defaultRoute);
      set({
        menus: defaultRoute,
        menuMap,
        breadcrumbMap,
      });
    }
    
    set({ initialized: true });
  },
  
  logout: async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      // 无论成功失败都清理本地状态
      localStorage.removeItem('token');
      set({
        user: null,
        access: [],
        menus: [],
        menuMap: {},
        breadcrumbMap: {},
        initialized: false,
      });
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
});
