import CustomerOrPeriodVerify from '@/components/CustomerOrPeriodVerify';
import { useModel } from '@umijs/max';
import { Spin } from 'antd';
import React from 'react';

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '200px',
};

const maxFull: React.CSSProperties = {
  maxHeight: 'calc(100vh - 65px)',
  overflow: 'auto',
};

type PageContentType = {
  children: React.ReactNode;
  // 是不存在得意先吗？
  noCustomer?: boolean;
  // 是不存在年度/期吗？
  noPeriod?: boolean;
  // 页面最大高度是否为全屏
  isMaxFull?: boolean;
};

// 判断在是否展示默认画面
const PageContent: React.FC<PageContentType> = ({
  children,
  noCustomer = false,
  noPeriod = false,
  isMaxFull = false,
}) => {
  // const { loading } = useModel('userHeaderData', (module) => ({
  //   loading: module.loading,
  // }));
  // // 判断头部数据是否正在加载中
  // if (loading) {
  //   return (
  //     <div style={loadingStyle}>
  //       <Spin tip="Loading" size="large">
  //         <span></span>
  //       </Spin>
  //     </div>
  //   );
  // }
  // 判断是否存在得意先或者年度期
  if (noCustomer || noPeriod) {
    return <CustomerOrPeriodVerify customer={noCustomer} period={noPeriod} />;
  } else {
    return <div style={isMaxFull ? maxFull : {}}>{children}</div>;
  }
};

export default PageContent;
