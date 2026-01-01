import type {IMenus} from "@/domain/iSysRule.ts";
import IconFont from "@/components/IconFont";
import {useTranslation} from "react-i18next";

import {Menu, type MenuProps} from "antd";
import {useCallback, useMemo} from "react";
import { useGlobalStore, useAuthStore } from "@/stores";
import {useNavigate} from "react-router";
import {usePageTitle} from "@/hooks/usePageTitle";
type MenuItem = Required<MenuProps>['items'][number];

// 菜单项转换
const transformMenus = (nodes: IMenus[], t: any): MenuItem[] => {
  return nodes.reduce<MenuItem[]>((acc, node) => {
    if (!['route', 'menu'].includes(node.type!) || !node.hidden) {
      return acc;
    }

    const menuItem: MenuItem = {
      label: node.local ? t(node.local) : node.name,
      icon: node.icon ? <IconFont name={node.icon}/> : undefined,
      key: node.key!,
    };

    // 仅当有子菜单时才递归处理
    if (node.type === 'menu' && node.children?.length) {
      (menuItem as any).children = transformMenus(node.children, t);
    }

    acc.push(menuItem);
    return acc;
  }, []);
};

const MenuRender = () => {
  const {t} = useTranslation();
  const menus = useAuthStore(state => state.menus);
  const menuMap = useAuthStore(state => state.menuMap);
  const breadcrumbMap = useAuthStore(state => state.breadcrumbMap);
  const layout = useGlobalStore(state => state.layout);
  const menuParentKey = useGlobalStore(state => state.menuParentKey);
  const setBreadcrumb = useGlobalStore(state => state.setBreadcrumb);
  const isMobile = useGlobalStore(state => state.isMobile);
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle();

  // 使用 useMemo 缓存菜单数据源
  const menuSource = useMemo(() => {
    if (layout === 'mix' || layout === 'columns') {
      const rule = menus.find(item => item.key === menuParentKey);
      return rule?.children || [];
    }
    return menus;
  }, [menus, layout, menuParentKey]);

  // 使用 useMemo 缓存转换后的菜单项
  const menuItems = useMemo(() => {
    return transformMenus(menuSource, t);
  }, [menuSource, t]);

  const menuClick: MenuProps['onClick'] = useCallback((info: any) => {
    const menu = menuMap[info.key];
    setBreadcrumb(breadcrumbMap[info.key]);
    const headTitle = menu.local ? t(menu.local) : menu.name;
    setPageTitle(headTitle || '');
    if(! menu.path) return;
    if (menu.link) {
      window.open(menu.path, '_blank');
    } else {
      navigate(menu.path);
    }
  }, [menuMap, breadcrumbMap, t, navigate, setPageTitle, setBreadcrumb])

  return (
    <Menu
      mode={ layout === 'top' && !isMobile ? 'horizontal' : 'inline' }
      items={menuItems}
      onClick={menuClick}
    />
  )
}

export default MenuRender;