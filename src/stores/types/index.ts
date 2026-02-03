/**
 * Store 共享类型定义
 */
import type { LayoutType, ThemeProps } from "@/layout/typing";

// ============== Global Store 类型 ==============

/**
 * 网站基础信息状态
 */
export interface SiteState {
  logo: string;
  title: string;
  subtitle: string;
  describe: string;
}

/**
 * 网站基础信息操作
 */
export interface SiteAction {
  initWebInfo: () => Promise<void>;
}

/**
 * 布局状态
 */
export interface LayoutState {
  layout: LayoutType;
  collapsed: boolean;
}

/**
 * 布局操作
 */
export interface LayoutAction {
  setLayout: (layout: LayoutType) => void;
  setCollapsed: (collapsed: boolean) => void;
}

/**
 * 主题状态
 */
export interface ThemeState {
  themeConfig: ThemeProps;
  themeDrawer: boolean;
}

/**
 * 主题操作
 */
export interface ThemeAction {
  setThemeConfig: (themeConfig: ThemeProps) => void;
  setThemeDrawer: (themeDrawer: boolean) => void;
}

/**
 * Global Store 完整类型
 */
export type GlobalState = SiteState & LayoutState & ThemeState;
export type GlobalAction = SiteAction & LayoutAction & ThemeAction;
export type GlobalStore = GlobalState & GlobalAction;


// ============== Store 辅助类型 ==============

/**
 * Zustand StateCreator 辅助类型
 */
export type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void;

export type GetState<T> = () => T;
