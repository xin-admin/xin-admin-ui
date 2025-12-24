import type {
  TableProps,
  TableColumnType,
  CardProps,
} from 'antd';
import type { Key, RefObject } from 'react';
import type { TableRef } from 'antd/es/table';
import type { FormColumn } from './FormField';
import type { SearchFormProps, SearchFormRef } from './SearchForm';
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
  openFormModal: () => void;
  /** 关闭表单弹窗 */
  closeFormModal: () => void;
  /** 获取表单弹窗的打开状态 */
  isOpenFormModal: () => boolean;
  /** 设置表单加载状态 */
  setFormModalLoading: (loading: boolean) => void;
  /** 设置表单类型 */
  setFormMode: (mode: FormMode, values?: T, key?: string) => void;
  /** 获取表单类型 */
  formMode: () => FormMode;
  /** 折叠、展开搜索栏 */
  collapseSearch: () => void;
  /** 获取搜索栏的折叠状态 */
  isCollapseSearch: () => boolean;
  /** 设置搜索 Loading */
  setSearchLoading: (loading: boolean) => void;
  /** 获取表单实例 */
  form: () => FormModalRef<T>;
  /** 获取搜索表单实例 */
  searchForm: () => SearchFormRef<T>;
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
  rowKey: keyof T | string;
  /** 列配置 */
  columns: XinTableColumn<T>[];
  /** 表格实例引用 */
  tableRef?: RefObject<XinTableV2Ref<T>>;
  /** 搜索栏配置 */
  search?: SearchFormProps<T> | false;
  /** 表单配置 */
  form?: FormModalProps<T> | false;
  /** 新增按钮显示 */
  addShow?: boolean
  /** 编辑按钮显示 */
  editShow?: boolean | ((record: T) => boolean);
  /** 删除按钮显示 */
  deleteShow?: boolean | ((record: T) => boolean);
  /** 表格操作列显示 */
  operateShow?: boolean;
  /** 操作栏之后渲染 */
  beforeOperateRender?: (record: T) => React.ReactNode;
  /** 操作栏之后渲染 */
  afterOperateRender?: (record: T) => React.ReactNode;
  /** 工具栏渲染 */
  toolBarRender?: React.ReactNode[];
  /**
   * 表单提交
   * @param formData 表单数据
   * @param mode 表单模式 'create' | 'edit'
   * @param editingRecord 编辑时的原始数据，新增时为 null
   */
  onFinish?: (formData: T, mode: FormMode, editingRecord?: T) => Promise<boolean>;
  /** 删除前钩子，返回 false 可取消删除 */
  onDelete?: (record: T) => Promise<boolean> | boolean;
  /** 搜索前钩子，返回的数据会作为最终搜索的 Params */
  onSearch?: (record: T) => T;
  /** 请求后钩子 */
  requestSuccess?: (data?: API.ListResponse<T>) => void;
  /** 刷新方式: reset-重置到第一页, reload-保持当前页 */
  reloadType?: 'reset' | 'reload';
  /** 成功提示文本配置 */
  successMessage?: {
    /** 新增成功提示文本 */
    create?: string;
    /** 编辑成功提示文本 */
    update?: string;
    /** 删除成功提示文本 */
    delete?: string;
  };
  cardProps?: Pick<CardProps, 'variant' | 'hoverable' | 'size' | 'classNames' | 'styles'>;
}
