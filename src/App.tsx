import createRouter from "@/router";
import {RouterProvider, type  RouterProviderProps} from "react-router";
import { useAuthStore, useGlobalStore } from "@/stores";
import AuthRoute from "@/components/AuthRoute"
import PageTitle from "@/components/PageTitle";
import AntdProvider from "@/components/AntdProvider";

import {useEffect, useRef} from "react";
import { useMobile } from "@/hooks/useMobile";
import Loading from "@/components/Loading";

const App = () => {
  const menus = useAuthStore(state => state.menus);
  const initialized = useAuthStore(state => state.initialized);
  const initApp = useAuthStore(state => state.initApp);
  const initWebInfo = useGlobalStore(state => state.initWebInfo);
  const setIsMobile = useGlobalStore(state => state.setIsMobile);
  
  // 移动端检测
  const mobileDetected = useMobile();
  
  // 使用 useRef 缓存路由
  const routerRef = useRef<RouterProviderProps['router'] | null>(null);
  
  // 初始化
  useEffect(() => {
    Promise.all([
      initApp(),
      initWebInfo()
    ]).then();
  }, [initApp, initWebInfo]);
  
  // 移动端状态同步
  useEffect(() => { setIsMobile(mobileDetected) }, [mobileDetected, setIsMobile]);
  
  // 初始化完成后创建路由器
  if (initialized && !routerRef.current) {
    routerRef.current = createRouter(menus);
  }
  
  // 未初始化完成时显示 Loading
  if (!initialized || !routerRef.current) {
    return (
      <AntdProvider>
        <Loading />
      </AntdProvider>
    );
  }

  return (
    <AntdProvider>
      <PageTitle>
        <AuthRoute>
          <RouterProvider router={routerRef.current} />
        </AuthRoute>
      </PageTitle>
    </AntdProvider>
  );
};

export default App;
