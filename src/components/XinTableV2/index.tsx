import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Space,
  Table,
  Tooltip,
  type TableProps,
  type TableColumnType,
} from "antd";
import type {XinTableV2Props, XinTableV2Ref} from "./typings";
import SearchForm from "./SearchForm";
import FormModel, {type FormModalRef} from "./FormModal";
import ToolBar from "./ToolBar";
import {TableProvider, useTableContext} from "./TableContext";
import {useImperativeHandle, useMemo, useRef, useState, useCallback} from "react";
import type {FormColumn} from "./FormField";
import {Delete, List} from "@/api/common/table.ts";
import {isArray, isEmpty, omit} from "lodash";
import type {SearchProps} from "antd/es/input";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";

interface SorterParams {
  field: string;
  order: 'asc' | 'desc';
}

/** 请求参数类型 */
interface RequestParams extends Record<string, any> {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  sorter?: SorterParams;
  keywordSearch?: string;
}

/** 表格内部组件 */
function XinTableV2Inner<T extends Record<string, any> = any>(props: XinTableV2Props<T>) {
  const {
    api,
    accessName,
    rowKey,
    columns,
    searchProps,
    formProps,
    cardProps,
    tableRef,
    addShow = true,
    editShow = true,
    deleteShow = true,
    operateShow = true,
    toolBarRender = [],
    toolBarLeft,
    operateProps,
    beforeOperateRender,
    afterOperateRender,
    pagination: customPagination = {},
    handleRequest: customHandleRequest,
    requestParams: customRequestParams,
  } = props;

  const {t} = useTranslation();
  const formRef = useRef<FormModalRef<T>>(undefined);
  const [searchRef] = Form.useForm<T>();
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [requestParams, setRequestParams] = useState<RequestParams>({});

  // 从 Context 获取状态
  const {
    density,
    bordered,
    columnSettings,
    loading,
    setLoading,
  } = useTableContext();

  // 暴露表单方法
  useImperativeHandle(tableRef, (): XinTableV2Ref => ({
    /** 刷新表格（保持当前页） */
    reload: () => handleRequest(requestParams),
    /** 重置表格（回到第一页） */
    reset: () => handleRequest({ page: 1 }),
    /** 获取当前数据源 */
    getDataSource: () => dataSource,
    /** 获取选中行的 keys */
    getSelectedRowKeys: () => [],
    /** 获取选中行数据 */
    getSelectedRows: () => [] as T[],
    /** 清空选中 */
    clearSelected: () => {},
    openFormModal: formRef.current?.open,
    closeFormModal: formRef.current?.close,
    isOpenFormModal: formRef.current?.isOpen,
    setFormModalLoading: formRef.current?.setLoading,
    setFormMode: formRef.current?.setFormMode,
    formMode: formRef.current?.formMode,
    form: () => formRef.current!,
    searchForm: () => searchRef,
  }));

  /** 表格请求 */
  const handleRequest = useCallback(async (params: RequestParams) => {
    try {
      setLoading(true);
      // 自定义参数处理
      const finalParams: RequestParams = customRequestParams ? customRequestParams(params) : params;
      // 自定义请求
      let listData: { data: T[]; total: number };
      if (customHandleRequest) {
        listData = await customHandleRequest(finalParams);
      } else {
        const { data } = await List<T>(api, finalParams);
        listData = data.data!;
      }
      setDataSource(listData.data);
      setTotal(listData.total);
    } finally {
      setLoading(false);
    }
  }, [api, customHandleRequest, customRequestParams, setLoading]);

  /** 初始请求 */
  useState(() => { handleRequest(requestParams) });

  /** 处理表格变化 */
  const handleTableChange: TableProps<T>['onChange'] = async (newPagination, newFilters, newSorter) => {
    const params: RequestParams = {
      ...requestParams,
      page: newPagination.current ?? requestParams.current,
      pageSize: newPagination.pageSize ?? requestParams.pageSize,
    };
    // 处理筛选
    if (!isEmpty(newFilters)) {
      params.filterValues = newFilters;
    }
    // 处理排序
    if (newSorter && !isArray(newSorter) && !isEmpty(newSorter) && newSorter.field) {
      params.sorterValue = {
        field: String(newSorter.field),
        order: newSorter.order === 'ascend' ? 'asc' : 'desc',
      };
    }
    setRequestParams(params);
    await handleRequest(params);
  };

  /** 快速搜索 */
  const handleKeywordSearch: SearchProps['onSearch'] = async (value: string) => {
    if (!value) {
      window.$message?.warning('请输入搜索内容');
      return;
    }
    const params: RequestParams = {
      ...requestParams,
      page: 1,
      keywordSearch: value,
    }
    setRequestParams(params);
    await handleRequest(params);
  };

  /** 快速搜索 Change */
  const keywordSearchChange: SearchProps['onChange'] = (e) => {
    if (!e.target.value) {
      const { keywordSearch, ...params } = requestParams;
      setRequestParams(params);
    } else {
      setRequestParams({
        ...requestParams,
        keywordSearch: e.target.value,
      });
    }
  };

  /** 搜索表单提交 */
  const handleSearch = async () => {
    const searchValues: T = searchRef.getFieldsValue();
    // 移除空值
    Object.keys(searchValues).forEach((key) => {
      if (searchValues[key] === '' || searchValues[key] === undefined) {
        delete searchValues[key];
      }
    });
    await handleRequest({
      page: 1,
      ...requestParams,
      ...searchValues,
    });
  };

  /** 搜索列 */
  const searchColumn: FormColumn<T>[] = useMemo(() => {
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns]);

  /** 表单列 */
  const formColumn: FormColumn<T>[] = useMemo(() => {
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns]);

  /** 表格操作列 */
  const operate = useMemo((): TableColumnType<T>[] => {
    if (!operateShow) return [];
    return [
      {
        title: '操作栏',
        key: 'operate',
        align: 'center',
        ...operateProps,
        render: (_, record) => (
          <Space>
            {beforeOperateRender?.(record)}
            {(typeof editShow === 'function' ? editShow(record) : editShow) &&
              <Tooltip title={'编辑'}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size={'small'}
                  onClick={() => handleUpdate(record)}
                />
              </Tooltip>
            }
            {(typeof deleteShow === 'function' ? deleteShow(record) : deleteShow) !== false &&
              <Tooltip title={'删除'}>
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  size={'small'}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            }
            {afterOperateRender?.(record)}
          </Space>
        ),
      },
    ];
  }, [operateShow, operateProps, editShow, deleteShow, beforeOperateRender, afterOperateRender]);

  /** 表格列 */
  const tableColumns: TableColumnType<T>[] = useMemo(() => {
    const columnsList: TableColumnType<T>[] = columns
      .filter((column) => column.hideInTable !== true)
      .filter((column) => {
        // 根据列设置过滤
        const setting = columnSettings.find(
          (s) => s.key === String(column.dataIndex || column.key || '')
        );
        return setting ? setting.visible : true;
      })
      .map(column => {
        return omit(column, ['hideInTable', 'hideInForm', 'hideInSearch', 'search']);
      });
    return [
      ...columnsList,
      ...operate
    ]
  }, [columns, columnSettings, operate]);

  /** 新增按钮点击 */
  const handleCreate = () => {
    formRef.current?.open();
    formRef.current?.setFormMode('create');
  }

  /** 修改按钮点击 */
  const handleUpdate = (record: T) => {
    formRef.current?.open();
    formRef.current?.setFormMode('update', record, rowKey);
  }

  /** 删除记录 */
  const handleDelete = async (record: T) => {
    window.$modal?.confirm({
      title: `你是否要删除 ${record[rowKey]} 记录？`,
      okText: '确认删除',
      cancelText: '取消删除',
      onOk: async () => {
        await Delete(api + `/${record[rowKey]}`);
        window.$message?.success('删除成功');
        await handleRequest(requestParams);
      }
    })
  };

  return (
    <div>
      <Card style={{marginBottom: 20}}>
        {/* 搜索表单 */}
        <SearchForm<T>
          form={searchRef}
          columns={searchColumn}
          handleSearch={handleSearch}
          {...searchProps}
        />
      </Card>
      <Card {...cardProps}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            {/* 工具栏 */}
            <Flex justify={'space-between'}>
              <ToolBar
                renderLeft={toolBarLeft}
                extraRender={[
                  /* 快速搜索 */
                  <Input.Search
                    key="search"
                    onChange={keywordSearchChange}
                    placeholder="请输入关键字"
                    style={{ width: 200 }}
                    value={requestParams.keywordSearch}
                    onSearch={handleKeywordSearch}
                  />,
                  deleteShow && <Button key="batch-delete" color="danger">批量删除</Button>,
                  addShow && <Button key="add" type="primary" onClick={handleCreate}>新增</Button>,
                  ...toolBarRender,
                ].filter(Boolean)}
              />
            </Flex>
          </div>
          <Table
            {...props}
            loading={loading}
            dataSource={dataSource}
            columns={tableColumns}
            rowKey={rowKey}
            onChange={handleTableChange}
            size={density}
            bordered={bordered}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              ...customPagination,
              pageSize: requestParams.pageSize,
              current: requestParams.page,
              total,
            }}
          />
        </Space>
      </Card>

      {/* 新增编辑表单 */}
      <FormModel 
        api={api}
        columns={formColumn}
        formRef={formRef}
        {...formProps}
      />
    </div>
  );
}

/** 表格组件入口 */
export default function XinTableV2<T extends Record<string, any> = any>(props: XinTableV2Props<T>) {
  const { columns, toolBarOptions } = props;

  // 刷新回调 - 需要通过 ref 获取内部组件的 reload 方法
  const handleReload = useCallback(() => {
    // 这里通过 tableRef 调用
    props.tableRef?.current?.reload();
  }, [props.tableRef]);

  return (
    <TableProvider
      columns={columns}
      toolBarOptions={toolBarOptions}
      onReload={handleReload}
    >
      <XinTableV2Inner {...props} />
    </TableProvider>
  );
}
