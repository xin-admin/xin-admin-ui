import type { ReactNode } from 'react';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

/**
 * 表格密度类型
 */
export type TableDensity = SizeType;

/**
 * 列设置项
 */
export interface ColumnSettingItem {
  /** 列标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 是否显示 */
  visible: boolean;
  /** 是否固定 */
  fixed?: 'left' | 'right' | false;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 工具栏功能配置
 */
export interface ToolBarOptions {
  /** 刷新按钮 */
  reload?: boolean;
  /** 密度设置 */
  density?: boolean;
  /** 列设置 */
  columnSetting?: boolean;
  /** 边框开关 */
  bordered?: boolean;
  /** 全屏按钮 */
  fullScreen?: boolean;
}

/**
 * 工具栏属性（简化版 - 使用 Context 后只需要自定义渲染属性）
 */
export interface ToolBarProps {
  /** 自定义渲染 - 左侧 */
  renderLeft?: ReactNode;
  /** 自定义渲染 - 右侧（在功能按钮之前） */
  renderRight?: ReactNode;
  /** 自定义渲染 - 额外操作按钮 */
  extraRender?: ReactNode[];
}

/**
 * 工具栏默认配置
 */
export const DEFAULT_TOOLBAR_OPTIONS: ToolBarOptions = {
  reload: true,
  density: true,
  columnSetting: true,
  bordered: true,
  fullScreen: false,
};
