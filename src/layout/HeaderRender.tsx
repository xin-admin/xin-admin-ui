import React, {useCallback, useEffect, useState} from "react";
import {Button, ConfigProvider, Layout, Menu, type MenuProps, type ThemeConfig} from "antd";
import { useGlobalStore } from "@/stores";
import useMenuStore from "@/stores/menu";
import HeaderRightRender from "@/layout/HeaderRightRender";
import IconFont from "@/components/IconFont";
import {useTranslation} from "react-i18next";
import MenuRender from "@/layout/MenuRender.tsx";
import {useNavigate} from "react-router";
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import BreadcrumbRender from "@/layout/BreadcrumbRender.tsx";

const {Header} = Layout;

const HeaderRender: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const logo = useGlobalStore(state => state.logo);
  const title = useGlobalStore(state => state.title);
  const menus = useMenuStore(state => state.menus);
  const layout = useGlobalStore(state => state.layout);
  const themeConfig = useGlobalStore(state => state.themeConfig);
  const setSelectKey = useMenuStore(state => state.setSelectKey);
  const selectKey = useMenuStore(state => state.selectKey);
  const routeMap = useMenuStore(state => state.routeMap);
  const isMobile = useGlobalStore(state => state.isMobile);
  const collapsed = useGlobalStore(state => state.collapsed);
  const setCollapsed = useGlobalStore(state => state.setCollapsed);
  const theme: ThemeConfig = {
    cssVar: true,
    token: { colorTextBase: themeConfig.headerColor },
    components: {
      Menu: {
        activeBarBorderWidth: 0,
        itemBg: 'transparent',
      }
    }
  }
  const [mixMenu, setMixMenu] = useState<MenuProps['items']>([]);

  useEffect(() => {
    setMixMenu(menus.filter(item => item.hidden).map(item => ({
      label: item.local ? t(item.local) : item.name,
      icon: item.icon ? <IconFont name={item.icon}/> : false,
      key: item.path || item.key!,
    })));
  }, [menus, t]);

  const onSelect: MenuProps['onSelect'] = useCallback((info: any) => {
    setSelectKey([info.key!])
    if(routeMap[info.key]) {
      if (info.key.includes('http://') || info.key.includes('https://')) {
        window.open(info.key, '_blank');
      } else {
        navigate(info.key);
      }
    }
  }, [t, navigate]);

  return (
    <ConfigProvider theme={theme}>
      {/* 移动端菜单按钮 */}
      {isMobile ? (
        <Header className={"flex sticky z-1 top-0 backdrop-blur-xs justify-between items-center"}>
          <div className={"flex items-center"}>
            <img className={"w-9 mr-5"} src={logo} alt="logo"/>
            <span className={"font-semibold text-[20px] mr-2"}>{title}</span>
          </div>
          <HeaderRightRender/>
        </Header>
      ) : (
        <Header className={"flex sticky z-1 top-0 backdrop-blur-xs"}>
          { layout !== 'columns' && (
            <div className={"flex items-center"}>
              <img className={"w-9 mr-5"} src={logo} alt="logo"/>
              <span className={"font-semibold text-[20px] mr-2"}>{title}</span>
              {/* 侧边栏开关 */}
              {['mix', 'side'].includes(layout) && (
                <Button
                  type={'text'}
                  className={'text-[16px] mr-2'}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  { collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/> }
                </Button>
              )}
              {/* 面包屑 */}
              { ['columns', 'side'].includes(layout) && <BreadcrumbRender/> }
            </div>
          )}
          <div className={"overflow-auto flex-1"}>
            {/* 顶部菜单 */}
            { layout == 'top' && <MenuRender /> }
            {/* 混合布局模式下的顶部菜单 */}
            { layout == 'mix' && (
              <Menu
                className={"border-b-0 w-full"}
                mode="horizontal"
                items={mixMenu}
                onSelect={onSelect}
                selectedKeys={selectKey}
                onClick={({keyPath}) => setSelectKey(keyPath)}
              />
            )}
          </div>
          <HeaderRightRender/>
        </Header>
      )}
    </ConfigProvider>
  )
}

export default HeaderRender;