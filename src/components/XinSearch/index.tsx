import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Form,
  Button,
  Space,
  Row,
  Col,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { XinSearchProps, XinSearchRef, SubmitterButton } from './typings';
import type { FormItemProps } from 'antd';
import type { XinColumn } from '../XinFormField/FieldRender/typings';
import FieldRender from '../XinFormField/FieldRender';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

/**
 * XinForm - JSON 配置动态表单组件
 */
function XinForm<T extends Record<string, any> = any>(props: XinSearchProps<T>) {
  const {
    columns,
    grid = true,
    rowProps,
    onSearch,
    formRef,
    submitter
  } = props;

  const { t } = useTranslation();
  const [form] = Form.useForm<T>();
  const [collapse, setCollapse] = useState(false);
  const [loading, setLoading] = useState(false);

  // 打开弹窗/抽屉
  const onCollapse = () => setCollapse(!collapse);

  // 暴露表单方法
  useImperativeHandle(formRef, (): XinSearchRef => ({
    ...form,
    collapse: onCollapse,
    isCollapse: () => collapse
  }));

  // 搜索提交处理
  const handleFinish = useCallback(async (values: T) => {
    if (!onSearch) return;
    try {
      setLoading(true);
      await onSearch(values);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  

  // 渲染表单项
  const renderFormItem = useCallback((column: XinColumn<T>, index: number): React.ReactNode => {
    const key = String(column.dataIndex) || String(column.name) || `form-item-${index}`;
    const colProps = column.colProps;
    const dependency = column.dependency;

    let formItemContent;
    if (column.valueType === 'divider' ) {
      return;
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

    const resetButton = (
      <Button
        loading={loading}
        onClick={() => form.resetFields()}
        {...submitter?.resetButtonProps}
      >
        {submitter?.resetText || t('xinForm.reset')}
      </Button>
    );

    const collapseButton = (
      <Button
        loading={loading}
        onClick={onCollapse}
        icon={ 
          collapse
          ? 
          (submitter?.expandIcon || <UpOutlined />) 
          : 
          (submitter?.collapseIcon || <DownOutlined />)
        }
        {...submitter?.collapseButtonProps}
      />
    );

    const buttons: SubmitterButton = {
      search: submitButton,
      reset: resetButton,
      collapse: collapseButton,
    };

    if (typeof submitter?.render === 'function') {
      return submitter.render(buttons, formRef);
    }

    return (
      <Form.Item>
        <Space>
          {buttons.reset}
          {buttons.search}
          {buttons.collapse}
        </Space>
      </Form.Item>
    );
  }, [loading, form, submitter, t]);

  // 表单内容
  return (
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
      {renderSubmitter}
    </Form>
  )
}

export default XinForm;
export type { XinSearchProps, XinSearchRef };
