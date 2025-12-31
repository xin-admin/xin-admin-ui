import type {
  TableProps,
  TableColumnType,
  CardProps,
  FormInstance, PaginationProps,
} from 'antd';
import {type ReactNode, type RefObject} from 'react';
import type { FormColumn } from '@/components/XinFormField/FieldRender/typings';
import type { SearchFormProps } from './SearchForm';
import type { XinFormRef } from '@/components/XinForm/typings';

/**
 * 表单模式
 */
export type FormMode = 'create' | 'update';

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
  /** 获取当前数据源 */
  getDataSource: () => T[];
  /** 获取表单实例 */
  form?: () => XinFormRef<T> | null;
  /** 获取搜索表单实例 */
  searchForm?: () => FormInstance<T> | undefined;
}

export interface SorterParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 表单属性接口
 */
export interface FormProps<T = any> {
  /** 表单提交 */
  onFinish?: (values: T, mode?: FormMode, formRef?: RefObject<XinFormRef<T> | undefined>, defaultValues?: T) => Promise<boolean>;
  /** 其他属性可以通过 XinForm 的属性扩展 */
  [key: string]: any;
}

/** 请求参数类型 */
export interface RequestParams extends Record<string, any> {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  sorter?: SorterParams;
  keywordSearch?: string;
}

/**
 * XinTableV2 组件属性
 */
export interface XinTableV2Props<T = any> extends Omit<TableProps<T>, 'columns' | 'rowKey' | 'onChange' | 'pagination'> {
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
  addShow?: boolean;
  /** 编辑按钮显示 */
  editShow?: boolean | ((record: T) => boolean);
  /** 删除按钮显示 */
  deleteShow?: boolean | ((record: T) => boolean);
  /** 表格操作列显示 */
  operateShow?: boolean;
  /** 快速搜索显示 */
  keywordSearchShow?: boolean;

  /** 表单属性  */
  formProps?: FormProps<T> | false;
  /** 搜索栏属性  */
  searchProps?: Omit<SearchFormProps<T>, 'form'> | false;
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

  /** 自定义请求 */
  handleRequest?: (params: RequestParams) => Promise<{ data: T[]; total: number }>;
  /** 请求参数处理 */
  requestParams?: (params: RequestParams) => RequestParams;

  /** 开启批量操作 */
  batchOperation?: boolean;
  /** */
  selectionProps?: TableProps['rowSelection'];
}
