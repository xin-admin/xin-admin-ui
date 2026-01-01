import { type ReactNode, useEffect } from 'react';
import { useAuthStore } from "@/stores";

interface AuthRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthRoute({ children, redirectTo = '/login' }: AuthRouteProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    // 检查登录状态
    if (!isAuthenticated() && window.location.pathname !== redirectTo) {
      // 跳转到登录页
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, redirectTo]);

  // 未登录时不渲染子组件
  if (!isAuthenticated() && window.location.pathname !== redirectTo) {
    return null;
  }

  return <>{children}</>;
}
