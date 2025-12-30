import {
  Button,
  Tree,
  Card,
  Flex,
  Form,
  Input,
  Space,
  Table,
  Tooltip,
  Popover,
  Dropdown,
  Typography,
  type TableProps,
  type TableColumnType,
  type TreeProps,
} from "antd";
import type {XinTableV2Props, XinTableV2Ref, RequestParams} from "./typings";
import SearchForm from "./SearchForm";
import FormModel, {type FormModalRef} from "./FormModal";
import {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import type {FormColumn} from "./FormField";
import {Delete, List} from "@/api/common/table.ts";
import {isArray, isEmpty, omit} from "lodash";
import type {SearchProps} from "antd/es/input";
import {
  BorderlessTableOutlined,
  BorderOutlined,
  ColumnHeightOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined, SettingOutlined
} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import type {DataNode} from "antd/es/tree";

// 默认分页大小
const DEFAULT_PAGE_SIZE: number = 10;
// 默认页数
const DEFAULT_PAGE: number = 1;

export default function XinTableV2<T extends Record<string, any> = any>(props: XinTableV2Props<T>) {
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
    titleRender,
    toolBarRender = [],
    operateProps,
    beforeOperateRender,
    afterOperateRender,
    pagination: customPagination = {},
    handleRequest: customHandleRequest,
    requestParams: customRequestParams,
  } = props;

  const {t} = useTranslation();
  const formRef = useRef<FormModalRef<T>>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchRef] = Form.useForm<T>();
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [requestParams, setRequestParams] = useState<RequestParams>({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [density, setDensity] = useState<TableProps['size']>();
  const [bordered, setBordered] = useState<boolean>();
  const [columnsChecked, setColumnsChecked] = useState<any[]>([]);
  const [columnSorted, setColumnSorted] = useState<any[]>([]);

  // 暴露表单方法
  useImperativeHandle(tableRef, (): XinTableV2Ref => ({
    /** 刷新表格（保持当前页） */
    reload: () => {},
    /** 重置表格（回到第一页） */
    reset: () => {},
    /** 获取当前数据源 */
    getDataSource: () => dataSource,
    /** 获取选中行的 keys */
    getSelectedRowKeys: () => [],
    /** 获取选中行数据 */
    getSelectedRows: () => [] as T[],
    /** 清空选中 */
    clearSelected: () => {},

    form: () => formRef.current!,
    searchForm: () => searchRef,
  }));

  /** 表格请求 */
  const handleRequest = async (params?: RequestParams) => {
    try {
      setLoading(true);
      const defaultParams: RequestParams = Object.assign({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      }, params)
      // 自定义参数处理
      const requestParams: RequestParams = customRequestParams ? customRequestParams(defaultParams) : defaultParams;
      // 自定义请求
      let listData: { data: T[]; total: number };
      if (customHandleRequest) {
        listData = await customHandleRequest(requestParams);
      } else {
        const { data } = await List<T>(api, requestParams);
        listData = data.data!;
      }
      setDataSource(listData.data);
      setTotal(listData.total);
    } finally {
      setLoading(false);
    }
  };

  /** 初始化 */
  useEffect(() => { handleRequest() }, []);

  /** 处理表格变化 */
  const handleTableChange: TableProps<T>['onChange'] = async (newPagination, newFilters, newSorter) => {
    console.log(newPagination, newFilters, newSorter)
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
    if (newSorter && !isArray(newSorter) && !isEmpty(newSorter) && !newSorter.field) {
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
    if( !value ) {
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
    if( !e.target.value ) {
      const { keywordSearch, ...params } = requestParams;
      setRequestParams(params);
      console.log('keywordSearch: ' + keywordSearch);
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
    // 移除 空值
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

  /** 默认表格列 */
  const defaultTableColumns: TableColumnType[] = useMemo(() => {
    const list: TableColumnType[] = columns
      .filter((column) => column.hideInTable !== true && column.dataIndex)
      .map(column => {
        return omit(column, ['hideInTable', 'hideInForm', 'hideInSearch', 'search']);
      });
    setColumnsChecked(list.map(item => item.dataIndex!));
    return list;
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
  }, [columns, operateShow]);

  /** 最终表格列，计算排序以及显示状态 */
  const tableColumns: TableColumnType<T>[] = useMemo(() => {
    // 需要新增根据 columnSorted 的顺序排序
    return [
      ...defaultTableColumns.filter(column => columnsChecked.includes(column.dataIndex as any)),
      ...operate
    ];
  }, [defaultTableColumns, columnsChecked, columnSorted]);

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

  /** 批量删除 */
  // const handleBatchDelete = async () => {
  //   if (!selectedRowKeys.length) return message.warning(t('sysFile.noSelected'));
  //   window.$modal?.confirm({
  //     title: t('sysFile.confirmBatchDelete', { count: selectedRowKeys.length }),
  //     okText: t('sysFile.ok'),
  //     cancelText: t('sysFile.cancel'),
  //     onOk: async () => {
  //       await batchDeleteFiles(selectedRowKeys as number[]);
  //       message.success(t('sysFile.batchDeleteSuccess'));
  //       await loadFiles();
  //     }
  //   });
  // };

  /** 密度设置菜单 */
  const densityMenu = {
    items: [
      {
        key: 'large',
        label: '默认',
        onClick: () => setDensity('large'),
      },
      {
        key: 'middle',
        label: '适中',
        onClick: () => setDensity('middle'),
      },
      {
        key: 'small',
        label: '紧凑',
        onClick: () => setDensity('small'),
      },
    ],
    selectedKeys: [density || 'large'],
  };

  // 处理拖拽排序
  const handleDrop: TreeProps['onDrop'] = useCallback((info: any) => {
    // 需要新增根据 变化处理 columnSorted
    console.log(info)
  }, []);

  /** 列设置树数据 */
  const columnTreeData: DataNode[] = useMemo(() => {
    return columns.filter(item => item.hideInTable !== false && item.dataIndex).map((item) => ({
      key: item.dataIndex!,
      title: item.title,
    }));
  }, [columns]);

  /** 列设置选中改变 */
  const columnSettingCheck: TreeProps['onCheck'] = (keys) => {
    if(isArray( keys)) {
      setColumnsChecked(keys);
    }
  }

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
        <div style={{ marginBottom: 20 }}>
          {/* 操作栏 */}
          <Flex justify={'space-between'}>
            <Flex align={'center'}>
              {titleRender || <Typography.Title level={5}>查询表格</Typography.Title>}
            </Flex>
            <Space>
              {/* 快速搜索 */}
              <Input.Search
                onChange={keywordSearchChange}
                placeholder="请输入关键字"
                style={{ width: 200 }}
                value={requestParams.keywordSearch}
                onSearch={handleKeywordSearch}
              />
              {toolBarRender.length > 0 && toolBarRender.map((item) => item)}
              {deleteShow && <Button color="danger">批量删除</Button>}
              {addShow && <Button type="primary" onClick={handleCreate}>新增</Button>}
              <Space size={1}>
                {/* 刷新表格 */}
                <Tooltip title="刷新">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={() => handleRequest()}
                  />
                </Tooltip>
                {/* 密度设置 */}
                <Dropdown menu={densityMenu} trigger={['click']}>
                  <Button type="text" icon={<ColumnHeightOutlined />} />
                </Dropdown>
                {/* 边框设置 */}
                <Tooltip title={bordered ? '隐藏边框' : '显示边框'}>
                  <Button
                    type="text"
                    icon={bordered ? <BorderOutlined /> : <BorderlessTableOutlined />}
                    onClick={() => setBordered(!bordered)}
                  />
                </Tooltip>
                {/* 列设置 */}
                <Popover
                  content={(
                    <Tree
                      draggable
                      blockNode
                      checkable={true}
                      treeData={columnTreeData}
                      selectable={false}
                      onDrop={handleDrop}
                      checkedKeys={columnsChecked}
                      onCheck={columnSettingCheck}
                    />
                  )}
                  trigger="click"
                  placement="bottomRight"
                  title="列设置"
                >
                  <Tooltip title="列设置">
                    <Button type="text" icon={<SettingOutlined />} />
                  </Tooltip>
                </Popover>
              </Space>
            </Space>
          </Flex>
        </div>
        <Table
          loading={loading}
          dataSource={dataSource}
          size={density}
          bordered={bordered}
          {...props}
          columns={tableColumns}
          rowKey={rowKey}
          onChange={handleTableChange}
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