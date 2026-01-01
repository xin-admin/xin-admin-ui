import {Avatar, Button, Form, Input, message, Modal, Tag, Tooltip} from 'antd';
import React, {useEffect, useState} from 'react';
import XinTableV2 from '@/components/XinTableV2';
import type {XinTableColumn} from "@/components/XinTableV2/typings";
import type ISysUser from "@/domain/iSysUser.ts";
import AuthButton from "@/components/AuthButton";
import type {DeptFieldType, ResetPasswordType, RoleFieldType} from "@/api/sys/sysUserList";
import {deptField, resetPassword, roleField} from "@/api/sys/sysUserList";
import {RedoOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Table: React.FC = () => {
  const {t} = useTranslation();
  /** 角色选项数据 */
  const [roles, setRoles] = useState<RoleFieldType[]>([]);
  /** 部门选项数据 */
  const [depts, setDepts] = useState<DeptFieldType[]>([]);

  /** 高级表格列配置 */
  const columns: XinTableColumn<ISysUser>[] = [
    {
      title: t("sysUserList.id"),
      dataIndex: 'id',
      hideInForm: true,
      sorter: true,
      align: 'center',
    },
    {
      title: t("sysUserList.username"),
      dataIndex: 'username',
      valueType: 'text',
      align: 'center',
      required: true,
      rules: [{required: true, message: t("sysUserList.username.required")}],
    },
    {
      title: t("sysUserList.nickname"),
      dataIndex: 'nickname',
      valueType: 'text',
      colProps: {md: 7},
      align: 'center',
      required: true,
      rules: [{required: true, message: t("sysUserList.nickname.required")}],
    },
    {
      title: t("sysUserList.sex"),
      dataIndex: 'sex',
      valueType: 'radio',
      filters: [
        { text: t("sysUserList.sex.0"), value: 0 },
        { text: t("sysUserList.sex.1"), value: 1 },
      ],
      align: 'center',
      hideInSearch: true,
      fieldProps: {
        options: [
          { value: 0, label: t("sysUserList.sex.0") },
          { value: 1, label: t("sysUserList.sex.1") },
        ]
      },
      render: (value: number) => {
        return value === 0 ? t("sysUserList.sex.0") : t("sysUserList.sex.1");
      }
    },
    {
      title: t("sysUserList.email"),
      dataIndex: 'email',
      valueType: 'text',
      colProps: {md: 6},
      align: 'center',
      required: true,
      rules: [{required: true, message: t("sysUserList.email.required")}],
    },
    {
      title: t("sysUserList.role"),
      dataIndex: 'role_id',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      required: true,
      rules: [{required: true, message: t("sysUserList.role.required")}],
      render: (value: any) => <Tag color={'magenta'}>{value}</Tag>,
      fieldProps: {
        mode: 'multiple',
        options: roles.map(r => ({ label: r.name, value: r.role_id })),
      },
    },
    {
      title: t("sysUserList.dept"),
      dataIndex: 'dept_id',
      valueType: 'treeSelect',
      align: 'center',
      required: true,
      rules: [{required: true, message: t("sysUserList.dept.required")}],
      render: (value: any) => <Tag color={'volcano'}>{value}</Tag>,
      fieldProps: {
        treeData: depts,
        fieldNames: {label: 'name', value: 'dept_id'}
      }
    },
    {
      title: t("sysUserList.status"),
      dataIndex: 'status',
      valueType: 'radioButton',
      fieldProps: {
        options: [
          { value: 0, label: t("sysUserList.status.0") },
          { value: 1, label: t("sysUserList.status.1") },
        ]
      },
      render: (value: number) => {
        return value === 1 
          ? <Tag color="success">{t("sysUserList.status.1")}</Tag>
          : <Tag color="error">{t("sysUserList.status.0")}</Tag>;
      },
      required: true,
      rules: [{required: true, message: t("sysUserList.status.required")}],
      filters: [
        { text: t("sysUserList.status.0"), value: 0 },
        { text: t("sysUserList.status.1"), value: 1 },
      ],
      hideInSearch: true,
      align: 'center',
    },
    {
      title: t("sysUserList.mobile"),
      dataIndex: 'mobile',
      valueType: 'text',
      required: true,
      rules: [{required: true, message: t("sysUserList.mobile.required")}],
      align: 'center',
    },
    {
      title: t("sysUserList.avatar"),
      dataIndex: 'avatar_url',
      hideInSearch: true,
      hideInForm: true,
      render: (_, entity: ISysUser) => <Avatar size={'small'} src={entity.avatar_url}></Avatar>,
      align: 'center',
    },
    {
      title: t("sysUserList.password"),
      dataIndex: 'password',
      valueType: 'password',
      hideInTable: true,
      hideInSearch: true,
      rules: [{required: true, message: t("sysUserList.password.required")}],
      fieldProps: {autoComplete: 'new-password'},
    },
    {
      title: t("sysUserList.rePassword"),
      dataIndex: 'rePassword',
      valueType: 'password',
      hideInTable: true,
      hideInSearch: true,
      rules: [{required: true, message: t("sysUserList.rePassword.required")}],
      fieldProps: {autoComplete: 'new-password'},
    },
    {
      title: t("sysUserList.created_at"),
      hideInForm: true,
      hideInSearch: true,
      dataIndex: 'created_at',
      align: 'center',
      render: (value: string) => value ? dayjs(value).fromNow() : '-',
    },
    {
      title: t("sysUserList.updated_at"),
      hideInForm: true,
      hideInSearch: true,
      dataIndex: 'updated_at',
      align: 'center',
      render: (value: string) => value ? dayjs(value).fromNow() : '-',
    },
  ];

  /** 修改密码相关状态 */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<number>();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  /** 打开重置密码框 */
  const showRedoModal = (id: number) => {
    setIsModalOpen(true);
    setResetUserId(id);
  };

  /** 提交重置密码 */
  const handleRedoSubmit = async (values: ResetPasswordType) => {
    try {
      setButtonLoading(true);
      await resetPassword({...values, id: resetUserId!});
      setIsModalOpen(false);
      message.success(t("sysUserList.resetSuccess"));
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    deptField().then(res => setDepts(res.data.data!));
    roleField().then(res => setRoles(res.data.data!));
  }, [])

  return (
    <>
      <XinTableV2<ISysUser>
        api={'/sys-user/list'}
        columns={columns}
        rowKey={'id'}
        accessName={'sys-user.list'}
        scroll={{x: 1400}}
        beforeOperateRender={(record) => (
          <>
            {record.id !== 1 &&
              <AuthButton auth={'sys-user.list.resetPassword'}>
                <Tooltip title={t("sysUserList.resetPassword")}>
                  <Button
                    variant={'solid'}
                    color={'pink'}
                    icon={<RedoOutlined/>}
                    size={'small'}
                    onClick={() => showRedoModal(record.id!)}
                  />
                </Tooltip>
              </AuthButton>
            }
          </>
        )}
        editShow={(i) => i.id !== 1}
        deleteShow={(i) => i.id !== 1}
        formProps={{
          grid: true, 
          colProps: {span: 12}
        }}
        pagination={{}}
      />
      <Modal
        title={t("sysUserList.resetPassword")}
        closable={{'aria-label': 'Custom Close Button'}}
        open={isModalOpen}
        footer={null}
        styles={{body: {paddingTop: 20}}}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form<ResetPasswordType> autoComplete="off" layout={'vertical'} onFinish={handleRedoSubmit}>
          <Form.Item
            label={t("sysUserList.password")}
            name="password"
            rules={[{required: true, message: t("sysUserList.password.required")}]}
          >
            <Input.Password/>
          </Form.Item>
          <Form.Item
            label={t("sysUserList.rePassword")}
            name="rePassword"
            rules={[{required: true, message: t("sysUserList.rePassword.required")}]}
          >
            <Input.Password/>
          </Form.Item>
          <Form.Item label={null} style={{marginTop: 30}}>
            <Button type="primary" block size={'large'} htmlType="submit" loading={buttonLoading}>
              {t("sysUserList.resetButton")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Table;
