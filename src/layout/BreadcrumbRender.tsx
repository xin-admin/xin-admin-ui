import {Breadcrumb, type BreadcrumbProps} from "antd";
import {useEffect, useState} from "react";
import {HomeOutlined} from "@ant-design/icons";
import IconFont from "@/components/IconFont";
import {useTranslation} from "react-i18next";
import useMenuStore from "@/stores/menu";
import {useLocation} from "react-router";

const defaultBreadcrumb: BreadcrumbProps['items'] = [
  {
    title: <HomeOutlined />,
  }
]

const BreadcrumbRender = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const routeMap = useMenuStore(state => state.routeMap);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbProps['items']>(defaultBreadcrumb);
  useEffect(() => {
    const path = location.pathname;
    const route = routeMap[path];
    if(!route) {
      setBreadcrumbItems(defaultBreadcrumb)
    } else {
      setBreadcrumbItems([
        {
          title: <HomeOutlined />,
        },
        ...route.breadcrumb.map(item => ({
          title: (
            <>
              {item.icon && <IconFont name={item.icon} />}
              <span>{item.local ? t(item.local) : item.title}</span>
            </>
          ),
        }))
      ]);
    }

  }, [routeMap, t, location]);

  return (
    <Breadcrumb items={breadcrumbItems}/>
  )
}

export default BreadcrumbRender;