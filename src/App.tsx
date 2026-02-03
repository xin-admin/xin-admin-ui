import createRouter from "@/router";
import {RouterProvider} from "react-router";
import {useGlobalStore} from "@/stores";
import AntdProvider from "@/components/AntdProvider";
import {useEffect, useCallback} from "react";
import {useMobile} from "@/hooks/useMobile";
import useLanguage from '@/hooks/useLanguage';
import useMenuStore from "@/stores/menu";
import useAuthStore from "@/stores/user";
// import defaultRoute from "@/router/default";

const App = () => {
  const { changeLanguage } = useLanguage();
  const mobileDetected = useMobile();
  const menus = useMenuStore(state => state.menus);
  const fetchUser = useAuthStore(state => state.info);
  const fetchMenu = useMenuStore(state => state.menu);
  const initWebInfo = useGlobalStore(state => state.initWebInfo);
  const setIsMobile = useGlobalStore(state => state.setIsMobile);

  useEffect(() => {
    // 初始化网站信息
    initWebInfo();
    // 初始化多语言信息
    changeLanguage(localStorage.getItem('i18nextLng') || 'zh');
  }, []);

  // 更新移动端状态
  useEffect(() => {
    setIsMobile(mobileDetected);
  }, [mobileDetected, setIsMobile]);

  // 初始化用户数据
  const initUserData = useCallback(async () => {
    const isLoggedIn = !!localStorage.getItem('token')
    if (isLoggedIn) {
      await Promise.all([fetchUser(), fetchMenu()])
    } else {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, [fetchUser, fetchMenu]);

  // 执行初始化
  useEffect(() => {
    initUserData();
  }, [initUserData]);

  return (
    <AntdProvider>
      <RouterProvider router={createRouter(menus)} />
    </AntdProvider>
  );
};

export default App;
