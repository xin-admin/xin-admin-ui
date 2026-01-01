import { Descriptions, Card, Row, Col } from 'antd';

const Layout = () => {
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 16 }}>页面标题</h2>
        <Descriptions column={2}>
          <Descriptions.Item label="创建人">曲丽丽</Descriptions.Item>
          <Descriptions.Item label="关联表单">
            <a>421421</a>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">2017-01-10</Descriptions.Item>
          <Descriptions.Item label="单据备注">
            浙江省杭州市西湖区工专路
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Row gutter={[16, 16]}>
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
    </div>
  );
};

export default Layout;
