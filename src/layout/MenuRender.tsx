import type {IMenus} from "@/domain/iSysRule.ts";
import IconFont from "@/components/IconFont";
import {useTranslation} from "react-i18next";

import {Menu, type MenuProps} from "antd";
import {useCallback, useMemo} from "react";
import { useGlobalStore } from "@/stores";
import useMenuStore from "@/stores/menu";
import {useNavigate} from "react-router";
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
      key: node.path || node.key!,
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
  const menus = useMenuStore(state => state.menus);
  const layout = useGlobalStore(state => state.layout);
  const selectKey = useMenuStore(state => state.selectKey);
  const setSelectKey = useMenuStore(state => state.setSelectKey);
  const isMobile = useGlobalStore(state => state.isMobile);
  const navigate = useNavigate();

  // 使用 useMemo 缓存菜单数据源
  const menuSource = useMemo(() => {
    if (layout === 'mix' || layout === 'columns') {
      const rule = menus.find(item => item.key === selectKey[selectKey.length - 1]);
      return rule?.children || [];
    }
    return menus;
  }, [menus, layout, selectKey]);

  // 使用 useMemo 缓存转换后的菜单项
  const menuItems = useMemo(() => {
    return transformMenus(menuSource, t);
  }, [menuSource, t]);

  const onSelect: MenuProps['onSelect'] = useCallback((info: any) => {
    if (info.key.includes('http://') || info.key.includes('https://')) {
      window.open(info.key, '_blank');
    } else {
      navigate(info.key);
    }
  }, [t, navigate]);

  return (
    <Menu
      mode={ layout === 'top' && !isMobile ? 'horizontal' : 'inline' }
      items={menuItems}
      style={{ borderBottom: 'none' }}
      defaultOpenKeys={selectKey}
      defaultSelectedKeys={selectKey}
      onClick={({keyPath}) => {
        if (layout === 'mix' || layout === 'columns') {
          setSelectKey([...keyPath, selectKey[selectKey.length - 1]])
        } else {
          setSelectKey(keyPath)
        }
      }}
      onSelect={onSelect}
    />
  )
}

export default MenuRender;