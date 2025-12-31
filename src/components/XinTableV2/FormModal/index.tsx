import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Form,
  Button,
  Space,
  Row,
  Col,
  Modal,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormMode, FormModalProps, FormModalRef, SubmitterButton } from './typings';
import type { FormItemProps } from 'antd';
import type { FormColumn } from '@/components/XinFormField/FieldRender';
import FieldRender from '@/components/XinFormField/FieldRender';
import { Create, Update } from '@/api/common/table';
import { pick } from 'lodash';

/**
 * XinForm - JSON 配置动态表单组件
 */
function XinForm<T = Record<string, any>>(props: FormModalProps<T>) {
  const {
    api,
    columns,
    grid = false,
    rowProps,
    colProps = { span: 12 },
    onFinish,
    formRef,
    modalProps,
    submitter,
    ...formProps
  } = props;

  const { t } = useTranslation();
  const [form] = Form.useForm<T>();
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [loading, setLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<T | undefined>(undefined);
  const [key, setKey] = useState<string>('id');

  // 暴露表单方法
  useImperativeHandle(formRef, (): FormModalRef => ({
    ...form,
    open: handleOpen,
    close: handleClose,
    isOpen: () => open,
    setLoading: (loading: boolean) => setLoading(loading),
    formMode: () => formMode,
    setFormMode: (mode: FormMode, defaultValues?: T, key?: string) => {
      setFormMode(mode);
      if(mode === 'create') {
        form.resetFields();
      } else {
        setDefaultValues(defaultValues);
        form.setFieldsValue(defaultValues || {});
        setKey(key || 'id');
      }
    },
  }));

  // 表单提交处理
  const handleFinish = async (values: T) => {
    if (onFinish) {
      const ok = await onFinish(values, formMode, formRef, defaultValues);
      if (ok) setOpen(false);
      return;
    }
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      if (formMode === 'create') {
        await Create(api, values);
        window.$message?.success(t('xinTableV2.form.createSuccess'));
        setOpen(false);
      } else {
        if (defaultValues && key) {
          await Update(api + `/${(defaultValues as Record<string, any>)[key]}`, values);
          window.$message?.success(t('xinTableV2.form.updateSuccess'));
          setOpen(false);
        } else {
          window.$message?.error(t('xinTableV2.form.updateKeyUndefined'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 打开弹窗
  const handleOpen =() => setOpen(true);

  // 关闭弹窗
  const handleClose = () => setOpen(false);

  // 渲染表单项
  const renderFormItem = useCallback((column: FormColumn<T>, index: number): React.ReactNode => {

    const {
      dataIndex, 
      valueType,
      title = '', 
      fieldProps = {},
      dependency,
      fieldRender
    } = column;

    // Form.Item 允许的属性列表
    const formItemPropKeys = [
      'colon', 'extra', 'getValueFromEvent', 'help', 'hidden', 'htmlFor',
      'initialValue',   'name', 'normalize',
      'noStyle', 'preserve', 'tooltip', 'trigger', 
      // 验证相关
      'required', 'rules', 'validateFirst', 'validateDebounce', 'validateStatus', 'hasFeedback',
      'validateTrigger', 'valuePropName', 'messageVariables',
      // 布局
      'wrapperCol', 'layout', 'label', 'labelAlign', 'labelCol'
    ];
    const formItemProps = pick(column, formItemPropKeys);

    const key = String(dataIndex) || `form-item-${index}`;

    let formItemContent;
    if (dependency) {
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

            const mergedFieldProps = {
              ...fieldProps,
              ...dynamicFieldProps,
              disabled: isDisabled || fieldProps?.disabled,
            }

            const defaultFieldRender = (
              <FieldRender 
                valueType={valueType}
                placeholder={title}
                {...mergedFieldProps}
              />
            );

            return (
              <Form.Item 
                key={key} 
                name={key} 
                label={column.title || column.label} 
                {...formItemProps as FormItemProps}
              >
                {fieldRender ? fieldRender(form) : defaultFieldRender}
              </Form.Item>
            );
          }}
        </Form.Item>
      );
    } else {

      const defaultFieldRender = (
        <FieldRender 
          valueType={valueType}
          placeholder={title}
          {...fieldProps}
        />
      );
      // 普通表单项
      formItemContent = (
        <Form.Item 
          key={key} 
          name={key} 
          label={column.title || column.label} 
          {...formItemProps as FormItemProps}
        >
          {fieldRender ? fieldRender(form) : defaultFieldRender}
        </Form.Item>
      );
    }
    return grid ? <Col {...Object.assign(colProps, column.colProps)} key={key}>{formItemContent}</Col> : formItemContent;
  }, [grid, form]);

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
        {submitter?.closeText || t('xinTableV2.form.close')}
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
      return submitter.render(buttons, formRef);
    }

    return (
      <Space>
        {buttons.close}
        {buttons.reset}
        {buttons.submit}
      </Space>
    );
    
  }, [loading, form, submitter, t]);

  // 表单内容
  const formContent = useMemo(() => (
    <Form
      {...formProps}
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
    </Form>
  ), [ form, handleFinish, props, grid, rowProps, columns, renderFormItem, renderSubmitter ]);

  // 根据 layoutType 渲染
  return (
    <>
      <Modal
        open={open}
        title={formMode === 'update' ? t('xinTableV2.form.editTitle') : t('xinTableV2.form.createTitle')}
        styles={{ header: { marginBottom: 16 } }}
        onCancel={handleClose}
        footer={renderSubmitter}
        {...modalProps}
      >
        {formContent}
      </Modal>
    </>
  )
}

export default XinForm;

export type { FormModalProps, FormModalRef };
