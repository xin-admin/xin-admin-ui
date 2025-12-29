import type {
  TableProps,
  TableColumnType,
  CardProps,
  FormInstance, PaginationProps,
} from 'antd';
import {type Key, type ReactNode, type RefObject} from 'react';
import type { FormColumn } from './FormField';
import type { SearchFormProps } from './SearchForm';
import type { FormModalProps, FormModalRef } from './FormModal';
import type { FormMode } from './FormModal/typings';

/**
 * 表格列配置
 */
export type XinTableColumn<T = any> = Omit<TableColumnType<T>, 'dataIndex'> & {
  hideInSearch?: boolean;
  hideInForm?: boolean;
  hideInTable?: boolean;
  search?: FormColumn<T>;
} & FormColumn<T>;

/**
 * XinTableV2 实例方法
 */
export interface XinTableV2Ref<T = any> {
  /** 刷新表格（保持当前页） */
  reload: () => void;
  /** 重置表格（回到第一页） */
  reset: () => void;
  /** 获取当前数据源 */
  getDataSource: () => T[];
  /** 获取选中行的 keys */
  getSelectedRowKeys: () => Key[];
  /** 获取选中行数据 */
  getSelectedRows: () => T[];
  /** 清空选中 */
  clearSelected: () => void;
  /** 打开表单弹窗 */
  openFormModal?: () => void;
  /** 关闭表单弹窗 */
  closeFormModal?: () => void;
  /** 获取表单弹窗的打开状态 */
  isOpenFormModal?: () => boolean;
  /** 设置表单加载状态 */
  setFormModalLoading?: (loading: boolean) => void;
  /** 设置表单类型 */
  setFormMode?: (mode: FormMode, values?: T, key?: string) => void;
  /** 获取表单类型 */
  formMode?: () => FormMode;
  /** 获取表单实例 */
  form?: () => FormModalRef<T> | null;
  /** 获取搜索表单实例 */
  searchForm?: () => FormInstance<T> | undefined;
}

/**
 * XinTableV2 组件属性
 */
export interface XinTableV2Props<T = any> extends Omit<TableProps<T>, 'columns' | 'rowKey'> {
  /** API 地址 */
  api: string;
  /** 权限名称前缀 */
  accessName: string;
  /** 主键 */
  rowKey: string;
  /** 列配置 */
  columns: XinTableColumn<T>[];

  /** 表格实例引用 */
  tableRef?: RefObject<XinTableV2Ref<T>>;

  /** 新增按钮显示 */
  addShow?: boolean
  /** 编辑按钮显示 */
  editShow?: boolean | ((record: T) => boolean);
  /** 删除按钮显示 */
  deleteShow?: boolean | ((record: T) => boolean);
  /** 表格操作列显示 */
  operateShow?: boolean;

  /** 表单属性  */
  formProps?: FormModalProps<T> | false;
  /** 搜索栏属性  */
  searchProps?: SearchFormProps<T> | false;
  /** 操作栏属性 */
  operateProps?: TableColumnType<T>;
  /** 卡片属性 */
  cardProps?: Pick<CardProps, 'variant' | 'hoverable' | 'size' | 'classNames' | 'styles'>;
  /** 分页配置 */
  pagination: Omit<PaginationProps, 'total' | 'onChange' | 'size' | 'current'>;

  /** 标题渲染 */
  titleRender?: ReactNode;
  /** 工具栏渲染 */
  toolBarRender?: ReactNode[];
  /** 操作栏之后渲染 */
  beforeOperateRender?: (record: T) => ReactNode;
  /** 操作栏之后渲染 */
  afterOperateRender?: (record: T) => ReactNode;

  /** 成功提示文本配置 */
  successMessage?: {
    /** 新增成功提示文本 */
    create?: string;
    /** 编辑成功提示文本 */
    update?: string;
    /** 删除成功提示文本 */
    delete?: string;
  };

  /** 自定义请求 */
  handleRequest?: (params: Record<any, any>) => Promise<{ data: T[]; total: number }>;
  /** 请求参数处理 */
  requestParams?: (params: Record<any, any>) => Record<any, any>;
}
