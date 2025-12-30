import {Button, Checkbox, Divider, Dropdown, Flex, Popover, Space, Tooltip, Tree} from "antd";
import {
  BorderlessTableOutlined,
  BorderOutlined,
  ColumnHeightOutlined,
  ReloadOutlined,
  SettingOutlined
} from "@ant-design/icons";
import {useCallback, useMemo} from "react";
import type {DataNode} from "antd/es/tree";

const ToolBar =  (props: any) => {
  const {
    handleRequest,
    setDensity,
    density,
    bordered,
    setBordered
  } = props;

  // 处理单列勾选
  const handleColumnCheck = useCallback(
    (key: string, checked: boolean) => {
      const newSettings = columnSettings.map((item) =>
        item.key === key ? { ...item, visible: checked } : item
      );
      setColumnSettings(newSettings);
    },
    [columnSettings, setColumnSettings]
  );

  // 处理拖拽排序
  const handleDrop = useCallback(
    (info: {
      node: DataNode;
      dragNode: DataNode;
      dropPosition: number;
      dropToGap: boolean;
    }) => {
      const dragKey = info.dragNode.key as string;
      const dropKey = info.node.key as string;
      const dropPos = info.dropPosition;

      const newSettings = [...columnSettings];
      const dragIndex = newSettings.findIndex((item) => item.key === dragKey);
      const dropIndex = newSettings.findIndex((item) => item.key === dropKey);

      if (dragIndex === -1 || dropIndex === -1) return;

      const [dragItem] = newSettings.splice(dragIndex, 1);
      const insertIndex = dropPos < 0 ? dropIndex : dropIndex + 1;
      newSettings.splice(
        dragIndex < dropIndex ? insertIndex - 1 : insertIndex,
        0,
        dragItem
      );

      setColumnSettings(newSettings);
    },
    [columnSettings, setColumnSettings]
  );

  // 列设置树数据
  const columnTreeData: DataNode[] = useMemo(() => {
    return columnSettings.map((item) => ({
      key: item.key,
      title: (
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <Checkbox
            checked={item.visible}
            disabled={item.disabled}
            onChange={(e) => handleColumnCheck(item.key, e.target.checked)}
          >
            {item.title}
          </Checkbox>
        </Flex>
      ),
    }));
  }, [columnSettings, handleColumnCheck]);

  // 计算全选状态
  const checkAllState = useMemo(() => {
    const enabledItems = columnSettings.filter((item) => !item.disabled);
    const checkedItems = enabledItems.filter((item) => item.visible);
    return {
      checked: checkedItems.length === enabledItems.length && enabledItems.length > 0,
      indeterminate:
        checkedItems.length > 0 && checkedItems.length < enabledItems.length,
    };
  }, [columnSettings]);

  // 列设置弹出内容
  const columnSettingContent = (
    <div style={{ width: 200 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Checkbox
          checked={checkAllState.checked}
          indeterminate={checkAllState.indeterminate}
          onChange={(e) => setAllColumnsVisible(e.target.checked)}
        >
          列展示
        </Checkbox>
        <Button type="link" size="small" onClick={resetColumnSettings}>
          重置
        </Button>
      </Flex>
      <Divider style={{ margin: '8px 0' }} />
      <Tree
        draggable
        blockNode
        selectable={false}
        treeData={columnTreeData}
        onDrop={handleDrop}
      />
    </div>
  );

  return (
    <Space size={1}>
      <Tooltip title="刷新">
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={() => handleRequest()}
        />
      </Tooltip>
      <Dropdown
        menu={{
          items: [
            {
              key: 'large',
              label: '宽松',
              onClick: () => setDensity('large'),
            },
            {
              key: 'middle',
              label: '默认',
              onClick: () => setDensity('middle'),
            },
            {
              key: 'small',
              label: '紧凑',
              onClick: () => setDensity('small'),
            },
          ],
          selectedKeys: [density || 'middle'],
        }}
        trigger={['click']}
      >
        <Button type="text" icon={<ColumnHeightOutlined />} />
      </Dropdown>
      <Popover
        content={columnSettingContent}
        trigger="click"
        placement="bottomRight"
        title="列设置"
      >
        <Tooltip title="列设置">
          <Button type="text" icon={<SettingOutlined />} />
        </Tooltip>
      </Popover>
      <Tooltip title={bordered ? '隐藏边框' : '显示边框'}>
        <Button
          type="text"
          icon={bordered ? <BorderOutlined /> : <BorderlessTableOutlined />}
          onClick={() => setBordered(!bordered)}
        />
      </Tooltip>
    </Space>
  )
}

export default ToolBar;