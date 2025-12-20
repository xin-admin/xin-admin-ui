import type {
  FormProps,
  FormItemProps,
  ColProps,
  RowProps,
  ModalProps,
  DrawerProps,
  StepProps,
  FormInstance,
  InputProps,
  InputNumberProps,
  SelectProps,
  TreeSelectProps,
  CascaderProps,
  RadioGroupProps,
  SwitchProps,
  RateProps,
  SliderSingleProps,
  DatePickerProps,
  TimePickerProps,
  TimeRangePickerProps,
  UploadProps,
  ColorPickerProps,
  ButtonProps, 
  DividerProps
} from 'antd';
import type { TextAreaProps, PasswordProps } from 'antd/es/input';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import {type ReactNode, type RefObject} from 'react';
import type { IconSelectProps } from '@/components/XinFormField/IconSelector/typings';
import type { ImageUploaderProps } from '@/components/XinFormField/ImageUploader/typings';
import type { UserSelectorProps } from '@/components/XinFormField/UserSelector/typings';

/**
 * 表单字段类型
 */
export type XinFormValue =
    | 'text'          // 文本输入
    | 'password'      // 密码输入
    | 'textarea'      // 多行文本
    | 'digit'         // 数字输入
    | 'money'         // 金额输入
    | 'select'        // 下拉选择
    | 'treeSelect'    // 树形选择
    | 'cascader'      // 级联选择
    | 'radio'         // 单选框
    | 'radioButton'   // 单选按钮
    | 'checkbox'      // 多选框
    | 'switch'        // 开关
    | 'rate'          // 评分
    | 'slider'        // 滑动条
    | 'date'          // 日期选择
    | 'dateTime'      // 日期时间选择
    | 'dateRange'     // 日期范围
    | 'time'          // 时间选择
    | 'timeRange'     // 时间范围
    | 'week'          // 周选择
    | 'month'         // 月选择
    | 'quarter'       // 季度选择
    | 'year'          // 年选择
    | 'upload'        // 文件上传
    | 'image'         // 图片上传
    | 'color'         // 颜色选择
    | 'icon'          // 图标选择
    | 'user'          // 用户选择
    | 'divider'

/**
 * valueType 到组件 Props 的类型映射
 */
export interface FieldPropsMap {
  text: InputProps;
  password: PasswordProps;
  textarea: TextAreaProps;
  digit: InputNumberProps;
  money: InputNumberProps;
  select: SelectProps;
  treeSelect: TreeSelectProps;
  cascader: CascaderProps;
  radio: Omit<RadioGroupProps, 'optionType'>;
  radioButton: Omit<RadioGroupProps, 'optionType'>;
  checkbox: CheckboxGroupProps;
  switch: SwitchProps;
  rate: RateProps;
  slider: SliderSingleProps;
  date: DatePickerProps;
  dateTime: DatePickerProps;
  dateRange: RangePickerProps;
  time: TimePickerProps;
  timeRange: TimeRangePickerProps;
  week: DatePickerProps;
  month: DatePickerProps;
  quarter: DatePickerProps;
  year: DatePickerProps;
  upload: UploadProps;
  image: ImageUploaderProps;
  color: ColorPickerProps;
  icon: IconSelectProps;
  user: UserSelectorProps;
  divider: DividerProps;
}

/**
 * 字段依赖配置
 */
export interface FieldDependency<T = any> {
  /** 依赖的字段名 */
  dependencies: (keyof T)[];
  /** 根据依赖值判断是否显示 */
  visible?: (values: Partial<T>) => boolean;
  /** 根据依赖值判断是否禁用 */
  disabled?: (values: Partial<T>) => boolean;
  /** 根据依赖值动态修改 fieldProps */
  fieldProps?: (values: Partial<T>) => Record<string, any>;
}

/**
 * 根据 valueType 映射 fieldProps 类型的表单列配置
 */
type XinFormColumnMap<T> = {
  [K in XinFormValue]: FormItemProps & {
    /** 字段类型 */
    valueType?: K;
    /** 自定义字段渲染 */
    renderField?: (dom: ReactNode, form: FormInstance<T>) => ReactNode;
    /** Col 属性 表单开启 grid 时生效 */
    colProps?: ColProps;
    /** 字段组件的属性，根据 valueType 自动推断类型 */
    fieldProps?: FieldPropsMap[K];
    /** 字段依赖配置 */
    dependency?: FieldDependency<T>;
  }
}

/**
 * 表单列配置
 * fieldProps 类型会根据 valueType 自动推断
 */
export type XinFormColumn<T> = XinFormColumnMap<T>[XinFormValue]

export type SubmitterButton = {
  submit: ReactNode,
  reset: ReactNode,
  close: ReactNode,
}

/**
 * XinForm 组件属性
 */
export type XinFormProps<T = any> = Omit<FormProps<T>, 'onFinish' | 'form'> & {
  /** 表单列配置 */
  columns: XinFormColumn<T>[];
  /** 表单布局类型 */
  layoutType?: 'Form' | 'ModalForm' | 'DrawerForm' | 'StepsForm';
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 是否使用 Grid 布局 */
  grid?: boolean;
  /** 开启 grid 模式时传递给 Row */
  rowProps?: RowProps;
  /** 表单提交 */
  onFinish?: (values: T) => Promise<boolean | void>;
  /** 表单实例引用 */
  formRef?: RefObject<XinFormRef | undefined>;
  /** ModalForm 弹窗配置 */
  modalProps?: Omit<ModalProps, 'open'>;
  /** DrawerForm 抽屉配置 */
  drawerProps?: Omit<DrawerProps, 'open'>;
  /** StepsForm 步骤配置 */
  stepsProps?: StepProps;
  /** 触发器 */
  trigger?: ReactNode;
  /** 渲染表单操作栏 */
  submitter?: {
    okText?: string;
    render?: false | ((dom: SubmitterButton, form?: RefObject<XinFormRef | undefined>) => ReactNode);
    submitText?: string | ReactNode;
    resetText?: string | ReactNode;
    closeText?: string | ReactNode;
    submitButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
    resetButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
    closeButtonProps?: Omit<ButtonProps, 'loading' | 'onClick'>;
    formItemProps?: Omit<FormItemProps, 'label'>;
  }
}

/**
 * XinForm 实例方法
 */
export interface XinFormRef extends FormInstance {
  /** 打开弹窗/抽屉 (仅 ModalForm/DrawerForm 有效) */
  open: () => void;
  /** 关闭弹窗/抽屉 (仅 ModalForm/DrawerForm 有效) */
  close: () => void;
  /** 获取弹窗/抽屉的打开状态 */
  isOpen: () => boolean;
}