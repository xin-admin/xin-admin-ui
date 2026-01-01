/**
 * Stores 统一导出入口
 * 
 * 参考 Lobe Chat 的 Store 组织模式
 * 
 * 目录结构:
 * stores/
 * ├── index.ts           # 统一导出入口
 * ├── selectors.ts       # Selectors 统一导出
 * ├── types/             # 类型定义
 * │   └── index.ts
 * ├── global/            # 全局 Store
 * │   ├── index.ts
 * │   ├── selectors.ts
 * │   └── slices/
 * │       ├── site.ts
 * │       ├── layout.ts
 * │       └── theme.ts
 * └── auth/              # 认证 Store
 *     ├── index.ts
 *     ├── selectors.ts
 *     └── slices/
 *         ├── user.ts
 *         ├── menu.ts
 *         └── authentication.ts
 */

// ============== Stores ==============
export { useGlobalStore } from './global';
export { useAuthStore } from './auth';

// ============== Selectors ==============
export * from './selectors';

// ============== Types ==============
export type {
  // 共享类型
  BreadcrumbItem,
  MenuIndexes,
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
  // Auth Store 类型
  AuthStore,
  AuthState,
  AuthAction,
  UserState,
  UserAction,
  MenuState,
  MenuAction,
  AuthenticationState,
  AuthenticationAction,
} from './types';

// ============== 向后兼容导出 ==============
// 保持与旧版 user.ts 的兼容性
import { useAuthStore as _useAuthStore } from './auth';
export default _useAuthStore;
