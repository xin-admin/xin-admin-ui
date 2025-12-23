import {
  AlipayOutlined,
  LockOutlined,
  QqOutlined,
  TaobaoOutlined,
  UserOutlined,
  WechatOutlined,
  WeiboOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Col, Divider, message, Row, Space, Button } from 'antd';
import {type CSSProperties, useEffect, useState} from 'react';
import React from 'react';
import useAuthStore from "@/stores/user.ts";
import {useNavigate} from "react-router";
import type { LoginParams } from '@/api/sys/sysUser';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/stores';
import { darkColorTheme, defaultColorTheme } from '@/layout/theme';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { usePageTitle } from '@/hooks/usePageTitle';
import {useThemeTransition} from '@/hooks/useThemeTransition';

// 样式定义函数，支持暗黑模式
const getBodyStyle = (isDark: boolean): CSSProperties => ({
  backgroundImage: isDark ? 'url(/static/bg-dark.jpg)' : 'url(/static/bg.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  minWidth: '520px',
  backgroundColor: isDark ? '#141414' : '#f0f2f5',
  transition: 'background-color 0.3s ease',
});

const loginBodyStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  position: 'relative',
};

const getLoginCardStyle = (isDark: boolean): CSSProperties => ({ 
  background: isDark ? '#1f1f1f' : 'white', 
  borderRadius: '24px', 
  overflow: 'hidden', 
  boxShadow: isDark 
    ? '0 8px 24px rgba(0, 0, 0, 0.45)' 
    : '0 8px 24px rgba(0, 0, 0, 0.12)',
  padding: '48px 32px',
  position: 'relative',
  transition: 'all 0.3s ease',
});

const getIconStyle = (isDark: boolean): CSSProperties => ({
  color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
  fontSize: '20px',
  verticalAlign: 'middle',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const getIconDivStyle = (isDark: boolean): CSSProperties => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: 48,
  width: 48,
  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #D4D8DD',
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();
  const { t } = useTranslation();
  const themeConfig = useGlobalStore(state => state.themeConfig);
  const setThemeConfig = useGlobalStore(state => state.setThemeConfig);
  const logo = useGlobalStore(state => state.logo);
  const title = useGlobalStore(state => state.title);
  const subtitle = useGlobalStore(state => state.subtitle);
  const [isDark, setIsDark] = useState(themeConfig.algorithm === 'darkAlgorithm');
  const { setPageTitle } = usePageTitle();
  // 主题过渡动画 Hook
  const { transitionThemeWithCircle } = useThemeTransition();

  useEffect(() => {
    setPageTitle(subtitle);
    if(localStorage.getItem('token') && user) {
      console.log(t('login.alreadyLoggedIn'));
      window.location.href = '/';
    }
  }, [user, navigate, t, subtitle, setPageTitle]);

  const handleSubmit = async (values: LoginParams) => {
    await login(values);
    message.success(t('login.success'));
    window.location.href = '/';
  };
  
  // 暗黑模式切换
  const toggleTheme = (e: any) => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    transitionThemeWithCircle(e, () => {
      setThemeConfig({
        ...themeConfig,
        ...newIsDark ? darkColorTheme : defaultColorTheme,
      });
    })
  };

  return (
    <Row style={getBodyStyle(isDark)}>
      <Col lg={12} xs={24} style={loginBodyStyle}>
        <div style={getLoginCardStyle(isDark)}>
          {/* 右上角工具栏 */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
          }}>
            <Space size="middle">
              <LanguageSwitcher size={"large"} type={'text'} />
              <Button 
                icon={<BulbOutlined />} 
                size="large" 
                type="text"
                onClick={toggleTheme}
              />
            </Space>
          </div>
          <LoginForm
            logo={logo}
            title={title}
            subTitle={subtitle}
            layout='vertical'
            actions={
              <>
                <Divider plain>{t('login.otherLogin')}</Divider>
                <Space align="center" size={24} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={getIconDivStyle(isDark)}>
                    <QqOutlined style={{ ...getIconStyle(isDark), color: 'rgb(123, 212, 239)' }} />
                  </div>
                  <div style={getIconDivStyle(isDark)}>
                    <WechatOutlined style={{ ...getIconStyle(isDark), color: 'rgb(51, 204, 0)' }} />
                  </div>
                  <div style={getIconDivStyle(isDark)}>
                    <AlipayOutlined style={{ ...getIconStyle(isDark), color: '#1677FF' }} />
                  </div>
                  <div style={getIconDivStyle(isDark)}>
                    <TaobaoOutlined style={{ ...getIconStyle(isDark), color: '#FF6A10' }} />
                  </div>
                  <div style={getIconDivStyle(isDark)}>
                    <WeiboOutlined style={{ ...getIconStyle(isDark), color: '#e71f19' }} />
                  </div>
                </Space>
              </>
            }
            onFinish={handleSubmit}
          >
            <ProFormText
              name="username"
              label={t('login.username')}
              fieldProps={{
                size: 'large',
                variant: "filled",
                prefix: <UserOutlined className={'prefixIcon'} />,
              }}
              placeholder={t('login.usernamePlaceholder')}
              rules={[{ required: true, message: t('login.usernameRequired') }]}
            />
            <ProFormText.Password
              name="password"
              label={t('login.password')}
              fieldProps={{
                size: 'large',
                variant: "filled",
                prefix: <LockOutlined className={'prefixIcon'} />,
              }}
              placeholder={t('login.passwordPlaceholder')}
              rules={[{ required: true, message: t('login.passwordRequired') }]}
            />
            <div style={{ marginBlockEnd: 24 }}>
              <ProFormCheckbox noStyle name="remember">{t('login.remember')}</ProFormCheckbox>
              <a style={{ float: 'right' }}>{t('login.forgotPassword')}</a>
            </div>
          </LoginForm>
        </div>
      </Col>
      <Col lg={12} xs={24}></Col>
    </Row>
  );
};

export default Login;
