/**
 * Auth Store 兼容层
 * 
 * 保持与旧版代码的兼容性
 * 新代码应该从 '@/stores' 或 '@/stores/auth' 导入
 * 
 * @deprecated 建议使用 `import { useAuthStore } from '@/stores'`
 */

export { useAuthStore as default } from './auth';
export { useAuthStore } from './auth';
export type { AuthStore } from './types';
