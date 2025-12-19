import type {ISysRule} from "@/domain/iSysRule.ts";
import {listRule, ruleParent, showRule, statusRule} from "@/api/sys/sysUserRule";
import {useTranslation} from "react-i18next";
import IconFont from "@/components/IconFont";
import XinTable from "@/components/XinTable";
import type {XinTableColumn, XinTableRef} from "@/components/XinTable/typings.ts";
import {Button, message, Switch, Tag, Tooltip} from "antd";
import IconSelector from "@/components/XinFormField/IconSelector";
import {PlusOutlined} from "@ant-design/icons";
import {useRef} from "react";
import type {ProFormInstance} from "@ant-design/pro-components";
import useAuth from "@/hooks/useAuth";
import AuthButton from "@/components/AuthButton";

const Rule =  () => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const formRef = useRef<ProFormInstance>(null);
  const xinTableRef = useRef<XinTableRef<ISysRule>>(null);

  /** 路由地址表单项 */
  const pathItem: XinTableColumn<ISysRule> = {
    title: t("sysUserRule.routePath"),
    dataIndex: 'path',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: t("sysUserRule.routePath.required") }]},
    tooltip: t("sysUserRule.routePath.tooltip"),
  };
  /** 图标表单项 */
  const iconItem: XinTableColumn<ISysRule> = {
    title: t("sysUserRule.icon"),
    dataIndex: 'icon',
    valueType: 'text',
    renderFormItem: () => <IconSelector />,
  };
  /** 多语言表单项 */
  const localeItem: XinTableColumn<ISysRule> = {
    title: t("sysUserRule.local"),
    dataIndex: 'local',
    valueType: 'text',
    hideInTable: true,
  };
  /** 是否外链表单项 */
  const linkItem: XinTableColumn<ISysRule> = {
    title: t("sysUserRule.link"),
    dataIndex: 'link',
    valueType: 'switch',
    hideInTable: true,
    fieldProps: {
      checkedChildren: t("sysUserRule.link.1"),
      unCheckedChildren: t("sysUserRule.link.0"),
      onClick: (checked: boolean) => {
        formRef.current?.setFieldValue('link', checked ? 1 : 0);
      },
    },
  }
  /** 路由组件路径表单项 */
  const elementPathItem: XinTableColumn<ISysRule> = {
    title: t("sysUserRule.elementPath"),
    dataIndex: 'elementPath',
    valueType: 'text',
    hideInTable: true,
    formItemProps: { rules: [{ required: true, message: t("sysUserRule.elementPath.required") }]},
  }

  const columns: XinTableColumn<ISysRule>[] = [
    /** ----------------- 表单使用的 Column ------------------- */
    {
      title: t("sysUserRule.type"),
      dataIndex: 'type',
      valueType: 'radioButton',
      valueEnum: {
        "menu": t("sysUserRule.type.menu"),
        "route": t("sysUserRule.type.route"),
        "nested-route": t("sysUserRule.type.nested-route"),
        "rule": t("sysUserRule.type.rule"),
      },
      hideInTable: true,
      initialValue: 'menu',
      colProps: { span: 9 },
      formItemProps: { rules: [{ required: true, message: t("sysUserRule.type.required") }]},
    },
    {
      title: t("sysUserRule.parent"),
      dataIndex: 'parent_id',
      hideInTable: true,
      valueType: 'treeSelect',
      request: async () => {
        const data = await ruleParent();
        return [
          {
            name: t("sysUserRule.parent.0"),
            id: 0,
            children: data.data.data!
          }
        ]
      },
      initialValue: 0,
      fieldProps: { fieldNames: { label: 'name', value: 'id' }, disabled: true},
      formItemProps: { rules: [{ required: true, message: t("sysUserRule.parent.required") }]},
      colProps: { span: 9 },
    },
    {
      title: t("sysUserRule.order"),
      hideInTable: true,
      dataIndex: 'order',
      valueType: 'digit',
      width: "100%",
      initialValue: 0,
      colProps: { span: 6 },
      formItemProps: { rules: [{ required: true, message: t("sysUserRule.order.required") }]},
    },
    {
      title: t("sysUserRule.name"),
      hideInTable: true,
      dataIndex: 'name',
      valueType: 'text',
      formItemProps: { rules: [{ required: true, message: t("sysUserRule.name.required") }]},
    },
    {
      title: t("sysUserRule.key"),
      valueType: 'text',
      dataIndex: 'key',
      hideInTable: true,
      formItemProps: { rules: [{ required: true, message: t("sysUserRule.key.required") }]},
    },
    {
      valueType: 'dependency',
      name: ['type', 'link'],
      hideInTable: true,
      columns: ({ type, link }: ISysRule): any[] => {
        if (type === 'menu') {
          return [ localeItem, iconItem ];
        } else if (type === 'route') {
          if (!link) {
            return [ pathItem, iconItem, localeItem, linkItem, elementPathItem ];
          } else {
            return [ pathItem, iconItem, localeItem, linkItem ];
          }
        } else if (type === 'nested-route') {
          return [ pathItem, elementPathItem ];
        } else {
          return [];
        }
      },
    },
    /** ------------------ 表格使用的 Column ---------------- */
    {
      title: t("sysUserRule.name"),
      width: 220,
      ellipsis: true,
      hideInForm: true,
      dataIndex: 'name',
    },
    {
      width: 220,
      ellipsis: true,
      align: 'center',
      title: t("sysUserRule.local.show"),
      dataIndex: 'local',
      hideInForm: true,
      renderText: (data) => t(data)
    },
    {
      title: t("sysUserRule.icon"),
      dataIndex: 'icon',
      align: 'center',
      width: 60,
      hideInForm: true,
      renderText: (data) => data ? <IconFont name={data} /> : '-'
    },
    {
      title: t("sysUserRule.type"),
      dataIndex: 'type',
      align: 'center',
      width: 120,
      hideInForm: true,
      renderText: (value: string, record) => (
        <>
          { value === 'menu' && <Tag color={'processing'}>{t("sysUserRule.type.menu")}</Tag> }
          { value === 'route' && (
            <Tooltip title={t("sysUserRule.routePath.showTooltip", {path: record.path})}>
              <Tag color={'success'}>{t("sysUserRule.type.route")}</Tag>
            </Tooltip>
          )}
          { value === 'nested-route' && <Tag color={'success'}>{t("sysUserRule.type.nested-route")}</Tag> }
          { value === 'rule' && <Tag>{t("sysUserRule.type.rule")}</Tag> }
        </>
      )
    },
    {
      width: 60,
      title: t("sysUserRule.order"),
      align: 'center',
      dataIndex: 'order',
      hideInForm: true,
      render: (value) => <Tag bordered={false} color={'purple'}>{value}</Tag>,
    },
    {
      title: t("sysUserRule.key"),
      align: 'center',
      dataIndex: 'key',
      hideInForm: true,
      width: 220,
      render: (value) => <Tag bordered={false} color={'geekblue'}>{value}</Tag>,
    },
    {
      title: t("sysUserRule.hidden"),
      align: 'center',
      dataIndex: 'hidden',
      hideInForm: true,
      tooltip: t("sysUserRule.hidden.tooltip"),
      render: (_, data) => {
        if (data.type === 'rule' || data.type === 'nested-route') { return '-' }
        return (
          <Switch
            defaultValue={data.hidden === 1}
            disabled={!auth("sys-user.rule.show")}
            checkedChildren={t("sysUserRule.hidden.1")}
            unCheckedChildren={t("sysUserRule.hidden.0")}
            onChange={ async (_, event) => {
              event.stopPropagation();
              await showRule(data.id!);
              message.success(t("sysUserRule.hidden.updateSuccess"));
            }}
          />
        )
      },
    },
    {
      title: t("sysUserRule.status"),
      dataIndex: 'status',
      hideInForm: true,
      tooltip: t("sysUserRule.status.tooltip"),
      align: 'center',
      render: (_, data) => {
        return (
          <Switch
            defaultChecked={data.status === 1}
            disabled={!auth("sys-user.rule.status")}
            checkedChildren={t("sysUserRule.status.1")}
            unCheckedChildren={t("sysUserRule.status.0")}
            onChange={async (_, event) => {
              event.stopPropagation();
              await statusRule(data.id!);
              message.success(t("sysUserRule.status.updateSuccess"));
            }}
          />
        )
      },
    },
    {
      title: t("sysUserRule.created_at"),
      dataIndex: 'created_at',
      valueType: 'fromNow',
      hideInForm: true,
      align: 'center',
    },
    {
      title: t("sysUserRule.updated_at"),
      dataIndex: 'updated_at',
      valueType: 'fromNow',
      hideInForm: true,
      align: 'center',
    },
  ];

  return (
    <XinTable
      tableProps={{
        request: async () => {
          const { data } = await listRule();
          return {
            data: data.data,
            success: data.success
          };
        },
        headerTitle: t("sysUserRule.title"),
        search: false,
        bordered: true,
        pagination: false,
        cardProps: {
          bordered: true
        },
        scroll: {x: 1400},
      }}
      beforeOperateRender={(data) => (
        <AuthButton auth={"sys-user.rule.create"}>
          <Tooltip title={t("sysUserRule.addChildButton")}>
            <Button
              color={'green'}
              variant={'solid'}
              icon={<PlusOutlined />}
              size={'small'}
              onClick={() => {
                formRef.current?.resetFields();
                xinTableRef.current?.setEditingRecord(undefined);
                xinTableRef.current?.setFormMode("create");
                xinTableRef.current?.setFormOpen(true);
                formRef.current?.setFieldValue('parent_id', data.id);
              }}
            />
          </Tooltip>
        </AuthButton>
      )}
      formProps={{
        grid: true,
        colProps: {span: 12}
      }}
      formRef={formRef}
      xinTableRef={xinTableRef}
      columns={columns}
      api={'/sys-user/rule'}
      rowKey={"id"}
      accessName={"sys-user.rule"}
    />
  )
}

export default Rule;