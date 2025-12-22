import type { ButtonProps, FormInstance, FormProps, RowProps } from "antd";
import type { ReactNode, RefObject } from "react";
import type { XinColumn } from "../XinFormField/FieldRender/typings";

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
  render?: false | ((dom: SubmitterButton, form?: RefObject<XinSearchRef | undefined>) => ReactNode);
  /** 提交按钮文本 */
  submitText?: string | ReactNode;
  /** 重置按钮文本 */
  resetText?: string | ReactNode;
  /** 提交按钮属性 */
  submitButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 重置按钮属性 */
  resetButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 折叠按钮属性 */
  collapseButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 展开状态下图标 */
  expandIcon?: ReactNode;
  /** 折叠状态下图标 */
  collapseIcon?: ReactNode;
}

/**
 * XinSearch 实例方法
 */
export interface XinSearchRef<T = any> extends FormInstance<T> {
  /** 折叠、展开搜索栏 */
  collapse: () => void;
  /** 获取搜索栏的折叠状态 */
  isCollapse: () => boolean;
}

/**
 * XinSearch 组件属性
 */
export type XinSearchProps<T = any> = Omit<FormProps<T>, 'onFinish' | 'form'> & {
  /** 表单列配置 */
  columns: XinColumn<T>[];
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 是否使用 Grid 布局 */
  grid?: boolean;
  /** 开启 grid 模式时传递给 Row */
  rowProps?: RowProps;
  /** 表单提交 */
  onSearch?: (values: T) => Promise<boolean | void>;
  /** 表单实例引用 */
  formRef?: RefObject<XinSearchRef | undefined>;
  /** 渲染表单操作栏 */
  submitter?: SubmitterProps
}
