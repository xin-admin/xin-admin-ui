import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Checkbox,
  Switch,
  DatePicker,
  TimePicker,
  TreeSelect,
  Cascader,
  Rate,
  Slider,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Drawer,
  ColorPicker,
  Upload, 
  Divider
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'
import type { XinFormProps, XinFormColumn, XinFormRef, SubmitterButton } from './typings';
import type {
  FormInstance,
  InputProps,
  InputNumberProps,
  SelectProps,
  TreeSelectProps,
  RadioGroupProps,
  SwitchProps,
  RateProps,
  SliderSingleProps,
  DatePickerProps,
  TimePickerProps,
  ColorPickerProps,
  UploadProps,
  FormItemProps,
  DividerProps
} from 'antd';
import type { PasswordProps, TextAreaProps } from "antd/es/input";
import type { RangePickerProps } from "antd/es/date-picker";
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import IconSelector from '@/components/XinFormField/IconSelector';
import ImageUploader from '@/components/XinFormField/ImageUploader';
import UserSelector from '@/components/XinFormField/UserSelector';
import type { IconSelectProps } from '@/components/XinFormField/IconSelector/typings';
import type { ImageUploaderProps } from '@/components/XinFormField/ImageUploader/typings';
import type { UserSelectorProps } from '@/components/XinFormField/UserSelector/typings';

const { TextArea, Password } = Input;
const { RangePicker } = DatePicker;

/**
 * XinForm - JSON 配置动态表单组件
 */
function XinForm<T extends Record<string, any> = any>(props: XinFormProps<T>) {
  const {
    columns,
    layoutType = 'Form',
    grid = false,
    rowProps,
    onFinish,
    formRef,
    modalProps,
    drawerProps,
    trigger,
    submitter
  } = props;

  const { t } = useTranslation();
  const [form] = Form.useForm<T>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 暴露表单方法
  useImperativeHandle(formRef, (): XinFormRef => ({
    ...form,
    open: handleOpen,
    close: handleClose,
    isOpen: () => open,
  }));

  // 表单提交处理
  const handleFinish = useCallback(async (values: T) => {
    if (!onFinish) return;
    try {
      setLoading(true);
      const result = await onFinish(values);
      if (result !== false && (layoutType === 'ModalForm' || layoutType === 'DrawerForm')) {
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }, [onFinish, layoutType]);

  // 打开弹窗/抽屉
  const handleOpen =() => setOpen(true);

  // 关闭弹窗/抽屉
  const handleClose = () => setOpen(false);

  // 渲染表单字段
  const renderField = useCallback((column: XinFormColumn<T>, formInstance: FormInstance<T>): React.ReactNode => {
    const { valueType = 'text', fieldProps = {}, renderField: customRenderField } = column;
    let dom: React.ReactNode;
    switch (valueType) {
      case 'password':
        dom = <Password {...fieldProps as PasswordProps} />;
        break;
      case 'textarea':
        dom =  <TextArea rows={4} {...fieldProps as TextAreaProps} />;
        break;
      case 'digit':
        dom =  <InputNumber style={{ width: '100%' }} {...fieldProps as InputNumberProps} />;
        break;
      case 'money':
        dom =  <InputNumber style={{ width: '100%' }} precision={2} prefix="¥" {...fieldProps as InputNumberProps} />;
        break;
      case 'select':
        dom =  <Select {...fieldProps as SelectProps} />;
        break;
      case 'treeSelect':
        dom =  <TreeSelect {...fieldProps as TreeSelectProps} />;
        break;
      case 'cascader':
        dom =  <Cascader {...fieldProps as any} />;
        break;
      case 'radio':
        dom =  <Radio.Group options={[]} optionType="default" {...fieldProps as RadioGroupProps} />;
        break;
      case 'radioButton':
        dom =  <Radio.Group options={[]} optionType="button" {...fieldProps as RadioGroupProps} />;
        break;
      case 'checkbox':
        dom =  <Checkbox.Group options={[]} {...fieldProps as CheckboxGroupProps} />;
        break;
      case 'switch':
        dom =  <Switch {...fieldProps as SwitchProps} />;
        break;
      case 'rate':
        dom =  <Rate {...fieldProps as RateProps} />;
        break;
      case 'slider':
        dom =  <Slider {...fieldProps as SliderSingleProps} />;
        break;
      case 'date':
        dom =  <DatePicker style={{ width: '100%' }} {...fieldProps as DatePickerProps} />;
        break;
      case 'dateTime':
        dom =  <DatePicker style={{ width: '100%' }} showTime {...fieldProps as DatePickerProps} />;
        break;
      case 'dateRange':
        dom =  <RangePicker style={{ width: '100%' }} {...fieldProps as RangePickerProps} />;
        break;
      case 'time':
        dom =  <TimePicker style={{ width: '100%' }} {...fieldProps as TimePickerProps} />;
        break;
      case 'timeRange':
        dom =  <TimePicker.RangePicker style={{ width: '100%' }} {...fieldProps as RangePickerProps} />;
        break;
      case 'week':
        dom =  <DatePicker style={{ width: '100%' }} picker="week" {...fieldProps as DatePickerProps} />;
        break;
      case 'month':
        dom =  <DatePicker style={{ width: '100%' }} picker="month" {...fieldProps as DatePickerProps} />;
        break;
      case 'quarter':
        dom =  <DatePicker style={{ width: '100%' }} picker="quarter" {...fieldProps as DatePickerProps} />;
        break;
      case 'year':
        dom =  <DatePicker style={{ width: '100%' }} picker="year" {...fieldProps as DatePickerProps} />;
        break;
      case 'color':
        dom =  <ColorPicker {...fieldProps as ColorPickerProps} />;
        break;
      case 'upload':
        dom =  (
          <Upload {...fieldProps as UploadProps}>
            <Button icon={<UploadOutlined />}>{t('xinForm.upload.button')}</Button>
          </Upload>
        );
        break;
      case 'image':
        dom =  <ImageUploader {...fieldProps as ImageUploaderProps} />;
        break;
      case 'icon':
        dom =  <IconSelector {...fieldProps as IconSelectProps} />;
        break;
      case 'user':
        dom =  <UserSelector {...fieldProps as UserSelectorProps} />;
        break;
      case 'text':
      default:
        dom =  <Input {...fieldProps as InputProps} />;
        break;
    }

    // 自定义渲染
    if (customRenderField) {
      return customRenderField(dom, formInstance);
    }
    return dom;
  }, []);

  // 渲染表单项
  const renderFormItem = useCallback((column: XinFormColumn<T>, index: number): React.ReactNode => {
    const key = String(column.name) || `form-item-${index}`;
    const colProps = column.colProps;
    const dependency = column.dependency;

    let formItemContent;
    if (column.valueType === 'divider' ) {
      formItemContent = <Divider {...column.fieldProps as DividerProps}>{ column.label || '' }</Divider>
    } else if (dependency) {
      // 有依赖时使用 Form.Item 的 shouldUpdate
      formItemContent = (
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => {
          return dependency.dependencies.some(
              (dep) => prevValues[dep as string] !== curValues[dep as string]
          );
        }}>
          {({getFieldsValue}) => {
            const values = getFieldsValue() as T;
            // 判断是否隐藏
            const isHidden = dependency.visible ? !dependency.visible(values) : false;
            if (isHidden) return null;

            // 判断是否禁用
            const isDisabled = dependency.disabled ? dependency.disabled(values) : false;
            // 动态 fieldProps
            const dynamicFieldProps = dependency.fieldProps ? dependency.fieldProps(values) : {};

            const mergedColumn = {
              ...column,
              fieldProps: {
                ...(column.fieldProps || {}),
                ...dynamicFieldProps,
                disabled: isDisabled || (column.fieldProps as any)?.disabled,
              },
            } as XinFormColumn<T>;

            return (
                <Form.Item key={key}{...column} >
                  {renderField(mergedColumn, form)}
                </Form.Item>
            );
          }}
        </Form.Item>
      );
    } else {
      // 普通表单项
      formItemContent = (
        <Form.Item key={key} {...column as FormItemProps}>
          {renderField(column, form)}
        </Form.Item>
      );
    }
    return grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
  }, [grid, renderField, form]);

  // 渲染提交按钮
  const renderSubmitter = useMemo(() => {
    if (submitter?.render === false) return null;

    const submitButton = (
      <Button
        type="primary"
        loading={loading}
        onClick={() => form.submit()}
        {...submitter?.submitButtonProps}
      >
        {submitter?.submitText || t('xinForm.submit')}
      </Button>
    );

    const closeButton = (
      <Button
        loading={loading}
        onClick={handleClose}
        {...submitter?.closeButtonProps}
      >
        {submitter?.closeText || t('xinForm.cancel')}
      </Button>
    );

    const resetButton = (
      <Button
        loading={loading}
        onClick={() => form.resetFields()}
        {...submitter?.resetButtonProps}
      >
        {submitter?.resetText || t('xinForm.reset')}
      </Button>
    );

    const buttons: SubmitterButton = {
      submit: submitButton,
      close: closeButton,
      reset: resetButton,
    };

    if (typeof submitter?.render === 'function') {
      return submitter.render(buttons);
    }

    if(layoutType === 'Form' || layoutType === 'StepsForm') {
      return (
        <Form.Item {...submitter?.formItemProps}>
          <Space>
            {buttons.reset}
            {buttons.submit}
          </Space>
        </Form.Item>
      );
    }else {
      return (
        <Space>
          {buttons.reset}
          {buttons.submit}
          {buttons.close}
        </Space>
      );
    }
  }, [loading, form, submitter, t]);

  // 表单内容
  const formContent = useMemo(() => (
    <Form
      {...props}
      form={form}
      onFinish={handleFinish}
    >
      {grid ? (
        <Row {...rowProps}>
          {columns.map((column, index) => renderFormItem(column, index))}
        </Row>
      ) : (
        columns.map((column, index) => renderFormItem(column, index))
      )}
      {(layoutType === 'Form' || layoutType === 'StepsForm') && renderSubmitter}
    </Form>
  ), [ form, handleFinish, props, grid, rowProps, columns, renderFormItem, layoutType, renderSubmitter ]);

  // 触发器
  const triggerElement = useMemo(() => {
    if (!trigger) return null;
    return React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleOpen,
    });
  }, [trigger, handleOpen]);

  // 根据 layoutType 渲染
  if (layoutType === 'ModalForm') {
    return (
      <>
        {triggerElement}
        <Modal
          open={open}
          onCancel={handleClose}
          footer={renderSubmitter}
          {...modalProps}
        >
          {formContent}
        </Modal>
      </>
    );
  }

  if (layoutType === 'DrawerForm') {
    return (
      <>
        {triggerElement}
        <Drawer
          open={open}
          onClose={handleClose}
          footer={renderSubmitter}
          {...drawerProps}
        >
          {formContent}
        </Drawer>
      </>
    );
  }

  return formContent;
}

export default XinForm;

export type { XinFormProps, XinFormColumn, XinFormRef };
