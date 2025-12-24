import {Button, Card, ConfigProvider, Space, Table} from "antd";
import type { XinTableV2Props, XinTableV2Ref } from "./typings";
import SearchForm, { type SearchFormProps, type SearchFormRef } from "./SearchForm";
import FormModel, { type FormModalProps, type FormModalRef } from "./FormModal";
import { useImperativeHandle, useMemo, useRef } from "react";
import type { FormColumn } from "./FormField";
import type { ColumnType, TableRef } from "antd/es/table";

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
    beforeOperateRender,
    afterOperateRender,
    toolBarRender = [],
    cardProps
  } = props;

  const formRef = useRef<FormModalRef<T>>(null);
  const searchRef = useRef<SearchFormRef<T>>(null);

  /* 搜索列 */
  const searchColumn: FormColumn<T>[] = useMemo(() => {
    if (search && search.columns) return search.columns;
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns, search]);

  /* 表单列 */
  const formColumn: FormColumn<T>[] = useMemo(() => {
    if (form && form.columns) return form.columns;
    return columns.filter((column) => column.hideInForm !== true);
  }, [columns, form]);

  // 暴露表单方法
  useImperativeHandle(tableRef, (): XinTableV2Ref => ({
    /** 刷新表格（保持当前页） */
    reload: () => {},
    /** 重置表格（回到第一页） */
    reset: () => {},
    /** 获取当前数据源 */
    getDataSource: () => [],
    /** 获取选中行的 keys */
    getSelectedRowKeys: () => [],
    /** 获取选中行数据 */
    getSelectedRows: () => [] as T[],
    /** 清空选中 */
    clearSelected: () => {},
    openFormModal: formRef.current?.open!,
    closeFormModal: formRef.current?.close!,
    isOpenFormModal: formRef.current?.isOpen!,
    setFormModalLoading: formRef.current?.setLoading!,
    setFormMode: formRef.current?.setFormMode!,
    formMode: formRef.current?.formMode!,
    collapseSearch: searchRef.current?.collapse!,
    isCollapseSearch: searchRef.current?.isCollapse!,
    setSearchLoading: searchRef.current?.setLoading!,
    form: () => formRef.current!,
    searchForm: () => searchRef.current!,
  }));

  /**
   * 处理搜索
   */
  const handleSearch: SearchFormProps<T>['onSearch'] = async (values: T) => {
    console.log(values);
  };

  return (
    <div>
      {/* 搜索表单 */}
      <Card {...cardProps} styles={{body: { padding: 0 }}}>
        <Space direction="vertical" size={16}>
          <div style={{padding: '0 16px', paddingTop: '16px'}}>
            <SearchForm<T>
              columns={searchColumn}
              onSearch={handleSearch}
              {...search}
            />
          </div>

          <Space style={{padding: '0 16px'}}>
            {addShow && <Button type="primary">新增</Button>}
            {deleteShow && <Button color="danger">批量删除</Button>}
            {toolBarRender.length > 0 && toolBarRender.map((item) => item)}
          </Space>
          <ConfigProvider
              theme={{
                components: {
                  Table: {
                    /* 这里是你的组件 token */
                    headerBorderRadius: 0
                  },
                },
              }}
          >
            <Table
                {...props} columns={columns as ColumnType<T>[]} rowKey={rowKey} pagination={{
              total: 300
            }} />
          </ConfigProvider>

        </Space>
      </Card>

      {/* 新增编辑表单 */}
      <FormModel 
        api={api}
        columns={formColumn} 
        {...form} 
      />
    </div>
  );
}