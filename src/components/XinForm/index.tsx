import React, { useCallback, useImperativeHandle, useMemo, useState, useEffect } from 'react';
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
  Divider,
  Typography,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'
import type { XinFormProps, XinFormColumn, XinFormRef, SubmitterButton } from './typings';
import type {
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
  ColorPickerProps,
  UploadProps,
  TooltipProps,
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
const { Title } = Typography;

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
  const [asyncOptions, setAsyncOptions] = useState<Record<string, any[]>>({});

  // 暴露表单方法
  useImperativeHandle(formRef, (): XinFormRef => ({
    ...form,
    open: handleOpen,
    close: handleClose,
    isOpen: () => open,
  }));

  // 初始化异步请求
  useEffect(() => {
    columns.forEach((column) => {
      const key = String(column.name || column.key);
      if (column.request && !column.request.dependencies?.length) {
        // 无依赖的直接请求
        column.request.request().then((data) => {
          setAsyncOptions((prev) => ({ ...prev, [key]: data }));
        });
      }
    });
  }, [columns]);

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
    const { valueType = 'text', fieldProps = {}, readonly, render, renderField: customRenderField, width, request } = column;
    const key = String(column.name || column.key);

    if (readonly) {
      const values: T = formInstance.getFieldsValue();
      return render ? render(values[key], values) : values[key];
    }

    // 自定义渲染
    if (valueType === 'custom' && customRenderField) {
      return customRenderField(formInstance);
    }

    // 合并异步选项
    const mergedFieldProps = {
      ...fieldProps,
      ...(width ? { style: { ...((fieldProps as any)?.style || {}), width } } : {}),
      ...(request && asyncOptions[key] ? { options: asyncOptions[key] } : {}),
    };

    switch (valueType) {
      case 'password':
        return <Password {...mergedFieldProps as PasswordProps} />;

      case 'textarea':
        return <TextArea rows={4} {...mergedFieldProps as TextAreaProps} />;

      case 'digit':
        return <InputNumber style={{ width: '100%' }} {...mergedFieldProps as InputNumberProps} />;

      case 'money':
        return <InputNumber style={{ width: '100%' }} precision={2} prefix="¥" {...mergedFieldProps as InputNumberProps} />;

      case 'select':
        return <Select {...mergedFieldProps as SelectProps} />;

      case 'treeSelect':
        return <TreeSelect {...mergedFieldProps as TreeSelectProps} />;

      case 'cascader':
        return <Cascader {...mergedFieldProps as any} />;

      case 'radio':
        return <Radio.Group options={[]} optionType="default" {...mergedFieldProps as RadioGroupProps} />;

      case 'radioButton':
        return <Radio.Group options={[]} optionType="button" {...mergedFieldProps as RadioGroupProps} />;

      case 'checkbox':
        return <Checkbox.Group options={[]} {...mergedFieldProps as CheckboxGroupProps} />;

      case 'switch':
        return <Switch {...mergedFieldProps as SwitchProps} />;

      case 'rate':
        return <Rate {...mergedFieldProps as RateProps} />;

      case 'slider':
        return <Slider {...mergedFieldProps as SliderSingleProps} />;

      case 'date':
        return <DatePicker style={{ width: '100%' }} {...mergedFieldProps as DatePickerProps} />;

      case 'dateTime':
        return <DatePicker style={{ width: '100%' }} showTime {...mergedFieldProps as DatePickerProps} />;

      case 'dateRange':
        return <RangePicker style={{ width: '100%' }} {...mergedFieldProps as RangePickerProps} />;

      case 'time':
        return <TimePicker style={{ width: '100%' }} {...mergedFieldProps as TimePickerProps} />;

      case 'timeRange':
        return <TimePicker.RangePicker style={{ width: '100%' }} {...mergedFieldProps as RangePickerProps} />;

      case 'week':
        return <DatePicker style={{ width: '100%' }} picker="week" {...mergedFieldProps as DatePickerProps} />;

      case 'month':
        return <DatePicker style={{ width: '100%' }} picker="month" {...mergedFieldProps as DatePickerProps} />;

      case 'quarter':
        return <DatePicker style={{ width: '100%' }} picker="quarter" {...mergedFieldProps as DatePickerProps} />;

      case 'year':
        return <DatePicker style={{ width: '100%' }} picker="year" {...mergedFieldProps as DatePickerProps} />;

      case 'color':
        return <ColorPicker {...mergedFieldProps as ColorPickerProps} />;

      case 'upload':
        return (
          <Upload {...mergedFieldProps as UploadProps}>
            <Button icon={<UploadOutlined />}>{t('xinForm.upload.button')}</Button>
          </Upload>
        );

      case 'image':
        return <ImageUploader {...mergedFieldProps as ImageUploaderProps} />;

      case 'icon':
        return <IconSelector {...mergedFieldProps as IconSelectProps} />;

      case 'user':
        return <UserSelector {...mergedFieldProps as UserSelectorProps} />;

      case 'text':
      default:
        return <Input {...mergedFieldProps as InputProps} />;
    }
  }, [asyncOptions, t]);

  // 渲染表单项标签
  const renderLabel = useCallback((column: XinFormColumn<T>): React.ReactNode => {
    const { label, tooltip } = column;
    if (!tooltip) return label;

    const tooltipProps: TooltipProps = typeof tooltip === 'string' 
      ? { title: tooltip } 
      : (tooltip as TooltipProps);

    return (
      <span>
        {label}
        <Tooltip {...tooltipProps}>
          <QuestionCircleOutlined style={{ marginLeft: 4, color: 'rgba(0,0,0,0.45)' }} />
        </Tooltip>
      </span>
    );
  }, []);

  // 渲染表单项
  const renderFormItem = useCallback((column: XinFormColumn<T>, index: number): React.ReactNode => {
    const key = column.key || String(column.name) || `form-item-${index}`;
    const colProps = column.colProps;
    const columnHidden = column.hidden;
    const { dependency, group, extra, tooltip, hidden: _hidden, ...restColumn } = column;

    // 分组标题
    const groupTitle = group ? (
      <Col span={24} key={`group-${key}`}>
        <Divider orientation="left" orientationMargin={0}>
          <Title level={5} style={{ margin: 0 }}>{group}</Title>
        </Divider>
      </Col>
    ) : null;

    // 有依赖时使用 Form.Item 的 shouldUpdate
    if (dependency) {
      const formItemWithDeps = (
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => {
          return dependency.dependencies.some(
            (dep) => prevValues[dep as string] !== curValues[dep as string]
          );
        }}>
          {({ getFieldsValue }) => {
            const values = getFieldsValue() as T;
            // 判断是否隐藏
            const isHidden = dependency.visible ? !dependency.visible(values) : false;
            if (isHidden) return null;

            // 判断是否禁用
            const isDisabled = dependency.disabled ? dependency.disabled(values) : false;
            // 动态 fieldProps
            const dynamicFieldProps = dependency.fieldProps ? dependency.fieldProps(values) : {};

            const mergedColumn = {
              ...restColumn,
              fieldProps: {
                ...(restColumn.fieldProps || {}),
                ...dynamicFieldProps,
                disabled: isDisabled || (restColumn.fieldProps as any)?.disabled,
              },
            } as XinFormColumn<T>;

            return (
              <Form.Item
                key={key}
                {...restColumn}
                label={tooltip ? renderLabel(column) : restColumn.label}
                extra={extra}
              >
                {renderField(mergedColumn, form)}
              </Form.Item>
            );
          }}
        </Form.Item>
      );

      const content = grid ? <Col {...colProps} key={key}>{formItemWithDeps}</Col> : formItemWithDeps;
      return group ? <>{groupTitle}{content}</> : content;
    }

    // 处理静态隐藏
    const hiddenValue = column.hidden as boolean | ((values: T) => boolean) | undefined;
    if (hiddenValue === true) return null;
    if (typeof hiddenValue === 'function') {
      const values = form.getFieldsValue() as T;
      if (hiddenValue(values)) return null;
    }

    // 普通表单项
    const formItemContent = (
      <Form.Item
        key={key}
        {...restColumn}
        label={tooltip ? renderLabel(column) : restColumn.label}
        extra={extra}
      >
        {renderField(column, form)}
      </Form.Item>
    );

    const content = grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
    return group ? <>{groupTitle}{content}</> : content;
  }, [grid, renderField, form, renderLabel]);

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
