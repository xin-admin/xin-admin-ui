import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
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
  Upload,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Drawer,
  Divider,
  ColorPicker,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { IconSelector, ImageUploader, UserSelector } from '@/components/XinFormField';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { XinFormProps, XinFormColumn, XinFormRef } from './typings';
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
  CheckboxGroupProps,
  SwitchProps,
  RateProps,
  SliderSingleProps,
  DatePickerProps,
  TimePickerProps,
  RangePickerProps,
  TimeRangePickerProps,
  UploadProps,
  ColorPickerProps,
  TextAreaProps,
  PasswordProps
} from 'antd';


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
  } = props;

  const { t } = useTranslation();
  const [form] = Form.useForm<T>();
  const [open, setOpen] = useState(false);

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
    const result = await onFinish(values);
    if (result !== false && (layoutType === 'ModalForm' || layoutType === 'DrawerForm')) {
      setOpen(false);
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
    };

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

      case 'cascader':
        return <Cascader {...fieldProps as CascaderProps} />;

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

      case 'dateTimeRange':
        return <RangePicker showTime {...fieldProps as DatePickerProps} />;

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

      case 'upload':
        return (
          <Upload
            action={column.uploadProps?.action}
            accept={column.uploadProps?.accept}
            maxCount={column.uploadProps?.maxCount}
            multiple={column.uploadProps?.multiple}
            listType={column.uploadProps?.listType || 'text'}
            {...commonProps}
          >
            <Button icon={<UploadOutlined />}>{t('xinForm.upload.button')}</Button>
          </Upload>
        );

      case 'image':
        return (
          <ImageUploader
            action={column.imageProps?.action || '/sys-file/upload'}
            mode={column.imageProps?.mode}
            maxCount={column.imageProps?.maxCount}
            maxSize={column.imageProps?.maxSize}
            maxWidth={column.imageProps?.maxWidth}
            maxHeight={column.imageProps?.maxHeight}
            croppable={column.imageProps?.croppable}
            disabled={commonProps.disabled}
          />
        );

      case 'color':
        return <ColorPicker {...fieldProps as ColorPickerProps} />;

      case 'icon':
        return (
          <IconSelector
            placeholder={column.placeholder as string}
            disabled={commonProps.disabled}
            readonly={readonly}
          />
        );

      case 'user':
        return (
          <UserSelector
            mode={column.userProps?.mode}
            showDept={column.userProps?.showDept}
            maxTagCount={column.userProps?.maxTagCount}
            placeholder={column.placeholder as string}
            disabled={commonProps.disabled}
            readonly={readonly}
          />
        );

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
      <Form.Item
        key={key}
        name={column.name}
        label={column.label}
        tooltip={column.tooltip}
        extra={column.extra}
        initialValue={column.initialValue}
        rules={column.rules}
        valuePropName={column.valueType === 'switch' ? 'checked' : 'value'}
        {...column}
      >
        {renderField(column, form)}
      </Form.Item>
    );

    return grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
  }, [grid, rowProps, renderField, form, t]);

  // 渲染提交按钮
  const renderSubmitter = useMemo(() => {
    if (submitter?.render === false) return null;

    const submitButton = (
      <Button
        type="primary"
        htmlType="submit"
        loading={submitting || loading}
        {...submitter?.submitButtonProps}
      >
        {submitter?.submitText || t('xinForm.submit')}
      </Button>
    );

    const resetButton = (
      <Button onClick={() => form.resetFields()} {...submitter?.resetButtonProps}>
        {submitter?.resetText || t('xinForm.reset')}
      </Button>
    );

    const buttons = [resetButton, submitButton];

    if (typeof submitter?.render === 'function') {
      return submitter.render({ form, submitting }, buttons);
    }

    return (
      <Form.Item wrapperCol={wrapperCol ? { offset: wrapperCol.span ? Number(wrapperCol.span) : 0 } : undefined}>
        <Space>{buttons}</Space>
      </Form.Item>
    );
  }, [form, wrapperCol, t]);

  // 表单内容
  const formContent = useMemo(() => (
    <Form
      form={form}
      onFinish={handleFinish}
      {...props}
    >
      {grid ? (
        <Row {...rowProps}>
          {columns.map((column, index) => renderFormItem(column, index))}
        </Row>
      ) : (
        columns.map((column, index) => renderFormItem(column, index))
      )}
      {layoutType === 'Form' && renderSubmitter}
    </Form>
  ), [ form, handleFinish, props, grid, rowProps, columns, renderFormItem, layoutType, renderSubmitter ]);

  // 弹窗底部按钮
  const modalFooter = useMemo(() => {
    if (submitter?.render === false) return null;
    return (
      <Space>
        <Button onClick={handleClose}>
          {t('xinForm.cancel')}
        </Button>
        <Button type="primary" loading={submitting} onClick={() => form.submit()}>
          {submitter?.submitText || t('xinForm.submit')}
        </Button>
      </Space>
    );
  }, [submitter, submitting, form, handleClose, t]);

  // 触发器
  const triggerElement = useMemo(() => {
    if (!trigger) return null;
    return React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleTriggerClick,
    });
  }, [trigger, handleTriggerClick]);

  // 根据 layoutType 渲染
  if (layoutType === 'ModalForm') {
    return (
      <>
        {triggerElement}
        <Modal
          title={modalProps?.title}
          width={modalProps?.width}
          open={open}
          onCancel={handleClose}
          destroyOnClose={modalProps?.destroyOnClose}
          maskClosable={modalProps?.maskClosable}
          forceRender={modalProps?.forceRender}
          footer={modalFooter}
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
          title={drawerProps?.title}
          width={drawerProps?.width || 400}
          open={open}
          onClose={handleClose}
          destroyOnClose={drawerProps?.destroyOnClose}
          maskClosable={drawerProps?.maskClosable}
          placement={drawerProps?.placement}
          footer={modalFooter}
        >
          {formContent}
        </Drawer>
      </>
    );
  }

  return formContent;
}

export default XinForm;
export type { XinFormProps, XinFormColumn, XinFormRef, XinFormOption, XinFormValueType };
