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
import { getAllInventory, removeRule, rule } from '@/services/ant-design-pro/api';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

const SearchList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.InventoryListItem[]>([]);

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

  const columns: ProColumns<API.InventoryListItem>[] = [
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
      search: false,
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
      search: false,
    },
    {
      title: "運用終了日",
      dataIndex: 'endOperationDate',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: "従来工場名",
      dataIndex: 'previousFactoryName',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "商品工場名",
      dataIndex: 'productFactoryName',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "マテリアル部署コード",
      dataIndex: 'materialDepartmentCode',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "環境情報",
      dataIndex: 'environmentalInformation',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "認証フラグ",
      dataIndex: 'authenticationFlag',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "企業コード",
      dataIndex: 'companyCode',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "連携パターン",
      dataIndex: 'integrationPattern',
      valueType: 'textarea',
      search: false,
    },
    {
      title: "HULFTID",
      dataIndex: 'hulftid',
      valueType: 'textarea',
      search: false,
    },
    

  ];


  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.InventoryListItem, API.InventoryParams>
        headerTitle=""
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        request={getAllInventory}
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
