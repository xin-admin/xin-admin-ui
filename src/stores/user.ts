import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type ISysUser from "@/domain/iSysUser.ts";
import {info, login, logout} from "@/api/sys/sysUser";
import type {LoginParams, InfoResponse} from "@/api/sys/sysUser";
import type {IMenus} from "@/domain/iSysRule.ts";
import defaultRoute from "@/router/default.ts";

type BreadcrumbType = {
  href?: string;
  title?: string;
  icon?: string;
  local?: string;
};

type MenuIndexes = {
  menuMap: { [key: string]: IMenus };
  breadcrumbMap: { [key: string]: BreadcrumbType[] };
};

/**
 * 构建菜单索引映射
 */
const buildMenuIndexes = (menus: IMenus[]): MenuIndexes => {
  const menuMap: { [key: string]: IMenus } = {};
  const breadcrumbMap: { [key: string]: BreadcrumbType[] } = {};

  const traverse = (items: IMenus[], parentBreadcrumb: BreadcrumbType[] = []) => {
    for (const menu of items) {
      if (!menu.key) continue;
      menuMap[menu.key] = menu;
      const currentBreadcrumb: BreadcrumbType[] = [
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

interface AuthState {
  user: ISysUser | null;
  access: string[];
  menus: IMenus[];
  menuMap: {[key: string]: IMenus };
  localRoute: boolean;
  breadcrumbMap: {[key: string]: BreadcrumbType[] };
  initialized: boolean;
  login: (credentials: LoginParams) => Promise<boolean>;
  getInfo: () => Promise<void>;
  initApp: () => Promise<void>;
  logout: () => Promise<void>;
  setMenus: (rules: IMenus[]) => void;
  setAccess: (access: string[]) => void;
  setLocalRoute: (isLocal: boolean) => void;
  isAuthenticated: () => boolean;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, getState) => ({
      user: null,
      access: [],
      menus: [],
      menuMap: {},
      breadcrumbMap: {},
      localRoute: true,
      initialized: false,
      login: async (params) => {
        try {
          const {data} = await login(params);
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
          const menus = getState().localRoute ? defaultRoute : data.menus;
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
          set({ user: null, access: [], menus: [], menuMap: {}, breadcrumbMap: {} });
        }
      },
      // 统一的应用初始化方法，用于首次加载
      initApp: async () => {
        const state = getState();
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
      setMenus: (menus: IMenus[]) => {
        set({ menus });
      },
      setAccess: (access: string[]) => {
        set({ access });
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
          });
        }
      },
      setLocalRoute: (isLocal: boolean) => {
        set({ localRoute: isLocal });
      },
      // 派生方法：检查是否已登录
      isAuthenticated: () => {
        return !!localStorage.getItem('token');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useAuthStore
