import type {
  FormProps,
  RowProps,
  ModalProps,
  FormInstance,
  ButtonProps,
  ColProps, 
} from 'antd';
import {type ReactNode, type RefObject} from 'react';
import type { FormColumn } from '@/components/XinFormField/FieldRender';

/**
 * 表单操作栏按钮
 */
export type SubmitterButton = {
  /** 提交按钮 */
  submit: ReactNode;
  /** 重置按钮 */
  reset: ReactNode;
  /** 关闭按钮 */
  close: ReactNode;
}

/**
 * 表单操作栏属性
 */
export interface SubmitterProps {
  /** 操作栏渲染 */
  render?: false | ((dom: SubmitterButton, form?: RefObject<FormModalRef | undefined>) => ReactNode);
  /** 提交按钮文本 */
  submitText?: string | ReactNode;
  /** 重置按钮文本 */
  resetText?: string | ReactNode;
  /** 关闭按钮文本 */
  closeText?: string | ReactNode;
  /** 提交按钮属性 */
  submitButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 重置按钮属性 */
  resetButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
  /** 关闭按钮属性 */
  closeButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
}

export type FormMode = 'create' | 'update';

/**
 * Form 实例方法
 */
export interface FormModalRef<T = any> extends FormInstance<T> {
  /** 打开弹窗 */
  open: () => void;
  /** 关闭弹窗 */
  close: () => void;
  /** 获取弹窗的打开状态 */
  isOpen: () => boolean;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置表单类型 */
  setFormMode: (mode: FormMode, values?: T, key?: string) => void;
  /** 获取表单类型 */
  formMode: () => FormMode;
}

/**
 * XinForm 组件属性
 */
export type FormModalProps<T = any> = Omit<FormProps<T>, 'onFinish' | 'form'> & {
  /** 表单 API */
  api: string;
  /** 表单列配置 */
  columns: FormColumn<T>[];
  /** 是否使用 Grid 布局 */
  grid?: boolean;
  /** 开启 grid 模式时传递给 Row */
  rowProps?: RowProps;
  /** 传递给表单项的 Col */
  colProps?: ColProps;
  /** 表单提交 */
  onFinish?: (values: T, mode: FormMode, form?: RefObject<FormModalRef<T> | undefined>, defaultValue?: T) => Promise<boolean>;
  /** 表单实例引用 */
  formRef?: RefObject<FormModalRef<T> | undefined>;
  /** ModalForm 弹窗配置 */
  modalProps?: Omit<ModalProps, 'open'>;
  /** 表单操作栏属性 */
  submitter?: SubmitterProps;
}
