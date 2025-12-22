import React, { useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tooltip,
  message,
  Card,
  Badge,
  Tag,
} from 'antd';
import type { TableProps, FormInstance, TablePaginationConfig } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Create, Delete, Update, List } from '@/api/common/table';
import AuthButton from '@/components/AuthButton';
import XinSearch from '@/components/XinSearch';
import XinForm from '@/components/XinForm';
import type { XinSearchRef } from '@/components/XinSearch/typings';
import type { XinFormRef } from '@/components/XinForm/typings';
import type { XinColumn } from '@/components/XinFormField/FieldRender/typings';
import type {
  XinCrudProps,
  XinCrudRef,
  XinCrudColumn,
  FormMode,
} from './typings';

/**
 * XinCrud - 基于 Ant Design 的 CRUD 表格组件
 * 整合 XinSearch、XinForm 和 Table，提供统一的 CRUD 能力
 */
function XinCrud<T extends Record<string, any> = any>(props: XinCrudProps<T>) {
  const {
    columns,
    api,
    request,
    rowKey,
    accessName,
    // 搜索配置
    search = true,
    searchRef,
    searchLayout = 'inline',
    searchGrid = true,
    searchRowProps = { gutter: [16, 0] },
    searchColProps = { span: 6 },
    searchSubmitter,
    onSearch,
    // 表格配置
    tableProps,
    operateShow = true,
    operateWidth = 120,
    operateFixed = 'right',
    operateConfig = {},
    beforeOperateRender,
    afterOperateRender,
    toolbar = {},
    toolBarRender = [],
    headerTitle,
    rowSelection = false,
    pagination = { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
    initLoad = true,
    loading: propsLoading,
    // 表单配置
    formRef,
    formLayoutType = 'ModalForm',
    formLayout = 'horizontal',
    formGrid = true,
    formRowProps = { gutter: [16, 16] },
    formColProps = { span: 24 },
    formSubmitter,
    modalProps,
    drawerProps,
    createTitle,
    editTitle,
    // Ref
    crudRef,
    // 钩子
    beforeSubmit,
    afterSubmit,
    beforeDelete,
    afterDelete,
    onFinish,
    onLoad,
    // 其他
    reloadType = 'reset',
    successMessage,
  } = props;

  const { t } = useTranslation();

  // ===== 状态管理 =====
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination ? (pagination.pageSize || 10) : 10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingRecord, setEditingRecord] = useState<T | undefined>(undefined);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  // ===== Refs =====
  const innerSearchRef = useRef<XinSearchRef>(undefined);
  const innerFormRef = useRef<XinFormRef>(undefined);
  const searchFormRef = searchRef || innerSearchRef;
  const formFormRef = formRef || innerFormRef;

  // ===== 暴露实例方法 =====
  useImperativeHandle(crudRef, (): XinCrudRef<T> => ({
    reload: () => fetchData(currentPage, pageSize, searchParams),
    reset: () => {
      setCurrentPage(1);
      setSearchParams({});
      fetchData(1, pageSize, {});
    },
    openCreate: handleOpenCreate,
    openEdit: handleOpenEdit,
    closeForm: () => formFormRef.current?.close(),
    getFormInstance: () => formFormRef.current as FormInstance<T> | undefined,
    getSearchInstance: () => searchFormRef.current as FormInstance | undefined,
    getSelectedRows: () => selectedRows,
    setSelectedRows,
    getFormMode: () => formMode,
  }));

  // ===== 数据请求 =====
  const fetchData = useCallback(async (page: number, size: number, params: Record<string, any>) => {
    setLoading(true);
    try {
      let result: { data: T[]; total: number };

      if (request?.list) {
        result = await request.list({ page, pageSize: size, ...params });
      } else if (api) {
        const response = await List<T>(api, { current: page, pageSize: size, ...params });
        result = {
          data: response.data.data?.data || [],
          total: response.data.data?.total || 0,
        };
      } else {
        console.warn('XinCrud: 请提供 api 或 request.list');
        return;
      }

      setDataSource(result.data);
      setTotal(result.total);
      onLoad?.(result.data, result.total);
    } catch (error) {
      console.error('XinCrud fetchData error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, request, onLoad]);

  // 初始加载
  useEffect(() => {
    if (initLoad) {
      fetchData(currentPage, pageSize, searchParams);
    }
  }, []);

  // ===== 搜索处理 =====
  const handleSearch = useCallback(async (values: Record<string, any>) => {
    setSearchParams(values);
    setCurrentPage(1);
    await fetchData(1, pageSize, values);
    onSearch?.(values);
  }, [pageSize, fetchData, onSearch]);

  // ===== 表格分页处理 =====
  const handleTableChange = useCallback((paginationConfig: TablePaginationConfig) => {
    const { current = 1, pageSize: newPageSize = 10 } = paginationConfig;
    setCurrentPage(current);
    setPageSize(newPageSize);
    fetchData(current, newPageSize, searchParams);
  }, [searchParams, fetchData]);

  // ===== 表单操作 =====
  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setEditingRecord(undefined);
    formFormRef.current?.resetFields();
    formFormRef.current?.open();
  }, [formFormRef]);

  const handleOpenEdit = useCallback((record: T) => {
    setFormMode('edit');
    setEditingRecord(record);
    formFormRef.current?.setFieldsValue(record);
    formFormRef.current?.open();
  }, [formFormRef]);

  // 表单提交
  const handleFormSubmit = useCallback(async (values: T) => {
    // 自定义提交
    if (onFinish) {
      const success = await onFinish(values, formMode, editingRecord);
      if (success) {
        refreshTable();
      }
      return success;
    }

    // 预处理数据
    let processedData = values;
    if (beforeSubmit) {
      processedData = await beforeSubmit(values, formMode, editingRecord);
    }

    try {
      if (formMode === 'edit' && editingRecord) {
        const id = editingRecord[rowKey as keyof T];
        if (request?.update) {
          await request.update(id as Key, processedData);
        } else if (api) {
          await Update(api + `/${id}`, processedData as { [key: string]: unknown });
        }
        message.success(successMessage?.update || t('xin-crud.updateSuccess'));
      } else {
        if (request?.create) {
          await request.create(processedData);
        } else if (api) {
          await Create(api, processedData as { [key: string]: unknown });
        }
        message.success(successMessage?.create || t('xin-crud.createSuccess'));
      }

      refreshTable();
      afterSubmit?.(processedData, formMode);
      return true;
    } catch (error) {
      console.error('XinCrud submit error:', error);
      return false;
    }
  }, [formMode, editingRecord, rowKey, api, request, beforeSubmit, afterSubmit, onFinish, successMessage, t]);

  // 删除操作
  const handleDelete = useCallback(async (record: T) => {
    if (beforeDelete) {
      const canDelete = await beforeDelete(record);
      if (canDelete === false) return;
    }

    try {
      const id = record[rowKey as keyof T];
      if (request?.delete) {
        await request.delete(id as Key);
      } else if (api) {
        await Delete(api + `/${id}`);
      }
      message.success(successMessage?.delete || t('xin-crud.deleteSuccess'));
      refreshTable();
      afterDelete?.(record);
    } catch (error) {
      console.error('XinCrud delete error:', error);
    }
  }, [rowKey, api, request, beforeDelete, afterDelete, successMessage, t]);

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t('xin-crud.selectAtLeastOne'));
      return;
    }

    try {
      if (request?.batchDelete) {
        await request.batchDelete(selectedRowKeys);
      } else if (api) {
        // 默认逐个删除
        await Promise.all(selectedRowKeys.map(id => Delete(api + `/${id}`)));
      }
      message.success(successMessage?.batchDelete || t('xin-crud.batchDeleteSuccess'));
      setSelectedRowKeys([]);
      setSelectedRows([]);
      refreshTable();
    } catch (error) {
      console.error('XinCrud batch delete error:', error);
    }
  }, [selectedRowKeys, api, request, successMessage, t]);

  // 刷新表格
  const refreshTable = useCallback(() => {
    if (reloadType === 'reload') {
      fetchData(currentPage, pageSize, searchParams);
    } else {
      setCurrentPage(1);
      fetchData(1, pageSize, searchParams);
    }
  }, [reloadType, currentPage, pageSize, searchParams, fetchData]);

  // ===== 列配置转换 =====
  // 搜索列
  const searchColumns = useMemo(() => {
    return columns
      .filter(col => !col.hideInSearch && col.dataIndex)
      .map(col => ({
        ...col,
        colProps: col.colProps || searchColProps,
      })) as XinColumn[];
  }, [columns, searchColProps]);

  // 表单列
  const formColumns = useMemo(() => {
    return columns
      .filter(col => {
        if (col.hideInForm) return false;
        if (formMode === 'create' && col.hideInCreate) return false;
        if (formMode === 'edit' && col.hideInEdit) return false;
        return col.dataIndex;
      })
      .map(col => ({
        ...col,
        colProps: col.colProps || formColProps,
      })) as XinColumn[];
  }, [columns, formMode, formColProps]);

  // 表格列
  const tableColumns = useMemo(() => {
    const cols: ColumnType<T>[] = columns
      .filter(col => !col.hideInTable && col.dataIndex)
      .map(col => {
        const tableCol: ColumnType<T> = {
          title: col.label,
          dataIndex: col.dataIndex as string,
          key: col.key || (col.dataIndex as string),
          width: col.width,
          fixed: col.fixed,
          align: col.align,
          ellipsis: col.ellipsis,
          sorter: col.sorter,
        };

        // 自定义渲染或枚举渲染
        if (col.render) {
          tableCol.render = col.render;
        } else if (col.valueEnum) {
          tableCol.render = (value: any) => {
            const enumItem = col.valueEnum?.[value];
            if (!enumItem) return value;
            if (enumItem.status) {
              return <Badge status={enumItem.status} text={enumItem.text} />;
            }
            if (enumItem.color) {
              return <Tag color={enumItem.color}>{enumItem.text}</Tag>;
            }
            return enumItem.text;
          };
        } else if (col.valueType === 'switch') {
          tableCol.render = (value: any) => (
            <Badge status={value ? 'success' : 'default'} text={value ? t('xin-crud.yes') : t('xin-crud.no')} />
          );
        }

        return tableCol;
      });

    // 操作列
    if (operateShow) {
      const { editShow = true, deleteShow = true } = operateConfig;
      cols.push({
        title: t('xin-crud.operate'),
        key: '__operate__',
        width: operateWidth,
        fixed: operateFixed,
        align: 'center',
        render: (_, record) => {
          const showEdit = typeof editShow === 'function' ? editShow(record) : editShow;
          const showDelete = typeof deleteShow === 'function' ? deleteShow(record) : deleteShow;

          return (
            <Space size="small">
              {beforeOperateRender?.(record)}
              {showEdit && (
                <AuthButton auth={accessName ? `${accessName}.update` : undefined}>
                  <Tooltip title={operateConfig.editText || t('xin-crud.edit')}>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleOpenEdit(record)}
                    />
                  </Tooltip>
                </AuthButton>
              )}
              {showDelete && (
                <AuthButton auth={accessName ? `${accessName}.delete` : undefined}>
                  <Popconfirm
                    title={operateConfig.deleteConfirmText || t('xin-crud.deleteConfirm')}
                    description={operateConfig.deleteConfirmDescription || t('xin-crud.deleteConfirmDesc')}
                    onConfirm={() => handleDelete(record)}
                    okText={t('xin-crud.confirm')}
                    cancelText={t('xin-crud.cancel')}
                  >
                    <Tooltip title={operateConfig.deleteText || t('xin-crud.delete')}>
                      <Button type="primary" icon={<DeleteOutlined />} size="small" danger />
                    </Tooltip>
                  </Popconfirm>
                </AuthButton>
              )}
              {afterOperateRender?.(record)}
            </Space>
          );
        },
      });
    }

    return cols;
  }, [columns, operateShow, operateWidth, operateFixed, operateConfig, accessName, beforeOperateRender, afterOperateRender, handleOpenEdit, handleDelete, t]);

  // ===== 工具栏渲染 =====
  const toolbarContent = useMemo(() => {
    const { addShow = true, batchDeleteShow = false } = toolbar;
    return (
      <Space>
        {addShow && (
          <AuthButton auth={accessName ? `${accessName}.create` : undefined}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              {toolbar.addText || t('xin-crud.add')}
            </Button>
          </AuthButton>
        )}
        {batchDeleteShow && selectedRowKeys.length > 0 && (
          <AuthButton auth={accessName ? `${accessName}.delete` : undefined}>
            <Popconfirm
              title={t('xin-crud.batchDeleteConfirm')}
              description={t('xin-crud.batchDeleteConfirmDesc', { count: selectedRowKeys.length })}
              onConfirm={handleBatchDelete}
              okText={t('xin-crud.confirm')}
              cancelText={t('xin-crud.cancel')}
            >
              <Button danger icon={<DeleteOutlined />}>
                {toolbar.batchDeleteText || t('xin-crud.batchDelete')} ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          </AuthButton>
        )}
        {toolBarRender}
      </Space>
    );
  }, [toolbar, accessName, selectedRowKeys, handleOpenCreate, handleBatchDelete, toolBarRender, t]);

  // ===== 行选择配置 =====
  const rowSelectionConfig = useMemo(() => {
    if (!rowSelection) return undefined;
    return {
      selectedRowKeys,
      onChange: (keys: Key[], rows: T[]) => {
        setSelectedRowKeys(keys);
        setSelectedRows(rows);
      },
    };
  }, [rowSelection, selectedRowKeys]);

  // ===== 分页配置 =====
  const paginationConfig = useMemo(() => {
    if (pagination === false) return false;
    return {
      current: currentPage,
      pageSize,
      total,
      showTotal: (total: number) => t('xin-crud.total', { total }),
      ...pagination,
    };
  }, [pagination, currentPage, pageSize, total, t]);

  // ===== 表单标题 =====
  const formTitle = useMemo(() => {
    return formMode === 'create'
      ? (createTitle || t('xin-crud.createTitle'))
      : (editTitle || t('xin-crud.editTitle'));
  }, [formMode, createTitle, editTitle, t]);

  return (
    <div className="xin-crud">
      {/* 搜索区域 */}
      {search && searchColumns.length > 0 && (
        <Card className="mb-4">
          <XinSearch
            columns={searchColumns}
            formRef={searchFormRef}
            layout={searchLayout}
            grid={searchGrid}
            rowProps={searchRowProps}
            onSearch={handleSearch}
            submitter={searchSubmitter}
          />
        </Card>
      )}

      {/* 表格区域 */}
      <Card
        title={headerTitle}
        extra={toolbarContent}
        styles={{ body: { padding: 0 } }}
      >
        <Table<T>
          {...tableProps}
          columns={tableColumns}
          dataSource={dataSource}
          loading={propsLoading !== undefined ? propsLoading : loading}
          rowKey={rowKey as string}
          rowSelection={rowSelectionConfig}
          pagination={paginationConfig}
          onChange={handleTableChange}
        />
      </Card>

      {/* 表单弹窗 */}
      <XinForm<T>
        columns={formColumns}
        formRef={formFormRef}
        layoutType={formLayoutType}
        layout={formLayout}
        grid={formGrid}
        rowProps={formRowProps}
        onFinish={handleFormSubmit}
        submitter={formSubmitter}
        modalProps={{
          title: formTitle,
          ...modalProps,
        }}
        drawerProps={{
          title: formTitle,
          ...drawerProps,
        }}
      />
    </div>
  );
}

export default XinCrud;
export type { XinCrudProps, XinCrudRef, XinCrudColumn, FormMode };
