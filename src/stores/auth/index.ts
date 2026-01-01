/**
 * Auth Store
 * 组合所有认证相关 Slices
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore } from '../types';
import { createUserSlice, initialUserState } from './slices/user';
import { createMenuSlice, initialMenuState } from './slices/menu';
import { createAuthenticationSlice, initialAuthenticationState } from '@/stores/auth/slices';

/**
 * Auth Store 初始状态
 * 用于重置或测试
 */
export const initialAuthState = {
  ...initialUserState,
  ...initialMenuState,
  ...initialAuthenticationState,
};

/**
 * 需要持久化的状态字段
 * 敏感数据如 token 直接存储在 localStorage 而非 store
 */
const persistedKeys: (keyof typeof initialAuthState)[] = [
  'localRoute',
  // 注意：user, access, menus 等在刷新时会重新获取，可选择是否持久化
];

/**
 * Auth Store
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createUserSlice(...args),
        ...createMenuSlice(...args),
        ...createAuthenticationSlice(...args),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // 只持久化需要保存的状态
        partialize: (state) => {
          const persisted: Partial<typeof initialAuthState> = {};
          for (const key of persistedKeys) {
            if (key in state) {
              (persisted as Record<string, unknown>)[key] = state[key as keyof AuthStore];
            }
          }
          return persisted;
        },
      }
    ),
    { name: 'XinAdmin-Auth' }
  )
);

/**
 * 导出类型供外部使用
 */
export type { AuthStore } from '../types';
