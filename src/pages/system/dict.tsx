import XinTableV2 from '@/components/XinTableV2';
import { Button, Col, Empty, message, Row } from 'antd';
import type { IDict } from '@/domain/iDict';
import type { IDictItem } from '@/domain/iDictItem';
import type { XinTableColumn } from '@/components/XinTableV2/typings';
import { useState } from 'react';
import { Create, Update } from '@/api/common/table';
import { useTranslation } from 'react-i18next';
import type { XinFormRef } from '@/components/XinForm';
import type { FormMode } from '@/components/XinTableV2/typings';

/** 字典管理 */
export default () => {
  const { t } = useTranslation();

  // 字典
  const columns: XinTableColumn<IDict>[] = [
    { 
      title: t('dict.id'), 
      dataIndex: 'id',
      hideInForm: true, 
      sorter: true 
    },
    { 
      title: t('dict.name'),
      dataIndex: 'name', 
      valueType: 'text', 
      colProps: { span: 8 },
      rules: [{ required: true, message: t('dict.name.required') }],
    },
    {
      title: t('dict.code'), 
      dataIndex: 'code', 
      valueType: 'text', 
      colProps: { span: 8 },
      rules: [{ required: true, message: t('dict.code.required') }],
    },
    {
      title: t('dict.type'), 
      dataIndex: 'type', 
      valueType: 'select', 
      filters: [
        { text: t('dict.type.default'), value: 'default' },
        { text: t('dict.type.badge'), value: 'badge' },
        { text: t('dict.type.tag'), value: 'tag' },
      ], 
      colProps: { span: 8 },
      rules: [{ required: true, message: t('dict.type.required') }],
      fieldProps: {
        options: [
          { label: t('dict.type.default'), value: 'default' },
          { label: t('dict.type.badge'), value: 'badge' },
          { label: t('dict.type.tag'), value: 'tag' },
        ],
      },
      render: (value: string) => {
        const map: Record<string, string> = {
          default: t('dict.type.default'),
          badge: t('dict.type.badge'),
          tag: t('dict.type.tag'),
        };
        return map[value] || value;
      }
    },
    { 
      title: t('dict.describe'), 
      dataIndex: 'describe', 
      valueType: 'textarea', 
      colProps: { span: 24 }, 
      hideInSearch: true 
    },
    { 
      title: t('dict.createdAt'), 
      dataIndex: 'created_at', 
      valueType: 'date', 
      hideInForm: true,
      hideInSearch: true,
    },
    { 
      title: t('dict.updatedAt'), 
      dataIndex: 'updated_at', 
      valueType: 'date', 
      hideInForm: true,
      hideInSearch: true,
    },
  ];

  // 字典项
  const itemColumns: XinTableColumn<IDictItem>[] = [
    { 
      title: t('dictItem.id'), 
      dataIndex: 'id', 
      hideInForm: true, 
      hideInTable: true 
    },
    { 
      title: t('dictItem.label'), 
      dataIndex: 'label', 
      valueType: 'text', 
      rules: [{ required: true, message: t('dictItem.label.required') }],
    },
    { 
      title: t('dictItem.value'), 
      dataIndex: 'value', 
      valueType: 'text', 
      rules: [{ required: true, message: t('dictItem.value.required') }],
    },
    {
      title: t('dictItem.status'), 
      dataIndex: 'status', 
      valueType: 'select',
      rules: [{ required: true, message: t('dictItem.status.required') }],
      fieldProps: {
        options: [
          { label: t('dictItem.status.success'), value: 'success' },
          { label: t('dictItem.status.error'), value: 'error' },
          { label: t('dictItem.status.default'), value: 'default' },
          { label: t('dictItem.status.processing'), value: 'processing' },
          { label: t('dictItem.status.warning'), value: 'warning' },
        ],
      },
      render: (value: string) => {
        const map: Record<string, string> = {
          success: t('dictItem.status.success'),
          error: t('dictItem.status.error'),
          default: t('dictItem.status.default'),
          processing: t('dictItem.status.processing'),
          warning: t('dictItem.status.warning'),
        };
        return map[value] || value;
      }
    },
    { 
      title: t('dictItem.switch'), 
      dataIndex: 'switch', 
      valueType: 'switch', 
      rules: [{ required: true, message: t('dictItem.switch.required') }],
    },
    { 
      title: t('dictItem.createTime'), 
      dataIndex: 'create_time', 
      valueType: 'date', 
      hideInForm: true, 
      hideInTable: true,
      hideInSearch: true,
    },
    { 
      title: t('dictItem.updateTime'), 
      dataIndex: 'update_time', 
      valueType: 'date', 
      hideInForm: true, 
      hideInTable: true,
      hideInSearch: true,
    },
  ];

  const [selectedRows, setSelectedRows] = useState<IDict>();

  // 处理字典项表单提交
  const handleAddItem = async (
    values: IDictItem, 
    mode?: FormMode, 
    formRef?: React.RefObject<XinFormRef<IDictItem> | undefined>,
    defaultValues?: IDictItem
  ): Promise<boolean> => {
    if (!selectedRows) {
      message.warning(t('dict.selectWarning'));
      return false;
    }
    if (mode === 'update' && defaultValues) {
      let data = { ...defaultValues, ...values };
      await Update('/sys/dict/item/' + defaultValues.id, data);
      message.success(t('dict.editSuccess'));
      return true;
    } else {
      let data = { ...values, dict_id: selectedRows.id };
      await Create('/sys/dict/item', data);
      message.success(t('dict.addSuccess'));
      return true;
    }
  };

  return (
    <Row gutter={20}>
      <Col span={14}>
        <XinTableV2<IDict>
          api={'/sys/dict/list'}
          columns={columns}
          rowKey={'id'}
          accessName={'system.dict.list'}
          searchProps={false}
          formProps={{
            grid: true,
            colProps: { span: 12 },
          }}
          toolBarRender={[
            <Button type="primary" key={'ref'} onClick={() => {}}>{t('dict.refreshCache')}</Button>,
          ]}
          pagination={{}}
        />
      </Col>
      <Col span={10}>
        {selectedRows ? (
          <XinTableV2<IDictItem>
            api={'/sys/dict/item'}
            columns={itemColumns}
            rowKey={'id'}
            titleRender={<span>{`${t('dict.itemManagement')}（${selectedRows?.name}）`}</span>}
            accessName={'system.dict.item'}
            searchProps={false}
            formProps={{ 
              grid: true, 
              colProps: { span: 12 },
              onFinish: handleAddItem,
            }}
            requestParams={(params) => ({
              ...params,
              dict_id: selectedRows.id,
            })}
            pagination={{pageSize: 10}}
          />
        ) : (
          <Empty description={t('dict.selectDict')} />
        )}
      </Col>
    </Row>
  );
}
