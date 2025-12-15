import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Modal, Tag, Select } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProTableProps, ProColumns } from '@ant-design/pro-components';
import type ISysUser from '@/domain/iSysUser';
import { List } from '@/api/common/table';
import { useTranslation } from 'react-i18next';

/**
 * 用户选择器组件属性
 */
export interface UserSelectorProps {
  value?: number | number[] | ISysUser | ISysUser[] | null;
  onChange?: (value: number | number[] | null) => void;
  mode?: 'single' | 'multiple';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  showDept?: boolean;
  maxTagCount?: number;
}

/**
 * 用户选择器组件
 */
const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  mode = 'single',
  placeholder,
  disabled = false,
  readonly = false,
  showDept = true,
  maxTagCount = 2,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ISysUser[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  /** 表格查询参数 */
  const [tableParams, setParams] = useState<{ keywordSearch: string }>();

  // 从 value 加载用户信息
  useEffect(() => {
    if (!value) {
      setSelectedUsers([]);
      setSelectedRowKeys([]);
      return;
    }

    const valueArray = Array.isArray(value) ? value : [value];
    
    // 如果是用户对象，直接使用
    if (typeof valueArray[0] === 'object') {
      setSelectedUsers(valueArray as ISysUser[]);
      setSelectedRowKeys(valueArray.map((u: any) => u.id));
      return;
    }

    // 从 API 加载用户信息
    setLoading(true);
    Promise.all(valueArray.map(id => List<ISysUser>('/sys-user/list', { id: id as number })))
      .then(results => {
        const users = results.map(res => res.data.data?.data?.[0]).filter(Boolean) as ISysUser[];
        setSelectedUsers(users);
        setSelectedRowKeys(users.map(u => u.id!));
      })
      .catch(error => console.error('Failed to load users:', error))
      .finally(() => setLoading(false));
  }, [value]);

  // 表格列配置
  const columns: ProColumns<ISysUser>[] = useMemo(() => [
    {
      title: t('sysUserList.id'),
      dataIndex: 'id',
      width: 80,
      align: 'center',
      search: false,
    },
    {
      title: t('sysUserList.username'),
      dataIndex: 'username',
      width: 120,
      align: 'center',
    },
    {
      title: t('sysUserList.nickname'),
      dataIndex: 'nickname',
      width: 120,
      align: 'center',
      search: false,
    },
    {
      title: t('sysUserList.mobile'),
      dataIndex: 'mobile',
      width: 130,
      align: 'center',
      search: false,
    },
    ...(showDept ? [{
      title: t('sysUserList.dept'),
      dataIndex: 'dept_name',
      width: 120,
      align: 'center' as const,
      search: false,
      render: (text: any) => text ? <Tag color="volcano">{text}</Tag> : '-',
    }] : []),
    {
      title: t('sysUserList.status'),
      dataIndex: 'status',
      width: 100,
      align: 'center',
      valueEnum: {
        0: { text: t('sysUserList.status.0'), status: 'Error' },
        1: { text: t('sysUserList.status.1'), status: 'Success' },
      },
      search: false,
    },
  ], [t, showDept]);

  // 处理选择确认
  const handleSelect = useCallback(() => {
    onChange?.(mode === 'single' ? (selectedUsers[0]?.id || null) : selectedUsers.map(u => u.id!));
    setOpen(false);
  }, [mode, selectedUsers, onChange]);

  // 处理行选择
  const handleRowSelectionChange = useCallback((keys: React.Key[], rows: ISysUser[]) => {
    if (mode === 'single' && keys.length > 1) {
      const lastKey = keys[keys.length - 1];
      const lastRow = rows.find(r => r.id === lastKey)!;
      setSelectedRowKeys([lastKey]);
      setSelectedUsers([lastRow]);
    } else {
      setSelectedRowKeys(keys);
      setSelectedUsers(rows);
    }
  }, [mode]);

  // ProTable 配置
  const proTableProps: ProTableProps<ISysUser, any> = useMemo(() => ({
    columns,
    rowKey: 'id',
    params: tableParams,
    cardProps: { bodyStyle: { padding: 0 } },
    rowSelection: {
      type: mode === 'single' ? 'radio' : 'checkbox',
      selectedRowKeys,
      onChange: handleRowSelectionChange,
      preserveSelectedRowKeys: true,
    },
    toolbar: {
      search: {
        placeholder: t("sysUserList.searchPlaceholder"),
        style: {width: 304},
        onSearch: (value: string) => {
          setParams({keywordSearch: value});
        },
      },
      settings: [],
    },
    request: async (params: any) => {
      try {
        const api = '/sys-user/list';
        const response = await List<ISysUser>(api, params);
        return {
          data: response.data.data?.data || [],
          total: response.data.data?.total || 0,
          success: true,
        };
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return { data: [], total: 0, success: false };
      }
    },
    search: false,
    pagination: { defaultPageSize: 10, showSizeChanger: true, showQuickJumper: true },
    bordered: true,
    size: 'small',
    scroll: { x: 800 },
  }), [columns, mode, selectedRowKeys, handleRowSelectionChange, t, tableParams]);

  // 处理 Select 的 onChange
  const handleSelectChange = useCallback((selectedValue: number | number[]) => {
    if (mode === 'single') {
      const user = selectedUsers.find(u => u.id === selectedValue);
      if (!user && selectedValue) {
        // 如果选中的用户不在列表中，需要从 API 加载
        List<ISysUser>('/sys-user/list', { id: selectedValue as number })
          .then(res => {
            const loadedUser = res.data.data?.data?.[0];
            if (loadedUser) {
              setSelectedUsers([loadedUser]);
              setSelectedRowKeys([loadedUser.id!]);
            }
          })
          .catch(error => console.error('Failed to load user:', error));
      }
      onChange?.(selectedValue as number || null);
    } else {
      onChange?.(selectedValue as number[]);
    }
  }, [mode, selectedUsers, onChange]);

  // 生成 Select 的 options
  const selectOptions = useMemo(() => {
    return selectedUsers.map(user => ({
      label: user.nickname || user.username,
      value: user.id!,
    }));
  }, [selectedUsers]);

  return (
    <>
      <Select
        mode={mode === 'multiple' ? 'multiple' : undefined}
        value={mode === 'single' 
          ? (selectedUsers[0]?.id || undefined) 
          : selectedUsers.map(u => u.id!)
        }
        onChange={handleSelectChange}
        placeholder={placeholder || t('xinForm.userSelector.placeholder')}
        disabled={disabled}
        loading={loading}
        maxTagCount={maxTagCount}
        open={false}
        onClick={() => !disabled && !readonly && setOpen(true)}
        options={selectOptions}
        style={{ width: '100%' }}
        allowClear
        onClear={() => {
          setSelectedUsers([]);
          setSelectedRowKeys([]);
          onChange?.(mode === 'single' ? null : []);
        }}
      />

      <Modal
        title={t('xinForm.userSelector.modal.title')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSelect}
        width={1000}
        okText={t('xinForm.userSelector.modal.okText')}
        cancelText={t('xinForm.userSelector.modal.cancelText')}
      >
        <ProTable {...proTableProps} />
      </Modal>
    </>
  );
};

export default UserSelector;
