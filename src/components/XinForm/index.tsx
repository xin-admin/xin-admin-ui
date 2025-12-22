import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Form,
  Button,
  Space,
  Row,
  Col,
  Modal,
  Drawer,
  Divider
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { XinFormProps, XinFormRef, SubmitterButton } from './typings';
import type {
  FormItemProps,
  DividerProps
} from 'antd';
import type { XinColumn } from '../XinFormField/FieldRender/typings';
import FieldRender from '../XinFormField/FieldRender';

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

  // 渲染表单项
  const renderFormItem = useCallback((column: XinColumn<T>, index: number): React.ReactNode => {
    const key = String(column.dataIndex) || String(column.name) || `form-item-${index}`;
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
            } as XinColumn<T>;

            return (
              <Form.Item key={key} name={column.dataIndex} {...column} >
                <FieldRender column={mergedColumn} form={form} />
              </Form.Item>
            );
          }}
        </Form.Item>
      );
    } else {
      // 普通表单项
      formItemContent = (
        <Form.Item key={key} name={column.dataIndex} {...column as FormItemProps}>
          <FieldRender column={column} form={form} />
        </Form.Item>
      );
    }
    return grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
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
      return submitter.render(buttons, formRef);
    }

    if(layoutType === 'Form') {
      return (
        <Form.Item>
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
      {(layoutType === 'Form') && renderSubmitter}
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

export type { XinFormProps, XinFormRef };
