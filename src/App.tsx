import createRouter from "@/router";
import {RouterProvider} from "react-router";
import useAuthStore from "@/stores/user";
import AuthRoute from "@/components/AuthRoute"
import PageTitle from "@/components/PageTitle";
import AntdProvider from "@/components/AntdProvider";
import { useGlobalStore } from "@/stores";
import {useEffect, useMemo} from "react";
import { getWebInfo } from "@/api";
import { useMobile } from "@/hooks/useMobile";

const webInfo = {
  title: "Xin Admin", 
  subtitle: "基于 Ant Design 的后台管理框架", 
  describe: "Xin Admin 是一个基于 Ant Design 的后台管理框架", 
  logo: "https://file.xinadmin.cn/file/favicons.ico"
};

const App = () => {
  const { menus } = useAuthStore();
  const setWebInfo = useGlobalStore(state => state.setWebInfo);
  const getInfo = useAuthStore(state => state.getInfo);
  const setIsMobile = useGlobalStore(state => state.setIsMobile);
  // 移动端检测
  const mobileDetected = useMobile();
  // 路由
  const router = useMemo(() => createRouter(menus), [menus]);
  // 移动端状态
  useEffect(() => { setIsMobile(mobileDetected) }, [mobileDetected, setIsMobile]);
  // 初始化用户信息
  useEffect(() => {
    if(localStorage.getItem("token")) getInfo();
  }, []);
  // 初始化网站信息
  useEffect(() => {
    getWebInfo().then(({data}) => {
      setWebInfo({...webInfo, ...data.data});
    }).catch(() => {
      setWebInfo(webInfo);
    });
  }, [])

  return (
    <AntdProvider>
      <PageTitle>
        <AuthRoute>
          <RouterProvider router={router} />
        </AuthRoute>
      </PageTitle>
    </AntdProvider>
  )
}

export default App
