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
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

/**
 * XinForm - JSON 配置动态表单组件
 */
function XinForm<T extends Record<string, any> = any>(props: XinSearchProps<T>) {
  const {
    columns,
    grid = true,
    rowProps = {
      gutter: [16, 16], 
      wrap: true
    },
    onSearch,
    formRef,
    submitter
  } = props;

  const { t } = useTranslation();
  const [form] = Form.useForm<T>();
  const [collapse, setCollapse] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaultColProps = {
    xs: 24,
    sm: 12,
    md: 8,
    lg: 8,
    xl: 6,
  }

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
    if (collapse && index >= 3) return null;
    const key = String(column.dataIndex) || String(column.name) || `form-item-${index}`;
    const colProps = {
      ...defaultColProps,
      ...column.colProps,
    }
    
    const formItemContent = (
      <Form.Item
        style={{marginBottom: 0}}
        key={key} 
        name={key} 
        label={column.title || column.label} 
        {...column as FormItemProps}
        required={false}
      >
        <FieldRender column={column} form={form} />
      </Form.Item>
    );
    
    return grid ? <Col {...colProps} key={key}>{formItemContent}</Col> : formItemContent;
  }, [grid, form, collapse]);

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
        {submitter?.submitText || '搜索'}
      </Button>
    );

    const resetButton = (
      <Button
        loading={loading}
        onClick={() => form.resetFields()}
        {...submitter?.resetButtonProps}
      >
        {submitter?.resetText || '重置'}
      </Button>
    );

    const collapseButtonRender = (collapsed: boolean) => {
      if (collapsed) {
        return (
          <Space>
            { '展开' }
            <CaretDownOutlined />
          </Space>
        )
      } else {
        return (
          <Space>
            { '收起' }
            <CaretUpOutlined />
          </Space>
        )
      }
    };

    const collapseButton = (
      <a onClick={onCollapse}>
        { submitter?.collapseRender ? submitter.collapseRender(collapse) : collapseButtonRender(collapse) }
      </a>
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
      <Form.Item style={{marginBottom: 0}}>
        <Space size={12}>
          {buttons.reset}
          {buttons.search}
          {buttons.collapse}
        </Space>
      </Form.Item>
    );
  }, [loading, form, submitter, t, onCollapse]);

  // 表单内容
  return (
    <Form
      name="xin-search"
      variant={props.variant || 'filled'}
      {...props}
      form={form}
      onFinish={handleFinish}
    >
      {grid ? (
        <Row {...rowProps}>
          {columns.map((column, index) => renderFormItem(column, index))}
          <Col {...defaultColProps}>{renderSubmitter}</Col>
        </Row>
      ) : (
        <>
          {columns.map((column, index) => renderFormItem(column, index))}
          {renderSubmitter}
        </>
      )}
      
    </Form>
  )
}

export default XinForm;
export type { XinSearchProps, XinSearchRef };
