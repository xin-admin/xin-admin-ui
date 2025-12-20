import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {AppListProps} from "@ant-design/pro-components";
import type {LayoutType, ThemeProps} from "@/layout/typing";
import {configTheme, defaultColorTheme} from "@/layout/theme";
import {getWebInfo} from "@/api";

type BreadcrumbType = {
  href?: string;
  title?: string;
  icon?: string;
  local?: string;
};

interface GlobalState {
  logo: string;
  title: string;
  subtitle: string;
  describe: string;
  documentTitle: string;
  layout: LayoutType;
  themeConfig: ThemeProps;
  collapsed: boolean;
  themeDrawer: boolean;
  appList: AppListProps;
  breadcrumb: BreadcrumbType[];
  menuParentKey: string | null;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  initWebInfo: () => Promise<void>;
  setDocumentTitle: (documentTitle: string) => void;
  setCollapsed: (collapsed: boolean) => void;
  setThemeConfig: (themeConfig: ThemeProps) => void;
  setThemeDrawer: (themeDrawer: boolean) => void;
  setLayout: (layout: LayoutType) => void;
  setBreadcrumb: (breadcrumb: BreadcrumbType[]) => void;
  setMenuParentKey: (menuParentKey: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  setMobileMenuOpen: (mobileMenuOpen: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (setState) => ({
      logo: "https://file.xinadmin.cn/file/favicons.ico",
      title: "Xin Admin",
      subtitle: "基于 Ant Design 的后台管理框架",
      describe: "Xin Admin 是一个基于 Ant Design 的后台管理框架",
      documentTitle: "Xin Admin",
      layout: "side",
      themeConfig: {...defaultColorTheme, ...configTheme},
      collapsed: false,
      themeDrawer: false,
      appList: [],
      breadcrumb: [],
      menuParentKey: null,
      isMobile: false,
      mobileMenuOpen: false,
      initWebInfo: async () => {
        const response = await getWebInfo();
        setState(response.data.data!);
      },
      setDocumentTitle: (documentTitle: string) => {
        setState({documentTitle})
      },
      setCollapsed: (collapsed: boolean) => {
        setState({collapsed})
      },
      setThemeConfig: (themeConfig: ThemeProps) => {
        setState({themeConfig})
      },
      setThemeDrawer: (themeDrawer: boolean) => {
        setState({themeDrawer})
      },
      setLayout: (layout: LayoutType) => {
        setState({layout})
      },
      setBreadcrumb: (breadcrumb: BreadcrumbType[]) => {
        setState({breadcrumb})
      },
      setMenuParentKey: (menuParentKey: string) => {
        setState({menuParentKey})
      },
      setIsMobile: (isMobile: boolean) => {
        setState({isMobile})
      },
      setMobileMenuOpen: (mobileMenuOpen: boolean) => {
        setState({mobileMenuOpen})
      }
    }),
    {
      name: 'global-store-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
