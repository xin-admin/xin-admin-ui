import { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from 'react';
import type { ColumnSettingItem, TableDensity, ToolBarOptions } from './ToolBar/typings';
import { DEFAULT_TOOLBAR_OPTIONS } from './ToolBar/typings';
import type { XinTableColumn } from './typings';

/**
 * 表格 Context 状态
 */
export interface TableContextState {
  /** 表格密度 */
  density: TableDensity;
  /** 是否显示边框 */
  bordered: boolean;
  /** 列设置 */
  columnSettings: ColumnSettingItem[];
  /** 是否全屏 */
  isFullScreen: boolean;
  /** 加载状态 */
  loading: boolean;
  /** 工具栏配置 */
  toolBarOptions: ToolBarOptions;
}

/**
 * 表格 Context 操作
 */
export interface TableContextActions {
  /** 设置表格密度 */
  setDensity: (density: TableDensity) => void;
  /** 设置边框 */
  setBordered: (bordered: boolean) => void;
  /** 切换边框 */
  toggleBordered: () => void;
  /** 设置列配置 */
  setColumnSettings: (settings: ColumnSettingItem[]) => void;
  /** 重置列配置 */
  resetColumnSettings: () => void;
  /** 切换列显示 */
  toggleColumnVisible: (key: string) => void;
  /** 设置全部列显示/隐藏 */
  setAllColumnsVisible: (visible: boolean) => void;
  /** 切换全屏 */
  toggleFullScreen: () => void;
  /** 刷新表格 */
  reload: () => void | Promise<void>;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
}

/**
 * 表格 Context 值
 */
export interface TableContextValue extends TableContextState, TableContextActions {}

/**
 * 表格 Context
 */
const TableContext = createContext<TableContextValue | null>(null);

/**
 * 表格 Provider 属性
 */
export interface TableProviderProps {
  children: ReactNode;
  /** 初始列配置 */
  columns?: XinTableColumn[];
  /** 工具栏配置 */
  toolBarOptions?: ToolBarOptions | false;
  /** 刷新回调 */
  onReload?: () => void | Promise<void>;
  /** 初始密度 */
  defaultDensity?: TableDensity;
  /** 初始边框 */
  defaultBordered?: boolean;
}

/**
 * 表格 Provider
 */
export function TableProvider(props: TableProviderProps) {
  const {
    children,
    columns = [],
    toolBarOptions = DEFAULT_TOOLBAR_OPTIONS,
    onReload,
    defaultDensity = 'middle',
    defaultBordered = true,
  } = props;

  // 状态
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [bordered, setBordered] = useState<boolean>(defaultBordered);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 初始化列设置
  const initialColumnSettings = useMemo<ColumnSettingItem[]>(() => {
    return columns
      .filter((col) => col.hideInTable !== true)
      .map((col) => ({
        key: String(col.dataIndex || col.key || ''),
        title: String(col.title || ''),
        visible: true,
        fixed: col.fixed === true ? 'left' : (col.fixed || false),
        disabled: false,
      }));
  }, [columns]);

  const [columnSettings, setColumnSettings] = useState<ColumnSettingItem[]>(initialColumnSettings);

  // 合并工具栏配置
  const mergedToolBarOptions = useMemo<ToolBarOptions>(() => {
    if (toolBarOptions === false) return { ...DEFAULT_TOOLBAR_OPTIONS };
    return { ...DEFAULT_TOOLBAR_OPTIONS, ...toolBarOptions };
  }, [toolBarOptions]);

  // 切换边框
  const toggleBordered = useCallback(() => {
    setBordered((prev) => !prev);
  }, []);

  // 重置列配置
  const resetColumnSettings = useCallback(() => {
    setColumnSettings(
      initialColumnSettings.map((item) => ({
        ...item,
        visible: true,
        fixed: false,
      }))
    );
  }, [initialColumnSettings]);

  // 切换单列显示
  const toggleColumnVisible = useCallback((key: string) => {
    setColumnSettings((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, visible: !item.visible } : item
      )
    );
  }, []);

  // 设置全部列显示/隐藏
  const setAllColumnsVisible = useCallback((visible: boolean) => {
    setColumnSettings((prev) =>
      prev.map((item) => ({
        ...item,
        visible: item.disabled ? item.visible : visible,
      }))
    );
  }, []);

  // 切换全屏
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  // 刷新
  const reload = useCallback(() => {
    return onReload?.();
  }, [onReload]);

  // Context 值
  const contextValue = useMemo<TableContextValue>(
    () => ({
      // 状态
      density,
      bordered,
      columnSettings,
      isFullScreen,
      loading,
      toolBarOptions: mergedToolBarOptions,
      // 操作
      setDensity,
      setBordered,
      toggleBordered,
      setColumnSettings,
      resetColumnSettings,
      toggleColumnVisible,
      setAllColumnsVisible,
      toggleFullScreen,
      reload,
      setLoading,
    }),
    [
      density,
      bordered,
      columnSettings,
      isFullScreen,
      loading,
      mergedToolBarOptions,
      toggleBordered,
      resetColumnSettings,
      toggleColumnVisible,
      setAllColumnsVisible,
      toggleFullScreen,
      reload,
    ]
  );

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
}

/**
 * 使用表格 Context Hook
 */
export function useTableContext(): TableContextValue {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}

/**
 * 可选的表格 Context Hook（不抛错）
 */
export function useTableContextOptional(): TableContextValue | null {
  return useContext(TableContext);
}

export { TableContext };
