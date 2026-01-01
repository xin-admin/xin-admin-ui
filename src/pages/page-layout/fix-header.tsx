import { Card, Row, Col, Tabs, Affix } from "antd";
import React from "react";

const FixHeader = () => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer}>
      <Affix target={() => container}>
        <Card style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 16, padding: '8px 0' }}>页面标题</h2>
          <Tabs
            items={[
              { label: '已选择', key: '1' },
              { label: '可点击', key: '2' },
              { label: '禁用', key: '3', disabled: true },
            ]}
          />
        </Card>
      </Affix>
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
        <Col span={8}>
          <Card style={{height: 200}} />
        </Col>
        <Col span={16}>
          <Card style={{height: 200}} />
        </Col>
      </Row>
    </div>
  );
};

export default FixHeader;
