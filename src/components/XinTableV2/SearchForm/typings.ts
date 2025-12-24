import type { ButtonProps, ColProps, FormInstance, FormProps, RowProps } from "antd";
import type { ReactNode, RefObject } from "react";
import type { FormColumn } from "../FormField";

/**
 * 操作栏按钮
 */
export type SubmitterButton = {
  /** 查询按钮 */
  search: ReactNode;
  /** 重置按钮 */
  reset: ReactNode;
  /** 展开/折叠按钮 */
  collapse: ReactNode;
}

/**
 * 表单操作栏属性
 */
export interface SubmitterProps {
  /** 操作栏渲染 */
  render?: false | ((dom: SubmitterButton, form?: RefObject<SearchFormRef | undefined>) => ReactNode);
  /** 提交按钮文本 */
  submitText?: string | ReactNode;
  /** 重置按钮文本 */
  resetText?: string | ReactNode;
  /** 提交按钮属性 */
  submitButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 重置按钮属性 */
  resetButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 折叠按钮渲染 */
  collapseRender?: (collapse: boolean) => ReactNode;
}

/**
 * Search 实例方法
 */
export interface SearchFormRef<T = any> extends FormInstance<T> {
  /** 折叠、展开搜索栏 */
  collapse: () => void;
  /** 获取搜索栏的折叠状态 */
  isCollapse: () => boolean;
  /** 设置搜索 Loading */
  setLoading: (loading: boolean) => void;
}

/**
 * XinSearch 组件属性
 */
export type SearchFormProps<T = any> = Omit<FormProps<T>, 'onFinish' | 'form'> & {
  /** 表单列配置 */
  columns: FormColumn<T>[];
  /** 是否使用 Grid 布局 */
  grid?: boolean;
  /** 开启 grid 模式时传递给 Row */
  rowProps?: RowProps;
  /** 传递给表单项的 Col */
  colProps?: ColProps;
  /** 表单提交 */
  onSearch?: (values: T) => Promise<boolean | void>;
  /** 表单实例引用 */
  formRef?: RefObject<SearchFormRef | undefined>;
  /** 渲染表单操作栏 */
  submitter?: SubmitterProps;
}
