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
  Rate,
  Slider,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Drawer,
  ColorPicker
} from 'antd';
import { useTranslation } from 'react-i18next'
import type {XinFormProps, XinFormColumn, XinFormRef, SubmitterButton} from './typings';
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
} from 'antd';
import type {PasswordProps, TextAreaProps} from "antd/es/input";
import type {RangePickerProps} from "antd/es/date-picker";
import type {CheckboxGroupProps} from 'antd/es/checkbox';


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
    const { valueType = 'text', fieldProps = {}, readonly, render } = column;
    const key = String(column.name || column.key);

    if(readonly) {
      const values: T = formInstance.getFieldsValue();
      return render ? render(values[key], values) : values[key];
    }

    switch (valueType) {

      case 'password':
        return <Password {...fieldProps as PasswordProps} />;

      case 'textarea':
        return <TextArea rows={4} {...fieldProps as TextAreaProps} />;

      case 'digit':
        return <InputNumber {...fieldProps as InputNumberProps} />;

      case 'money':
        return <InputNumber precision={2} prefix={'¥'}{...fieldProps as InputNumberProps} />;

      case 'select':
        return <Select {...fieldProps as SelectProps} />;

      case 'treeSelect':
        return <TreeSelect {...fieldProps as TreeSelectProps} />;

      case 'radio':
        return <Radio.Group options={[]} optionType="default" {...fieldProps as RadioGroupProps} />;

      case 'radioButton':
        return <Radio.Group options={[]} optionType="button" {...fieldProps as RadioGroupProps} />;

      case 'checkbox':
        return <Checkbox.Group options={[]} {...fieldProps as CheckboxGroupProps} />;

      case 'switch':
        return <Switch {...fieldProps as SwitchProps} />;

      case 'rate':
        return <Rate {...fieldProps as RateProps} />;

      case 'slider':
        return <Slider {...fieldProps as SliderSingleProps} />;

      case 'date':
        return <DatePicker {...fieldProps as DatePickerProps} />;

      case 'dateTime':
        return <DatePicker showTime {...fieldProps as DatePickerProps} />;

      case 'dateRange':
        return <RangePicker {...fieldProps as RangePickerProps} />;

      case 'time':
        return <TimePicker {...fieldProps as TimePickerProps} />;

      case 'timeRange':
        return <TimePicker.RangePicker {...fieldProps as RangePickerProps}/>;

      case 'week':
        return <DatePicker picker="week" {...fieldProps as DatePickerProps} />;

      case 'month':
        return <DatePicker picker="month" {...fieldProps as DatePickerProps} />;

      case 'quarter':
        return <DatePicker picker="quarter" {...fieldProps as DatePickerProps} />;

      case 'year':
        return <DatePicker picker="year" {...fieldProps as DatePickerProps} />;

      case 'color':
        return <ColorPicker {...fieldProps as ColorPickerProps} />;

      case 'text':
      default:
        return <Input {...fieldProps as InputProps} />;
    }
  }, [t]);

  // 渲染表单项
  const renderFormItem = useCallback((column: XinFormColumn<T>, index: number): React.ReactNode => {
    const key = column.key || String(column.name) || `form-item-${index}`;
    const colProps = column.colProps;

    // 普通表单项
    const formItemContent = (
      <Form.Item key={key} {...column}>
        {renderField(column, form)}
      </Form.Item>
    );

    return grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
  }, [grid, rowProps, renderField, form]);

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
