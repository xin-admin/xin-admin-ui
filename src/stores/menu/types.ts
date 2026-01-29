import type {IMenus} from "@/domain/iSysRule.ts";

export interface BreadcrumbItem {
  href?: string;
  title?: string;
  icon?: string;
  local?: string;
}

export type RouteMapType = Record<string, IMenus & {
  breadcrumb: BreadcrumbItem[]
}>


export interface MenuStoreState {
  menus: IMenus[];
  selectKey: string[];
  routeMap: RouteMapType;
}

export interface MenuStoreActions {
  menu: () => Promise<void>;
  setMenus: (menus: IMenus[]) => void;
  setSelectKey: (selectKey: string[]) => void;
}

export type MenuStore = MenuStoreState & MenuStoreActions;