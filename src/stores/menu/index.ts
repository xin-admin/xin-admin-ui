import {create, type StateCreator} from 'zustand';
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {menu} from "@/api/sys/sysUser.ts";
import type {IMenus} from "@/domain/iSysRule.ts";
import type {MenuStore, MenuStoreState, MenuStoreActions, RouteMapType, BreadcrumbItem} from "./types";

const initialState: MenuStoreState = {
  menus: [],
  selectKey: [],
  routeMap: {},
};

/**
 * 将菜单树转换为路径映射表
 * @param menus 菜单数组
 * @param parentBreadcrumbs 父级面包屑
 * @returns 路径映射表
 */
export function buildRouteMap(menus: IMenus[], parentBreadcrumbs: BreadcrumbItem[] = []): RouteMapType {
  const routeMap: RouteMapType = {};

  const processMenu = (
    menu: IMenus,
    breadcrumbs: BreadcrumbItem[],
    topMenuKey?: string
  ) => {
    const isTopLevel = menu.pid === 0 || menu.pid === undefined;
    const currentTopMenuKey = isTopLevel && menu.key
      ? menu.key
      : topMenuKey;
    const currentBreadcrumb: BreadcrumbItem = {
      href: menu.path,
      title: menu.name,
      icon: menu.icon,
      local: menu.local,
    };
    const newBreadcrumbs = [...breadcrumbs, currentBreadcrumb];

    if (menu.path) {
      routeMap[menu.path] = {
        ...menu,
        topMenuKey: currentTopMenuKey || '',
        breadcrumb: newBreadcrumbs,
      };
    }

    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => {
        processMenu(child, newBreadcrumbs, currentTopMenuKey);
      });
    }
  };

  menus.forEach(menu => {
    processMenu(menu, parentBreadcrumbs);
  });

  return routeMap;
}


const createAuthSlice: StateCreator<MenuStore> = (set) => ({
  ...initialState,
  menu: async () => {
    const { data } = await menu();
    const routeMap = buildRouteMap(data.data!.menus);
    set({
      menus: data.data!.menus,
      routeMap,
    });
  },
  setMenus: (menus) => set({menus}),
  setSelectKey: (selectKey) => set({selectKey}),
})

const useMenuStore = create<MenuStore>()(
  devtools(
    persist(
      createAuthSlice,
      {
        name: 'menu-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: 'XinAdmin-Menu' }
  )
);

export type { MenuStore, MenuStoreState, MenuStoreActions, BreadcrumbItem, RouteMapType};
export default useMenuStore;