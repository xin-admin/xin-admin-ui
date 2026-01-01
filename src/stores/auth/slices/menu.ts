/**
 * 菜单 Slice
 * 管理菜单数据和菜单索引映射
 */

import type { StateCreator } from 'zustand';
import type { AuthStore, MenuState, MenuAction, BreadcrumbItem, MenuIndexes } from '@/stores';
import type { IMenus } from "@/domain/iSysRule";

export type MenuSlice = MenuState & MenuAction;

/**
 * 菜单初始状态
 */
export const initialMenuState: MenuState = {
  menus: [],
  menuMap: {},
  breadcrumbMap: {},
  localRoute: true,
};

/**
 * 构建菜单索引映射
 * 用于快速查找菜单项和面包屑
 */
export const buildMenuIndexes = (menus: IMenus[]): MenuIndexes => {
  const menuMap: Record<string, IMenus> = {};
  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {};

  const traverse = (items: IMenus[], parentBreadcrumb: BreadcrumbItem[] = []) => {
    for (const menu of items) {
      if (!menu.key) continue;
      menuMap[menu.key] = menu;
      const currentBreadcrumb: BreadcrumbItem[] = [
        ...parentBreadcrumb,
        { href: menu.path, title: menu.name, icon: menu.icon, local: menu.local }
      ];
      breadcrumbMap[menu.key] = currentBreadcrumb;
      if (menu.children?.length) {
        traverse(menu.children, currentBreadcrumb);
      }
    }
  };

  traverse(menus);
  return { menuMap, breadcrumbMap };
};

/**
 * 创建菜单 Slice
 */
export const createMenuSlice: StateCreator<AuthStore, [], [], MenuSlice> = (set) => ({
  ...initialMenuState,
  
  setMenus: (menus: IMenus[]) => {
    const { menuMap, breadcrumbMap } = buildMenuIndexes(menus);
    set({ menus, menuMap, breadcrumbMap });
  },
  
  setLocalRoute: (localRoute: boolean) => {
    set({ localRoute });
  },
});
