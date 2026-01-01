/**
 * 用户 Slice
 * 管理用户信息和权限
 */

import type { StateCreator } from 'zustand';
import type { AuthStore, UserState, UserAction } from '../../types';

export type UserSlice = UserState & UserAction;

/**
 * 用户初始状态
 */
export const initialUserState: UserState = {
  user: null,
  access: [],
};

/**
 * 创建用户 Slice
 */
export const createUserSlice: StateCreator<AuthStore, [], [], UserSlice> = (set) => ({
  ...initialUserState,
  
  setAccess: (access: string[]) => {
    set({ access });
  },
});
