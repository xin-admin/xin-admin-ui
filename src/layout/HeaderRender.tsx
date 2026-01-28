import React, {useCallback, useEffect, useState} from "react";
import {Button, ConfigProvider, Layout, Menu, type MenuProps, type ThemeConfig} from "antd";
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import { useGlobalStore } from "@/stores";
import useMenuStore from "@/stores/menu";
import HeaderLeftRender from "@/layout/HeaderLeftRender";
import HeaderRightRender from "@/layout/HeaderRightRender";
import IconFont from "@/components/IconFont";
import BreadcrumbRender from "@/layout/BreadcrumbRender.tsx";
import {useTranslation} from "react-i18next";
import MenuRender from "@/layout/MenuRender.tsx";
import {useNavigate} from "react-router";

const {Header} = Layout;

const HeaderRender: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const menus = useMenuStore(state => state.menus);
  const layout = useGlobalStore(state => state.layout);
  const themeConfig = useGlobalStore(state => state.themeConfig);
  const collapsed = useGlobalStore(state => state.collapsed);
  const setCollapsed = useGlobalStore(state => state.setCollapsed);
  const setSelectKey = useMenuStore(state => state.setSelectKey);
  const selectKey = useMenuStore(state => state.selectKey);
  const routeMap = useMenuStore(state => state.routeMap);
  const isMobile = useGlobalStore(state => state.isMobile);
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
        <Header
          className={"flex sticky z-1 top-0 backdrop-blur-xs justify-between items-center"}
          style={{
            borderBottom: themeConfig.layoutBorder ? '1px solid ' + themeConfig.colorBorder : 'none',
          }}
        >
          <HeaderLeftRender/>
          <HeaderRightRender/>
        </Header>
      ) : (
        <Header
          className={"flex sticky z-1 top-0 backdrop-blur-xs"}
          style={{
            borderBottom: themeConfig.layoutBorder ? '1px solid ' + themeConfig.colorBorder : 'none',
          }}
        >
          { layout !== 'columns' && <HeaderLeftRender/> }
          <div className="flex-1 flex items-center">
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
            {/* 顶部菜单 */}
            { layout == 'top' && <MenuRender /> }
            {/* 混合布局模式下的顶部菜单 */}
            { layout == 'mix' && (
              <Menu
                style={{ borderBottom: 'none' }}
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