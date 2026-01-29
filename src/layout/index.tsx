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
import PageTitle from "@/components/PageTitle";

const {Content, Sider} = Layout;

const LayoutRender = () => {
  const themeConfig = useGlobalStore(state => state.themeConfig);
  const layout = useGlobalStore(state => state.layout);
  const collapsed = useGlobalStore(state => state.collapsed);
  const isMobile = useGlobalStore(state => state.isMobile);
  const mobileMenuOpen = useGlobalStore(state => state.mobileMenuOpen);
  const setMobileMenuOpen = useGlobalStore(state => state.setMobileMenuOpen);
  const logo = useGlobalStore(state => state.logo);
  const title = useGlobalStore(state => state.title);

  const BodyRender = (
    <Layout className={"relative"}>

      {/* 主题设置抽屉 */}
      <SettingDrawer />
      {/* 页面标题 */}
      <PageTitle />

      <HeaderRender/>
      <Content style={{padding: themeConfig.bodyPadding}}>
        <AnimatedOutlet/>
      </Content>
      <FooterRender/>
    </Layout>
  )

  if(isMobile) {
    return (
      <>
        {/* 移动端抽屉菜单 */}
        <MobileDrawerMenu />
        { BodyRender }
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
    )
  }

  return (
    <Layout hasSider className="min-h-screen" style={{ background: themeConfig.background }}>
      {layout === 'columns' && <ColumnSiderRender/> }
      {(layout === "mix" || layout === "side") && (
        <Sider
          collapsed={collapsed}
          width={themeConfig.siderWeight}
          style={{borderRight: "1px solid " + themeConfig.colorBorder}}
          className={"sticky top-0 backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bottom-0 overflow-auto h-screen"}
        >
          <div className="flex items-center h-14 justify-center">
            <img className={"w-9"} src={logo} alt="logo"/>
            { !collapsed && <span className={"font-semibold text-[20px] ml-5"}>{title}</span> }
          </div>
          <MenuRender />
        </Sider>
      )}
      { BodyRender }
    </Layout>
  );
};

export default LayoutRender;
