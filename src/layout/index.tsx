import AnimatedOutlet from '@/components/AnimatedOutlet';
import {useGlobalStore} from "@/stores";
import {Button, Layout} from "antd";
import HeaderRender from "@/layout/HeaderRender";
import FooterRender from "@/layout/FooterRender";
import ColumnSiderRender from "@/layout/ColumnSiderRender";
import MenuRender from "@/layout/MenuRender";
import MobileDrawerMenu from "@/layout/MobileDrawerMenu";
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SettingDrawer from "@/layout/SettingDrawer";

const {Content, Sider} = Layout;

const LayoutRender = () => {
  const themeConfig = useGlobalStore(state => state.themeConfig);
  const layout = useGlobalStore(state => state.layout);
  const collapsed = useGlobalStore(state => state.collapsed);
  const isMobile = useGlobalStore(state => state.isMobile);
  const mobileMenuOpen = useGlobalStore(state => state.mobileMenuOpen);
  const setMobileMenuOpen = useGlobalStore(state => state.setMobileMenuOpen);
  return (
    <Layout
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        background: themeConfig.background,
        transition: 'background 0.3s ease-in-out',
      }}
    >
      
      {/* 主题设置抽屉 */}
      <SettingDrawer />

      {/* 移动端布局：隐藏侧边栏，使用抽屉菜单 */}
      {isMobile ? (
        <>
          {/* 移动端抽屉菜单 */}
          <MobileDrawerMenu />
          <HeaderRender/>
          <Layout className={"relative"}>
            <Content style={{padding: themeConfig.bodyPadding}}>
              <AnimatedOutlet/>
            </Content>
            <FooterRender/>
          </Layout>
          <div className="fixed bottom-8 left-8 z-999">
            <Button
              type={'primary'}
              shape="circle"
              size='large'
              icon={mobileMenuOpen ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </>
      ) : (
        <>
          {/* 桌面端原有布局 */}
          {layout === 'columns' ? (
            <>
              <ColumnSiderRender/>
              <Layout className={"relative"}>
                <HeaderRender/>
                <Content style={{padding: themeConfig.bodyPadding}}>
                  <AnimatedOutlet/>
                </Content>
                <FooterRender/>
              </Layout>
            </>
          ) : (
            <>
              <HeaderRender/>
              <Layout hasSider>
                {(layout === "mix" || layout === "side") && (
                  <Sider
                    collapsed={collapsed}
                    width={themeConfig.siderWeight}
                    className={"sticky backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}
                    style={{
                      bottom: 0,
                      overflow: 'auto',
                      top: themeConfig.headerHeight,
                      height: `calc(100vh - ${themeConfig.headerHeight}px)`,
                      borderRight: themeConfig.layoutBorder ? '1px solid ' + themeConfig.colorBorder : 'none',
                    }}
                  >
                    <MenuRender />
                  </Sider>
                )}
                <Layout className={"relative"}>
                  <Content style={{padding: themeConfig.bodyPadding}}>
                    <AnimatedOutlet/>
                  </Content>
                  <FooterRender/>
                </Layout>
              </Layout>
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default LayoutRender;
