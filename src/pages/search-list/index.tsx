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
import { SearchOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Drawer, Input, InputRef, message, Space, TableColumnType, Upload } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { addInventoryRecordBatch, getAllInventory } from '@/services/ant-design-pro/api';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import K from '@/services/ant-design-pro/constants';
import PageContent from '@/components/PageContent';
import PageTitle from '@/components/PageTitle';
import { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

interface DataType {
  companyCode: string;
  previousFactoryCode: string;
  productFactoryCode: string;
  startOperationDate: string;
  endOperationDate: string;
  previousFactoryName: string;
  productFactoryName: string;
  materialDepartmentCode: string;
  environmentalInformation: string;
  authenticationFlag: string;
  groupCorporateCode: string;
  integrationPattern: string;
  hulftid: string;
}

type DataIndex = keyof DataType;

const SearchList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.InventoryListItem[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  const searchInput = useRef<InputRef>(null);

  const [messageApi, contextHolder] = message.useMessage();

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

  const handleSearch = ( confirm: FilterDropdownProps['confirm'], ) => { confirm(); };

  const handleReset = (clearFilters: () => void, confirm: FilterDropdownProps['confirm'],) => {
    clearFilters();
    confirm();
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`入力してください`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(confirm)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            クリア
          </Button>

          <Button
            type="primary"
            onClick={() => handleSearch(confirm)}
            // icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            検索
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  
  });

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
      sorter: (a, b) => {
        if(a.companyCode! > b.companyCode!) return 1
        else return -1
      },
      ...getColumnSearchProps('companyCode') as any,
    },
    {
      title: "従来工場コード",
      dataIndex: 'previousFactoryCode',
      valueType: 'textarea',
      sorter: (a, b) => {
        if(a.previousFactoryCode! > b.previousFactoryCode!) return 1
        else return -1
      },
      ...getColumnSearchProps('previousFactoryCode') as any,
    },
    {
      title: "商品工場コード",
      dataIndex: 'productFactoryCode',
      valueType: 'textarea',
      sorter: (a, b) => {
        if(a.productFactoryCode! > b.productFactoryCode!) return 1
        else return -1
      },
      ...getColumnSearchProps('productFactoryCode') as any,
    },
    {
      title: "運用開始日",
      dataIndex: 'startOperationDate',
      valueType: 'date',
      search: false,
      sorter: (a, b) => {
        if(a.startOperationDate! > b.startOperationDate!) return 1
        else return -1
      },
      ...getColumnSearchProps('startOperationDate') as any,
    },
    {
      title: "運用終了日",
      dataIndex: 'endOperationDate',
      valueType: 'date',
      search: false,
      sorter: (a, b) => {
        if(a.endOperationDate! > b.endOperationDate!) return 1
        else return -1
      },
      ...getColumnSearchProps('endOperationDate') as any,
    },
    {
      title: "従来工場名",
      dataIndex: 'previousFactoryName',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        const firstElement = a.previousFactoryName ?? '';
        const secondElement = b.previousFactoryName ?? '';
        return firstElement.localeCompare(secondElement, "ja", { sensitivity: 'variant'  });
      },
      ...getColumnSearchProps('previousFactoryName') as any,
    },
    {
      title: "商品工場名",
      dataIndex: 'productFactoryName',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        const firstElement = a.productFactoryName ?? '';
        const secondElement = b.productFactoryName ?? '';
        return firstElement.localeCompare(secondElement, "ja", { sensitivity: 'variant'  });
      },
      ...getColumnSearchProps('productFactoryName') as any,
    },
    {
      title: "マテリアル部署コード",
      dataIndex: 'materialDepartmentCode',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.materialDepartmentCode! > b.materialDepartmentCode!) return 1
        else return -1
      },
      ...getColumnSearchProps('materialDepartmentCode') as any,
    },
    {
      title: "環境情報",
      dataIndex: 'environmentalInformation',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.environmentalInformation! > b.environmentalInformation!) return 1
        else return -1
      },
      ...getColumnSearchProps('environmentalInformation') as any,
    },
    {
      title: "認証フラグ",
      dataIndex: 'authenticationFlag',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.authenticationFlag! > b.authenticationFlag!) return 1
        else return -1
      },
      ...getColumnSearchProps('authenticationFlag') as any,
    },
    {
      title: "企業コード",
      dataIndex: 'groupCorporateCode',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.groupCorporateCode! > b.groupCorporateCode!) return 1
        else return -1
      },
      ...getColumnSearchProps('groupCorporateCode') as any,
    },
    {
      title: "連携パターン",
      dataIndex: 'integrationPattern',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.integrationPattern! > b.integrationPattern!) return 1
        else return -1
      },
      ...getColumnSearchProps('integrationPattern') as any,
    },
    {
      title: "HULFTID",
      dataIndex: 'hulftid',
      valueType: 'textarea',
      search: false,
      sorter: (a, b) => {
        if(a.hulftid! > b.hulftid!) return 1
        else return -1
      },
      ...getColumnSearchProps('hulftid') as any,
    },
    {
      title: "",
      dataIndex: 'searchKeyword',
      valueType: 'textarea',
      search: true,
      hideInTable: true,
      colSize: 2
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
            resetText:"クリア",
            collapseRender:false,
            defaultCollapsed:false
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
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: [10,20],
            showSizeChanger: true,
            showTitle: true
          }}
          

        />

      </PageContent>

    </PageContainer>
  );
};

export default SearchList;
