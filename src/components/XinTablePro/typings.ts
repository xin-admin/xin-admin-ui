import type { RefObject, ReactNode, Key, Dispatch, SetStateAction } from 'react';
import type { TableProps, ModalProps, DrawerProps, ColProps, RowProps, FormInstance, SpinProps } from 'antd';
import type { ColumnType as AntColumnType } from 'antd/es/table';
import type { XinColumn as BaseXinColumn } from '../XinFormField/FieldRender/typings';
import type { XinFormRef, SubmitterProps as FormSubmitterProps } from '../XinForm/typings';
import type { XinSearchRef, SubmitterProps as SearchSubmitterProps } from '../XinSearch/typings';

/**
 * 表单模式
 */
export type FormMode = 'create' | 'edit';

/**
 * 扩展 XinColumn，添加表格特有属性
 */
export type XinCrudColumn<T = any> = BaseXinColumn<T> & {
  /** 是否在表格中显示 */
  hideInTable?: boolean;
  /** 是否在搜索中显示 */
  hideInSearch?: boolean;
  /** 是否在表单中显示 */
  hideInForm?: boolean;
  /** 是否在新增表单中显示 */
  hideInCreate?: boolean;
  /** 是否在编辑表单中显示 */
  hideInEdit?: boolean;
  /** 表格列宽度 */
  width?: number | string;
  /** 是否固定列 */
  fixed?: 'left' | 'right' | boolean;
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否支持排序 */
  sorter?: boolean | ((a: T, b: T) => number);
  /** 自定义表格单元格渲染 */
  render?: (value: any, record: T, index: number) => ReactNode;
  /** 表格列 ellipsis 配置 */
  ellipsis?: boolean | { showTitle?: boolean };
  /** 复制到表格配置 */
  copyable?: boolean;
  /** 值的枚举映射，用于表格显示 */
  valueEnum?: Record<string | number, { text: string; color?: string; status?: 'success' | 'error' | 'default' | 'processing' | 'warning' }>;
};

/**
 * XinCrud 实例方法
 */
export interface XinCrudRef<T = any> {
  /** 刷新表格数据 */
  reload: () => void;
  /** 重置搜索并刷新 */
  reset: () => void;
  /** 打开新增表单 */
  openCreate: () => void;
  /** 打开编辑表单 */
  openEdit: (record: T) => void;
  /** 关闭表单 */
  closeForm: () => void;
  /** 获取表单实例 */
  getFormInstance: () => FormInstance<T> | undefined;
  /** 获取搜索表单实例 */
  getSearchInstance: () => FormInstance | undefined;
  /** 获取选中的行 */
  getSelectedRows: () => T[];
  /** 设置选中的行 */
  setSelectedRows: Dispatch<SetStateAction<T[]>>;
  /** 获取当前表单模式 */
  getFormMode: () => FormMode;
}

/**
 * 操作按钮配置
 */
export interface OperateButtonConfig<T = any> {
  /** 编辑按钮显示 */
  editShow?: boolean | ((record: T) => boolean);
  /** 删除按钮显示 */
  deleteShow?: boolean | ((record: T) => boolean);
  /** 编辑按钮文本 */
  editText?: ReactNode;
  /** 删除按钮文本 */
  deleteText?: ReactNode;
  /** 删除确认文本 */
  deleteConfirmText?: ReactNode;
  /** 删除确认描述 */
  deleteConfirmDescription?: ReactNode;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 新增按钮显示 */
  addShow?: boolean;
  /** 新增按钮文本 */
  addText?: ReactNode;
  /** 批量删除按钮显示 */
  batchDeleteShow?: boolean;
  /** 批量删除按钮文本 */
  batchDeleteText?: ReactNode;
}

/**
 * 成功提示文本配置
 */
export interface SuccessMessages {
  create?: string;
  update?: string;
  delete?: string;
  batchDelete?: string;
}

/**
 * 请求方法类型
 */
export interface RequestMethods<T = any> {
  /** 列表查询 */
  list?: (params: Record<string, any>) => Promise<{ data: T[]; total: number; page?: number; pageSize?: number }>;
  /** 新增 */
  create?: (data: T) => Promise<any>;
  /** 更新 */
  update?: (id: Key, data: T) => Promise<any>;
  /** 删除 */
  delete?: (id: Key) => Promise<any>;
  /** 批量删除 */
  batchDelete?: (ids: Key[]) => Promise<any>;
}

/**
 * XinCrud 组件属性
 */
export interface XinCrudProps<T extends Record<string, any> = any> {
  /** 列配置 */
  columns: XinCrudColumn<T>[];
  /** API 接口前缀 (与 request 二选一) */
  api?: string;
  /** 自定义请求方法 (与 api 二选一) */
  request?: RequestMethods<T>;
  /** 主键字段名 */
  rowKey: keyof T | string;
  /** 权限标识前缀 */
  accessName?: string;

  // ===== 搜索配置 =====
  /** 是否显示搜索区域 */
  search?: boolean;
  /** 搜索表单 Ref */
  searchRef?: RefObject<XinSearchRef | undefined>;
  /** 搜索表单布局 */
  searchLayout?: 'horizontal' | 'vertical' | 'inline';
  /** 搜索表单 Grid 布局 */
  searchGrid?: boolean;
  /** 搜索表单 Row 属性 */
  searchRowProps?: RowProps;
  /** 搜索栏默认 ColProps */
  searchColProps?: ColProps;
  /** 搜索表单操作栏配置 */
  searchSubmitter?: SearchSubmitterProps;
  /** 搜索回调 */
  onSearch?: (values: Record<string, any>) => void;

  // ===== 表格配置 =====
  /** 表格属性扩展 */
  tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'loading' | 'rowKey' | 'pagination' | 'rowSelection'>;
  /** 是否显示操作列 */
  operateShow?: boolean;
  /** 操作列宽度 */
  operateWidth?: number | string;
  /** 操作列固定 */
  operateFixed?: 'left' | 'right' | boolean;
  /** 操作按钮配置 */
  operateConfig?: OperateButtonConfig<T>;
  /** 操作列前置渲染 */
  beforeOperateRender?: (record: T) => ReactNode;
  /** 操作列后置渲染 */
  afterOperateRender?: (record: T) => ReactNode;
  /** 工具栏配置 */
  toolbar?: ToolbarConfig;
  /** 工具栏扩展 */
  toolBarRender?: ReactNode[];
  /** 表格标题 */
  headerTitle?: ReactNode;
  /** 是否启用行选择 */
  rowSelection?: boolean;
  /** 分页配置 */
  pagination?: false | { pageSize?: number; showSizeChanger?: boolean; showQuickJumper?: boolean };
  /** 初始加载 */
  initLoad?: boolean;
  /** 加载状态 */
  loading?: boolean | SpinProps;

  // ===== 表单配置 =====
  /** 表单 Ref */
  formRef?: RefObject<XinFormRef | undefined>;
  /** 表单布局类型 */
  formLayoutType?: 'ModalForm' | 'DrawerForm';
  /** 表单布局 */
  formLayout?: 'horizontal' | 'vertical' | 'inline';
  /** 表单 Grid 布局 */
  formGrid?: boolean;
  /** 表单 Row 属性 */
  formRowProps?: RowProps;
  /** 表单默认 ColProps */
  formColProps?: ColProps;
  /** 表单操作栏配置 */
  formSubmitter?: FormSubmitterProps;
  /** Modal 表单配置 */
  modalProps?: Omit<ModalProps, 'open' | 'onCancel'>;
  /** Drawer 表单配置 */
  drawerProps?: Omit<DrawerProps, 'open' | 'onClose'>;
  /** 新增表单标题 */
  createTitle?: ReactNode;
  /** 编辑表单标题 */
  editTitle?: ReactNode;

  // ===== XinCrud Ref =====
  /** XinCrud 实例 Ref */
  crudRef?: RefObject<XinCrudRef<T> | undefined>;

  // ===== 钩子函数 =====
  /** 提交前钩子，返回处理后的数据 */
  beforeSubmit?: (formData: T, mode: FormMode, editingRecord?: T) => Promise<T> | T;
  /** 提交后钩子 */
  afterSubmit?: (formData: T, mode: FormMode) => void;
  /** 删除前钩子，返回 false 取消删除 */
  beforeDelete?: (record: T) => Promise<boolean> | boolean;
  /** 删除后钩子 */
  afterDelete?: (record: T) => void;
  /** 自定义表单提交 */
  onFinish?: (formData: T, mode: FormMode, editingRecord?: T) => Promise<boolean>;
  /** 数据加载成功回调 */
  onLoad?: (data: T[], total: number) => void;

  // ===== 其他配置 =====
  /** 刷新方式: reset-重置到第一页, reload-保持当前页 */
  reloadType?: 'reset' | 'reload';
  /** 成功提示文本配置 */
  successMessage?: SuccessMessages;
}
