import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Drawer, Input, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { removeRule, rule } from '@/services/ant-design-pro/api';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const SearchList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading } = useRequest(removeRule, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();

      messageApi.success('Deleted successfully and will refresh soon');
    },
    onError: () => {
      messageApi.error('Delete failed, please try again');
    },
  });

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: "会社コード",
      dataIndex: 'companyCode',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              // setCurrentRow(entity);
              // setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: "従来工場コード",
      dataIndex: 'previousFactoryCode',
      valueType: 'textarea',
    },
    {
      title: "商品工場コード",
      dataIndex: 'productFactoryCode',
      valueType: 'textarea',
    },
    {
      title: "運用開始日",
      dataIndex: 'startOperationDate',
      valueType: 'dateTime',
    },
    {
      title: "運用終了日",
      dataIndex: 'endOperationDate',
      valueType: 'dateTime',
    },
    {
      title: "従来工場名",
      dataIndex: 'previousFactoryName',
      valueType: 'textarea',
    },
    {
      title: "商品工場名",
      dataIndex: 'productFactoryName',
      valueType: 'textarea',
    },
    {
      title: "マテリアル部署コード",
      dataIndex: 'materialDepartmentCode',
      valueType: 'textarea',
    },
    {
      title: "環境情報",
      dataIndex: 'environmentalInformation',
      valueType: 'textarea',
    },
    {
      title: "認証フラグ",
      dataIndex: 'authenticationFlag',
      valueType: 'textarea',
    },
    {
      title: "企業コード",
      dataIndex: 'companyCode',
      valueType: 'textarea',
    },
    {
      title: "連携パターン",
      dataIndex: 'integrationPattern',
      valueType: 'textarea',
    },
    {
      title: "HULFTID",
      dataIndex: 'hulftid',
      valueType: 'textarea',
    },
    

  ];


  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle=""
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />

    </PageContainer>
  );
};

export default SearchList;
