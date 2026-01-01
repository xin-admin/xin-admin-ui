import type {ISysRule} from "@/domain/iSysRule.ts";
import {listRule, ruleParent, showRule, statusRule} from "@/api/sys/sysUserRule";
import {useTranslation} from "react-i18next";
import IconFont from "@/components/IconFont";
import XinTableV2 from "@/components/XinTableV2";
import type {XinTableColumn} from "@/components/XinTableV2/typings";
import {Button, message, Switch, Tag, Tooltip} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import useAuth from "@/hooks/useAuth";
import AuthButton from "@/components/AuthButton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface RuleParent {
  id: number;
  name: string;
  children?: RuleParent[];
}

const Rule =  () => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const [parentOptions, setParentOptions] = useState<RuleParent[]>([]);

  // 加载父级选项
  useEffect(() => {
    ruleParent().then(res => {
      const children = (res.data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        children: item.children
      }));
      setParentOptions([
        {
          name: t("sysUserRule.parent.0"),
          id: 0,
          children
        }
      ]);
    });
  }, []);

  const columns: XinTableColumn<ISysRule>[] = [
    /** ----------------- 表单使用的 Column ------------------- */
    {
      title: t("sysUserRule.type"),
      dataIndex: 'type',
      valueType: 'radioButton',
      hideInTable: true,
      hideInSearch: true,
      colProps: { span: 9 },
      rules: [{ required: true, message: t("sysUserRule.type.required") }],
      fieldProps: {
        options: [
          { value: 'menu', label: t("sysUserRule.type.menu") },
          { value: 'route', label: t("sysUserRule.type.route") },
          { value: 'nested-route', label: t("sysUserRule.type.nested-route") },
          { value: 'rule', label: t("sysUserRule.type.rule") },
        ],
      },
    },
    {
      title: t("sysUserRule.parent"),
      dataIndex: 'parent_id',
      hideInTable: true,
      hideInSearch: true,
      valueType: 'treeSelect',
      rules: [{ required: true, message: t("sysUserRule.parent.required") }],
      colProps: { span: 9 },
      fieldProps: {
        treeData: parentOptions,
        fieldNames: { label: 'name', value: 'id' },
        disabled: true,
      },
    },
    {
      title: t("sysUserRule.order"),
      hideInTable: true,
      hideInSearch: true,
      dataIndex: 'order',
      valueType: 'digit',
      colProps: { span: 6 },
      rules: [{ required: true, message: t("sysUserRule.order.required") }],
    },
    {
      title: t("sysUserRule.name"),
      hideInTable: true,
      hideInSearch: true,
      dataIndex: 'name',
      valueType: 'text',
      rules: [{ required: true, message: t("sysUserRule.name.required") }],
    },
    {
      title: t("sysUserRule.key"),
      valueType: 'text',
      dataIndex: 'key',
      hideInTable: true,
      hideInSearch: true,
      rules: [{ required: true, message: t("sysUserRule.key.required") }],
    },
    {
      title: t("sysUserRule.routePath"),
      dataIndex: 'path',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
      tooltip: t("sysUserRule.routePath.tooltip"),
    },
    {
      title: t("sysUserRule.icon"),
      dataIndex: 'icon',
      valueType: 'icon',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: t("sysUserRule.local"),
      dataIndex: 'local',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: t("sysUserRule.elementPath"),
      dataIndex: 'elementPath',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
    },
    /** ------------------ 表格使用的 Column ---------------- */
    {
      title: t("sysUserRule.name"),
      width: 220,
      ellipsis: true,
      hideInForm: true,
      hideInSearch: true,
      dataIndex: 'name',
    },
    {
      width: 220,
      ellipsis: true,
      align: 'center',
      title: t("sysUserRule.local.show"),
      dataIndex: 'local',
      hideInForm: true,
      hideInSearch: true,
      render: (data: string) => data ? t(data) : '-'
    },
    {
      title: t("sysUserRule.icon"),
      dataIndex: 'icon',
      align: 'center',
      width: 60,
      hideInForm: true,
      hideInSearch: true,
      render: (data: string) => data ? <IconFont name={data} /> : '-'
    },
    {
      title: t("sysUserRule.type"),
      dataIndex: 'type',
      align: 'center',
      width: 120,
      hideInForm: true,
      hideInSearch: true,
      render: (value: string, record: ISysRule) => (
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
      hideInSearch: true,
      render: (value: number) => <Tag bordered={false} color={'purple'}>{value}</Tag>,
    },
    {
      title: t("sysUserRule.key"),
      align: 'center',
      dataIndex: 'key',
      hideInForm: true,
      hideInSearch: true,
      width: 220,
      render: (value: string) => <Tag bordered={false} color={'geekblue'}>{value}</Tag>,
    },
    {
      title: t("sysUserRule.hidden"),
      align: 'center',
      dataIndex: 'hidden',
      hideInForm: true,
      hideInSearch: true,
      tooltip: t("sysUserRule.hidden.tooltip"),
      render: (_, data: ISysRule) => {
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
      hideInSearch: true,
      tooltip: t("sysUserRule.status.tooltip"),
      align: 'center',
      render: (_, data: ISysRule) => {
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
      hideInForm: true,
      hideInSearch: true,
      align: 'center',
      render: (value: string) => value ? dayjs(value).fromNow() : '-',
    },
    {
      title: t("sysUserRule.updated_at"),
      dataIndex: 'updated_at',
      hideInForm: true,
      hideInSearch: true,
      align: 'center',
      render: (value: string) => value ? dayjs(value).fromNow() : '-',
    },
  ];

  return (
    <XinTableV2<ISysRule>
      handleRequest={async () => {
        const { data } = await listRule();
        return {
          data: data.data || [],
          total: data.data?.length || 0
        };
      }}
      titleRender={<span>{t("sysUserRule.title")}</span>}
      searchProps={false}
      scroll={{x: 1400}}
      beforeOperateRender={(data) => (
        <AuthButton auth={"sys-user.rule.create"}>
          <Tooltip title={t("sysUserRule.addChildButton")}>
            <Button
              color={'green'}
              variant={'solid'}
              icon={<PlusOutlined />}
              size={'small'}
              onClick={() => {
                // TODO: 实现新增子级功能
                message.info(t("sysUserRule.addChildButton") + `: ${data.name}`);
              }}
            />
          </Tooltip>
        </AuthButton>
      )}
      formProps={{
        grid: true,
        colProps: {span: 12}
      }}
      columns={columns}
      api={'/sys-user/rule'}
      rowKey={"id"}
      accessName={"sys-user.rule"}
      pagination={{}}
    />
  )
}

export default Rule;
