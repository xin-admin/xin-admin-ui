/**
 * Stores 统一导出入口
 */

// ============== Stores ==============
export { useGlobalStore } from './global';

// ============== Selectors ==============
export * from './selectors';

// ============== Types ==============
export type {
  // Global Store 类型
  GlobalStore,
  GlobalState,
  GlobalAction,
  SiteState,
  SiteAction,
  LayoutState,
  LayoutAction,
  ThemeState,
  ThemeAction,
} from './types';
