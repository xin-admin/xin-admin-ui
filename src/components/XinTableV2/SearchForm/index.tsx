import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Form,
  Button,
  Space,
  Row,
  Col,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { SearchFormProps, SearchFormRef, SubmitterButton } from './typings';
import type { FormItemProps } from 'antd';
import type { FormColumn } from '../FormField';
import FieldRender from '../FormField';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

/**
 * SearchForm - JSON 配置动态搜索表单组件
 */
function SearchForm<T extends Record<string, any> = any>(props: SearchFormProps<T>) {
  const {
    columns,
    grid = false,
    rowProps = {
      gutter: [16, 16], 
      wrap: true
    },
    colProps = {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 8,
      xl: 6,
    },
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
  useImperativeHandle(formRef, (): SearchFormRef => ({
    ...form,
    collapse: onCollapse,
    isCollapse: () => collapse,
    setLoading: (loading: boolean) => setLoading(loading),
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
  const renderFormItem = useCallback((column: FormColumn<T>, index: number): React.ReactNode => {
    if (collapse && index >= 3) return null;
    const key = String(column.dataIndex) || String(column.name) || `form-item-${index}`;
    const formItemContent = (
      <Form.Item
        style={{marginBottom: 0}}
        key={key} 
        name={key} 
        {...column as FormItemProps}
        required={false}
        label={null}
      >
        <FieldRender column={column} form={form} placeholder={column.title} />
      </Form.Item>
    );
    
    return grid ? <Col {...Object.assign(colProps, column.colProps)} key={key}>{formItemContent}</Col> : formItemContent;
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
      {...props}
      variant='filled'
      layout='inline'
      form={form}
      onFinish={handleFinish}
    >
      {grid ? (
        <Row {...rowProps}>
          {columns.map((column, index) => renderFormItem(column, index))}
          <Col {...colProps}>{renderSubmitter}</Col>
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

export default SearchForm;
export type { SearchFormProps, SearchFormRef };
