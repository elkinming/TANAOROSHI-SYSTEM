import { FormattedMessage } from '@umijs/max';
import React from 'react';

const PageTitle: React.FC<{ pageTitle: string; pgId: string }> = ({ pageTitle, pgId }) => {
  return (
    <div className="u_box-title">
      <div style={{ fontWeight: 'bold', fontSize: '18px', paddingLeft: '10px' }}>
        <FormattedMessage id={pageTitle} />
      </div>
      <div>PG ID : {pgId}</div>
    </div>
  );
};

export default PageTitle;
