import React from 'react';
import { Layout } from 'antd';
import SystemStats from '../components/SystemStats';
import BrowserManage from '../components/BrowserManage';

const { Content } = Layout;

const Home: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: '0 24px', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SystemStats />
          <BrowserManage />
        </div>
      </Content>
    </Layout>
  );
};

export default Home;
