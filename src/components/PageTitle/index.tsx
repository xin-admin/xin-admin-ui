import { useEffect } from "react";
import useGlobalStore from "@/stores/global";
import {useLocation} from "react-router";
import {useTranslation} from "react-i18next";
import useMenuStore from "@/stores/menu";

/**
 * 页面标题组件
 */
const PageTitle = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const routeMap = useMenuStore(data => data.routeMap);
  const defaultSiteName = useGlobalStore(state => state.title);

  useEffect(() => {
    const title = defaultSiteName || "Xin Admin";
    const route = routeMap[location.pathname];
    if(!route) {
      document.title = title;
      return;
    }
    const pageTitle = route.local ? t(route.local) : route.name;
    if(pageTitle) {
      document.title = pageTitle+  ' - ' + title;
    } else {
      document.title = title;
    }
  }, [location, defaultSiteName, t, routeMap]);

  return null;
}

export default PageTitle;