import createRouter from "@/router";
import {RouterProvider, type RouterProviderProps} from "react-router";
import {useGlobalStore} from "@/stores";
import AntdProvider from "@/components/AntdProvider";
import {useEffect, useState} from "react";
import { useMobile } from "@/hooks/useMobile";
import Loading from "@/components/Loading";
import useMenuStore from "@/stores/menu";
import useAuthStore from "@/stores/user";
// import defaultRoute from "@/router/default";

const App = () => {
  const menus = useMenuStore(state => state.menus);
  const fetchUser = useAuthStore(state => state.info);
  const fetchMenu = useMenuStore(state => state.menu);
  const initWebInfo = useGlobalStore(state => state.initWebInfo);
  const setIsMobile = useGlobalStore(state => state.setIsMobile);
  
  // 移动端检测
  const mobileDetected = useMobile();
  // 路由
  const [routes, setRoutes] = useState<RouterProviderProps['router']>();

  useEffect(() => { initWebInfo() }, []);

  useEffect(() => {
    if(localStorage.getItem('token')) {
      // 初始化用户信息
      Promise.all([ fetchUser(), fetchMenu()]).then(() => {
        // 开发环境可使用本地路由
        // setRoutes(createRouter(defaultRoute));
        setRoutes(createRouter(menus));
      });
    } else {
      setRoutes(createRouter([]));
      if (window.location.pathname !== '/login') {
        // 未登录跳转到登录页
        setTimeout(() => window.location.href =  '/login', 1000)
      }
    }
  }, [fetchUser, fetchMenu]);
  
  // 移动端状态同步
  useEffect(() => { setIsMobile(mobileDetected) }, [mobileDetected, setIsMobile]);

  return (
    <AntdProvider>
      { routes ? (
          <RouterProvider router={routes} />
      ) : (
          <Loading />
      )}
    </AntdProvider>
  );
};

export default App;
