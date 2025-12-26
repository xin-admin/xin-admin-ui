import {Button, Card, ConfigProvider, Space, Table, Form, Flex} from "antd";
import type { XinTableV2Props, XinTableV2Ref } from "./typings";
import SearchForm, { type SearchFormProps } from "./SearchForm";
import FormModel, { type FormModalRef } from "./FormModal";
import { useImperativeHandle, useMemo, useRef, useState } from "react";
import type { FormColumn } from "./FormField";
import type { ColumnType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";

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
  const [searchRef] = Form.useForm();
  const [collapse, setCollapse] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<T[]>([]);

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
    form: () => formRef.current,
    searchForm: () => searchRef,
  }));

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

  /**
   * 处理搜索
   */
  const handleSearch: SearchFormProps<T>['handleSearch'] = async (values: T) => {
    console.log(values);
  };

  return (
    <div>
      <Card {...cardProps}>
        <Space direction="vertical" size={16}>
          <div>
            {/* 搜索表单 */}
            { collapse && (
              <SearchForm<T>
                columns={searchColumn}
                handleSearch={handleSearch}
                {...search}
              />
            )}
            {/* 操作栏 */}
            <Flex justify={'space-between'}>
              <Space>
                {addShow && <Button type="primary">新增</Button>}
                {deleteShow && <Button color="danger">批量删除</Button>}
                {toolBarRender.length > 0 && toolBarRender.map((item) => item)}
              </Space>
              <Space>
                <Button 
                  onClick={() => setCollapse(!collapse)}
                  type={collapse ? 'default' : 'primary'}
                  icon={<SearchOutlined />}
                  children={collapse ? '收起' : '展开'}
                />
              </Space>
            </Flex>
          </div>
          <Table
            {...props}
            dataSource={dataSource}
            columns={columns as ColumnType<T>[]} 
            rowKey={rowKey} 
            pagination={{
              total: 300
            }} 
          />
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