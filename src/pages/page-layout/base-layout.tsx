import {Button, Card, Row, Col, Dropdown, Space, Typography, Flex} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";

const { Title } = Typography;

const BaseLayout = () => {
  return (
    <div style={{padding: 16}}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 30 }}>
        <Title level={4} style={{ marginBottom: 0 }}>页面标题</Title>
        <Space style={{ height: "100%" }}>
          <Button>次要按钮</Button>
          <Button>次要按钮</Button>
          <Button type="primary">主要按钮</Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { label: '下拉菜单', key: '1' },
                { label: '下拉菜单2', key: '2' },
                { label: '下拉菜单3', key: '3' },
              ],
            }}
          >
            <Button style={{ padding: '0 8px' }}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        </Space>
      </Flex>

      <Card
        tabList={[
          {
            label: '基本信息',
            key: 'base',
          },
          {
            label: '详细信息',
            key: 'info'
          }
        ]}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card style={{height: 200}} />
          </Col>
          <Col span={16}>
            <Card style={{height: 200}} />
          </Col>
          <Col span={8}>
            <Card style={{height: 200}} />
          </Col>
        </Row>
        <Space>
          <Button>重置</Button>
          <Button type="primary">提交</Button>
        </Space>
      </Card>
    </div>
  );
};

export default BaseLayout;
