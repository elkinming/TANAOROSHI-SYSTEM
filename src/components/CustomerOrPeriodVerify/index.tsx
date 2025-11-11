// CustomerOrPeriodVerify
import { useIntl } from '@umijs/max';
import { theme } from 'antd';
import React from 'react';

type VerifyType = {
  customer?: boolean;
  period?: boolean;
};

// 验证客户或周期是否填写的提示组件
const CustomerOrPeriodVerify: React.FC<VerifyType> = ({ customer = false, period = false }) => {
  const { formatMessage } = useIntl();
  const { useToken } = theme;
  const { token } = useToken();

  const textStyle = {
    padding: '30px 19px',
  };

  const Content = () => {
    if (customer && period) {
      // 需要填写客户与年度/期
      return <div style={textStyle}>{formatMessage({ id: 'rules.no-customer-start' })}</div>;
    } else if (customer && !period) {
      // 需要填写客户
      return <div style={textStyle}>{formatMessage({ id: 'rules.no-customer' })}</div>;
    } else if (!customer && period) {
      // 需要填写年度/期
      return <div style={textStyle}>{formatMessage({ id: 'rules.no-period' })}</div>;
    } else {
      // 不需要填写
      return null;
    }
  };
  return (
    <div
      style={{
        width: '600px',
        minWidth: '420px',
        textAlign: 'center',
        borderRadius: '8px',
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        color: token.colorTextSecondary,
        lineHeight: '22px',
        fontSize: '16px',
        margin: '30px auto',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: '8px',
          padding: '16px 19px',
        }}
      >
        {formatMessage({ id: 'component.common.hint' })}
      </div>
      {Content()}
    </div>
  );
};

export default CustomerOrPeriodVerify;
