import {
  Button, Card, ConfigProvider, Space, Table, Form, Flex, type PaginationProps, type TableProps,
  type TablePaginationConfig, type GetProp,
  Typography
} from "antd";
import type { XinTableV2Props, XinTableV2Ref } from "./typings";
import SearchForm from "./SearchForm";
import FormModel, { type FormModalRef } from "./FormModal";
import {useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import type { FormColumn } from "./FormField";
import type { ColumnType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import {List} from "@/api/common/table.ts";
import {isArray, isEmpty, isObject} from "lodash";

export default function XinTableV2<T extends Record<string, any> = any>(props: XinTableV2Props<T>) {
  const {
    api,
    accessName,
    rowKey,
    columns,
    search,
    form,
    tableRef,
    addShow = true,
    editShow = true,
    deleteShow = true,
    operateShow = true,
    titleRender,
    toolBarRender = [],
    beforeOperateRender,
    afterOperateRender,
    handleRequest: customHandleRequest,
    requestParams: customRequestParams,
    cardProps
  } = props;

  const formRef = useRef<FormModalRef<T>>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchRef] = Form.useForm<T>();
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [keywordSearch, setKeywordSearch] = useState();
  // 分页
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1
  });
  // 排序
  const [sorter, setSorter] = useState<{ field: string; order: 'asc' | 'desc'; }>();
  // 筛选
  const [filters, setFilters] = useState<Record<string, any>>();

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
    openFormModal: formRef.current?.open,
    closeFormModal: formRef.current?.close,
    isOpenFormModal: formRef.current?.isOpen,
    setFormModalLoading: formRef.current?.setLoading,
    setFormMode: formRef.current?.setFormMode,
    formMode: formRef.current?.formMode,
    form: () => formRef.current!,
    searchForm: () => searchRef,
  }));

  /** 搜索列 */
  const searchColumn: FormColumn<T>[] = useMemo(() => {
    if (search && search.columns) return search.columns;
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns, search]);

  /** 表单列 */
  const formColumn: FormColumn<T>[] = useMemo(() => {
    if (form && form.columns) return form.columns;
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns, form]);

  /** 表格请求 */
  const handleRequest = async (page, pageSize, searchParams,  filters, sorter, keywordSearch) => {
    try {
      setLoading(true);
      const searchValues = searchRef.getFieldsValue();
      // 合并查询参数
      let params: any = {
        keywordSearch,
        ...searchValues,
        filter: filters,
        sorter: sorter,
        page: pagination.current,
        pageSize: pagination.pageSize
      };
      // 去除未定义的参数
      Object.keys(params).forEach((key) => {
        if (isObject(params[key]) && isEmpty(params[key])) delete params[key];
        if (params[key] === undefined) delete params[key];
        if (params[key] === '') delete params[key];
      });
      params = customRequestParams ? customRequestParams(params) : params;
      let listData: { data: T[], total: number };
      if(customHandleRequest) {
        listData = await customHandleRequest(params);
      } else {
        const { data } = await List<T>(api, params);
        listData = data.data!;
      }
      setDataSource(listData.data);
      setPagination({
        ...pagination,
        total: listData.total,
      });
    } finally {
      setLoading(false);
    }
  }

  /** 初始请求 */
  useEffect(() => { handleRequest(); }, []);

  /** 处理表格变化 */
  const handleTableChange: TableProps<T>['onChange'] = (newPagination , filters, sorter) => {
    if (!isEmpty(filters)) {
      setFilters(filters);
    } else {
      setFilters(undefined);
    }
    if (!isArray(sorter) && !isEmpty(sorter.field)) {
      setSorter({
        field: String(sorter.field),
        order: sorter.order === 'ascend' ? 'asc' : 'desc'
      });
    } else {
      setSorter(undefined);
    }
    if (
      pagination.current !== newPagination.current
      || pagination.pageSize !== newPagination.pageSize
    ) {
      setPagination({
        total: pagination.total,
        pageSize: newPagination.pageSize || pagination.pageSize,
        current: newPagination.current || pagination.current
      })
    }
    handleRequest();
  };

  const createClick = () => {
    formRef.current?.open();
    formRef.current?.setFieldsValue({});
    formRef.current?.setFormMode('create');
  }
  const editClick = (record: T) => {
    formRef.current?.open();
    formRef.current?.setFieldsValue(record);
    formRef.current?.setFormMode('update');
  }

  return (
    <div>
      <Card style={{marginBottom: 20}}>
        {/* 搜索表单 */}
        <SearchForm<T>
          form={searchRef}
          columns={searchColumn}
          handleSearch={handleRequest}
          {...search}
        />
      </Card>
      <Card {...cardProps}>
        <Space direction="vertical" size={20}>
          <div>
            {/* 操作栏 */}
            <Flex justify={'space-between'}>
              <Flex align={'center'}>
                {titleRender || <Typography.Title level={5}>查询表格</Typography.Title>}
              </Flex>
              <Space>
                {toolBarRender.length > 0 && toolBarRender.map((item) => item)}
                {deleteShow && <Button color="danger">批量删除</Button>}
                {addShow && <Button type="primary" onClick={createClick}>新增</Button>}
              </Space>
            </Flex>
          </div>
          <Table
            {...props}
            loading={loading}
            dataSource={dataSource}
            columns={columns as ColumnType<T>[]} 
            rowKey={rowKey}
            onChange={handleTableChange}
            pagination={{
              ...pagination
            }}
          />
        </Space>
      </Card>

      {/* 新增编辑表单 */}
      <FormModel 
        api={api}
        columns={formColumn}
        formRef={formRef}
        {...form} 
      />
    </div>
  );
}