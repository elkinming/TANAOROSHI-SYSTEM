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
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Drawer, Input, message, Space, Upload } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { addInventoryRecordBatch, getAllInventory, removeRule, rule } from '@/services/ant-design-pro/api';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import K from '@/services/ant-design-pro/constants';
import PageContent from '@/components/PageContent';
import PageTitle from '@/components/PageTitle';

const SearchList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.InventoryListItem[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

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

  const downloadData = () => {
    // console.log(tableData);
    if (tableData.length === 0) return;

    // Function for mapping between DB Column Names and Excel Column Names 
    const mappedData = tableData.map((row) => {
      const newRow: Record<string, any> = {};
      Object.keys(K.headerMapDownload).forEach((key) => {
        const newKey = K.headerMapDownload[key as keyof typeof K.headerMapDownload];
        newRow[newKey] = row[key];
      });
      return newRow;
    });

    // console.log(mappedData);

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '棚卸・工場');
    XLSX.writeFile(workbook, '棚卸・工場.xlsx');
  }

  const uploadData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
        
        // Function for mapping between Excel Column Names and DB Column Names
        const normalizedData = jsonData.map((row: any) => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach((header) => {
            const key = K.headerMapUpload[header as keyof typeof K.headerMapUpload];
            newRow[key] = row[header];
          });
          return newRow;
        });

        // console.log(normalizedData);

        await addInventoryRecordBatch(normalizedData);
        message.success('アップロードされました。');
        setTimeout(() => {
          actionRef.current?.reload?.();
        }, 1000);

      } catch (error) {
        message.error('アップロードできません。');
      }
      
    };
    reader.readAsArrayBuffer(file);
    return false;
  }

  const columns: ProColumns<API.InventoryListItem>[] = [
    {
      title: "",
      dataIndex: 'actions',
      search: false,
      render: (dom, entity) => {
        return (
          <UpdateForm key="create" inventoryItem={entity} reload={actionRef.current?.reload} />
        );
      },
    },
    {
      title: "会社コード",
      dataIndex: 'companyCode',
      search: false,
      // Define the column width
      // width: 1000
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
      valueType: 'date',
      search: false,
    },
    {
      title: "運用終了日",
      dataIndex: 'endOperationDate',
      valueType: 'date',
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
      dataIndex: 'groupCorporateCode',
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
    <PageContainer title={false} breadcrumbRender={false}>
      {contextHolder}

      <PageContent noCustomer={false} noPeriod={false}>
        <div className="u_box">
          <PageTitle
            pageTitle="menu.search.item"
            pgId={"ABCD-1234"}
          />
        </div>

        <ProTable<API.InventoryListItem, API.InventoryParams>
          headerTitle=""
          actionRef={actionRef}
          rowKey="key"
          search={{
            labelWidth: 120,
            resetText:"クリア"
          }}
          toolBarRender={() => [
            <Space size="small">
              <CreateForm key="create" reload={actionRef.current?.reload} />
              <Button onClick={downloadData}>ダウンロード</Button>
              <Upload accept=".xlsx, .xls" beforeUpload={uploadData} showUploadList={false}>
                <Button>アップロード</Button>
              </Upload>
            </Space>
          ]}
          // Add class for customized toolbar CSS
          className='custom-toolbar'
          request={getAllInventory}
          onDataSourceChange={(data) => {setTableData(data);}}
          columns={columns}
          options={{ fullScreen: false,  reload :false, density: false, setting: false}}
          scroll={{ x: 'max-content' }}

        />

      </PageContent>

    </PageContainer>
  );
};

export default SearchList;
