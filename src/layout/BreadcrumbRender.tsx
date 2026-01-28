import {Breadcrumb, type BreadcrumbProps} from "antd";
import {useEffect, useState} from "react";
import {HomeOutlined} from "@ant-design/icons";
import IconFont from "@/components/IconFont";
import {useTranslation} from "react-i18next";
import useMenuStore from "@/stores/menu";
import {useLocation} from "react-router";

const BreadcrumbRender = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const breadcrumbMap = useMenuStore(state => state.breadcrumbMap);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbProps['items']>([
    {
      title: <HomeOutlined />,
    }
  ]);
  useEffect(() => {
    const path = location.pathname;
    setBreadcrumbItems([
      {
        title: <HomeOutlined />,
      },
      ...breadcrumbMap[path].map(item => ({
        title: (
            <>
              {item.icon && <IconFont name={item.icon} />}
              <span>{item.local ? t(item.local) : item.title}</span>
            </>
        ),
      }))
    ]);
  }, [breadcrumbMap, t, location]);

  return (
    <Breadcrumb items={breadcrumbItems}/>
  )
}

export default BreadcrumbRender;