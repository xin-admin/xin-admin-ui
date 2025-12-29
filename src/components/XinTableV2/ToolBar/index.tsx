import { useCallback, useMemo } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Flex,
  Popover,
  Space,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  SettingOutlined,
  BorderOutlined,
  BorderlessTableOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { TableDensity } from './typings';
import { useTableContext } from '../TableContext';

/**
 * 获取密度标签
 */
const getDensityLabel = (d: TableDensity): string => {
  const labels: Record<string, string> = { large: '默认', middle: '中等', small: '紧凑' };
  return labels[d || 'middle'];
};

export default function ToolBar(props: ToolBarProps) {
  const { renderLeft, renderRight, extraRender = [] } = props;

  // 从 Context 获取状态和操作
  const {
    density,
    bordered,
    columnSettings,
    isFullScreen,
    toolBarOptions,
    setDensity,
    toggleBordered,
    setColumnSettings,
    resetColumnSettings,
    setAllColumnsVisible,
    toggleFullScreen,
    reload,
  } = useTableContext();

  // 如果工具栏选项为空对象（相当于全部关闭），检查是否有任何功能开启
  const hasAnyOption = toolBarOptions.reload || 
    toolBarOptions.density || 
    toolBarOptions.columnSetting || 
    toolBarOptions.bordered || 
    toolBarOptions.fullScreen;

  // 密度菜单项
  const densityMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'large',
        label: '默认',
        onClick: () => setDensity('large'),
      },
      {
        key: 'middle',
        label: '中等',
        onClick: () => setDensity('middle'),
      },
      {
        key: 'small',
        label: '紧凑',
        onClick: () => setDensity('small'),
      },
    ],
    [setDensity]
  );

  // 处理刷新
  const handleReload = useCallback(() => {
    reload();
  }, [reload]);

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
        showIcon
        selectable={false}
        treeData={columnTreeData}
        onDrop={handleDrop}
      />
    </div>
  );

  return (
    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
      {/* 左侧区域 */}
      <Flex align="center">
        {renderLeft || <Typography.Title level={5} style={{ margin: 0 }}>查询表格</Typography.Title>}
      </Flex>

      {/* 右侧区域 */}
      <Space size={4}>
        {/* 自定义右侧渲染 */}
        {renderRight}

        {/* 额外操作按钮 */}
        {extraRender.length > 0 && extraRender.map((item, index) => (
          <span key={index}>{item}</span>
        ))}

        {/* 功能按钮分隔 */}
        {(renderRight || extraRender.length > 0) && hasAnyOption && <Divider type="vertical" />}

        {/* 刷新按钮 */}
        {toolBarOptions.reload && (
          <Tooltip title="刷新">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            />
          </Tooltip>
        )}

        {/* 密度设置 */}
        {toolBarOptions.density && (
          <Dropdown
            menu={{
              items: densityMenuItems,
              selectedKeys: [density || 'middle'],
            }}
            trigger={['click']}
          >
            <Tooltip title={`密度: ${getDensityLabel(density)}`}>
              <Button type="text" icon={<ColumnHeightOutlined />} />
            </Tooltip>
          </Dropdown>
        )}

        {/* 边框开关 */}
        {toolBarOptions.bordered && (
          <Tooltip title={bordered ? '隐藏边框' : '显示边框'}>
            <Button
              type="text"
              icon={bordered ? <BorderOutlined /> : <BorderlessTableOutlined />}
              onClick={toggleBordered}
            />
          </Tooltip>
        )}

        {/* 列设置 */}
        {toolBarOptions.columnSetting && columnSettings.length > 0 && (
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
        )}

        {/* 全屏按钮 */}
        {toolBarOptions.fullScreen && (
          <Tooltip title={isFullScreen ? '退出全屏' : '全屏'}>
            <Button
              type="text"
              icon={
                isFullScreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={toggleFullScreen}
            />
          </Tooltip>
        )}
      </Space>
    </Flex>
  );
}
