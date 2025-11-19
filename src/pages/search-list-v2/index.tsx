import { SearchOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumns,
} from '@ant-design/pro-components';
import {
  EditableProTable,
  PageContainer,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Input, InputRef, message, Space, TableColumnType, Upload } from 'antd';
import { FilterDropdownProps } from 'antd/es/table/interface';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import PageContent from '@/components/PageContent';
import PageTitle from '@/components/PageTitle';
import { addInventoryRecordBatch, deleteInventoryRecordArray, getAllInventory, insertInventoryRecordArray, updateInventoryRecordBatch } from '@/services/ant-design-pro/api';
import K from '@/services/ant-design-pro/constants';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

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

const SearchListV2: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const formRef = useRef<any>(null);

  const [current, setCurrent] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [dataSource, setDataSource] = useState<API.InventoryListItem[]>([]);
  const [editDataSource, setEditDataSource] = useState<API.InventoryListItem[]>([]);
  const searchInput = useRef<InputRef>(null);
  const [editableKeys, setEditableRowKeys] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<any[]>([]);
  const [hideRowEditButton, setHideRowEditButton] = useState(false);
  const [showRowSelection, setShowRowSelection] = useState(false);
  const [allowEditPkFields, setAllowEditPkFields] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [errorResults, setErrorResults] = useState<any[]>([]);

  const initData = () => {
    setCurrent(1);
    setDataSource([]);
    setErrorResults([]);
    setEditDataSource([]);
    setEditableRowKeys([]);
    setSelectedRowKeys([]);
    setIsEditing(false);
    setIsInserting(false);
    setIsDeleting(false);
    setHideRowEditButton(false);   
    setShowRowSelection(false);
  };

  const getDataSource = async(params? : any) => {
    // console.log('getDataSource');
    initData();
    const response = await getAllInventory(params);
    // console.log(response);
    setDataSource(response.data!);
    setTotal(response.data?.length ? response.data?.length : 0)
    return response
  }

  const refreshDataSource = async(params? : any) => {
    // console.log('refreshDataSource');
    const response = await getAllInventory(params);
    // console.log(response);
    setDataSource(response.data!);
    setTotal(response.data?.length ? response.data?.length : 0)
    return response
  }

  const updateDataSource = async () => {
    try {
      const response = await updateInventoryRecordBatch(editDataSource);
      messageApi.success(<FormattedMessage id="msg.success.updateSuccess" />);
      // console.log(response);
      await getDataSource();

    } catch (e: any) {
      console.log(e.response.data);
      const rawErrorItems = e.response.data.errorList as API.CommitRecordError[];
      const errorItems = rawErrorItems.filter(item => item.level === 'E' || item.level === 'W');
      setErrorResults(getUserErrors(errorItems));
      messageApi.error(<FormattedMessage id="msg.error.updateFailed" />);
    }
  }

  const saveNewRecordsOnDataSource = async () => {
    try {
      const response = await insertInventoryRecordArray(editDataSource);
      messageApi.success(<FormattedMessage id="msg.success.insertSuccess" />);
      // console.log(response);
      await getDataSource();

    } catch (e: any) {
      console.log(e.response.data);
      const rawErrorItems = e.response.data.errorList as API.CommitRecordError[];
      const errorItems = rawErrorItems.filter(item => item.level === 'E' || item.level === 'W');
      setErrorResults(getUserErrors(errorItems));
      messageApi.error(<FormattedMessage id="msg.error.insertFailed" />);
    }
  }

  const deleteRecordsInDataSource = async () => {
    try {
      // const response = await deleteInventoryRecordArray(selectedRowKeys);
      const response = await deleteInventoryRecordArray(selectedDataSource);
      // console.log(selectedRowKeys);
      messageApi.success(<FormattedMessage id="msg.success.deleteSuccess" />);
      // console.log(response);
      await getDataSource();

    } catch (e: any) {
      console.log(e.response.data);
      const rawErrorItems = e.response.data.errorList as API.CommitRecordError[];
      const errorItems = rawErrorItems.filter(item => item.level === 'E' || item.level === 'W');
      setErrorResults(getUserErrors(errorItems));
      messageApi.error(<FormattedMessage id="msg.error.insertFailed" />);
    }
  }

  // Function for getting errors for the User
  const getUserErrors = (errorItems: API.CommitRecordError[]) => {
    const userErrorItems: API.CommitRecordError[] = [];
    const standardErrors = [
      { code: '0', msg:'msg.error.Exception'},
      { code: '23505', msg:'msg.error.primaryKeyDuplicated'},
      { code: '22001', msg:'msg.error.fieldWrongSize'},
    ]
    errorItems.forEach((errorItem) => {
      const record = editDataSource.find((element) => {
        if(element.id == errorItem.record.id){
          return true;
        } 
        return false;
      })
      const newErrorItem: API.CommitRecordError = {
        code: errorItem.code,
        detail: `${record?.companyCode}, ${record?.previousFactoryCode}, ${record?.productFactoryCode}, ${record?.startOperationDate}, ${record?.endOperationDate}, `,
        message: standardErrors[0].msg,
        record: errorItem.record,
        level: errorItem.level,
      }
      standardErrors.forEach((standardError) => {
        if(standardError.code == errorItem.code){
          newErrorItem.message = standardError.msg;
        }        
      })
      userErrorItems.push(newErrorItem);
    })

    return userErrorItems;
  }

  
  // Effect for loading the data for the first time
  useEffect(() => {
    getDataSource();
  },[])


  const downloadData = () => {
    console.log(dataSource);
    if (dataSource.length === 0) return;

    // Function for mapping between DB Column Names and Excel Column Names 
    const mappedData = dataSource.map((row: any) => {
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

  const enableMultiUpdate = () => {
    setEditableRowKeys(dataSource?.map((item) => item.id));
    setEditDataSource([]);
    setIsInserting(false);
    setIsDeleting(false);
    setAllowEditPkFields(false);
    setIsEditing(true);
    setHideRowEditButton(true);
  }

  const enableMultiInsert = () => {
    setEditDataSource([]);
    setEditableRowKeys([]);
    setIsEditing(false);   
    setIsDeleting(false);
    setIsInserting(true);
    setHideRowEditButton(true);   
    setAllowEditPkFields(true);
  }

  const enableMultiDelete = () => {
    setEditDataSource([]);
    setEditableRowKeys([]);
    setIsEditing(false);   
    setIsInserting(false);
    setAllowEditPkFields(false);
    setIsDeleting(true);
    setHideRowEditButton(true);   
    setShowRowSelection(true);
  }

  const cancelMultipleUpdate = () => {
    formRef.current!.resetFields();
    setEditableRowKeys([]);
    setEditDataSource([]);
    setErrorResults([]);
    setSelectedRowKeys([]);
    setIsInserting(false);
    setIsEditing(false);
    setIsDeleting(false);
    setHideRowEditButton(false); 
    setAllowEditPkFields(false);  
    setShowRowSelection(false);
    refreshDataSource();
  }

  const addNewRecordRow = () => {
    const newRecord = {
      id: uuidv4(),
    };
    const dataSourceCopy = [...dataSource];
    dataSourceCopy.unshift(newRecord);
    setDataSource(dataSourceCopy);
    const editableKeysCopy = [...editableKeys];
    editableKeysCopy.unshift(newRecord.id);
    setEditableRowKeys(editableKeysCopy);
    formRef.current?.addEditRecord?.(newRecord);
  }

  const calculateStyleForm = (actualRecord: API.InventoryListItem, fieldName: string) => {
    let backgroundColor = 'white'
    let borderColor = undefined
    const recordFind = editDataSource.find((item) => {
      if(item?.id == actualRecord?.id){
        return true;
      }
      return false;
    })
    if(recordFind){

      const originalRecord = dataSource.find((originalItem) => {
        if(originalItem.id == actualRecord?.id){
          return true;
        }
        return false;
      })

      type InventoryKey = keyof API.InventoryListItem;
      if(originalRecord?.[fieldName as InventoryKey] !== recordFind?.[fieldName as InventoryKey]) {
        backgroundColor = '#fff7e6'
        borderColor = '#fa8c16'
      }
    }
    return {
      backgroundColor,
      borderColor
    }
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
      editable: false,
      hideInTable: hideRowEditButton
    },
    {
      title: "会社コード",
      dataIndex: 'companyCode',
      search: false,
      valueType: "text",
      editable: allowEditPkFields,
      sorter: (a, b) => {
        if(a.companyCode! > b.companyCode!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'companyCode');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('companyCode') as any,
    },
    {
      title: "従来工場コード",
      dataIndex: 'previousFactoryCode',
      valueType: "text",
      editable: allowEditPkFields,
      sorter: (a, b) => {
        if(a.previousFactoryCode! > b.previousFactoryCode!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'previousFactoryCode');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('previousFactoryCode') as any,
    },
    {
      title: "商品工場コード",
      dataIndex: 'productFactoryCode',
      editable: allowEditPkFields,
      sorter: (a, b) => {
        if(a.productFactoryCode! > b.productFactoryCode!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'productFactoryCode');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('productFactoryCode') as any,
    },
    {
      title: "運用開始日",
      dataIndex: 'startOperationDate',
      valueType: 'date',
      search: false,
      editable: allowEditPkFields,
      sorter: (a, b) => {
        if(a.startOperationDate! > b.startOperationDate!) return 1
        else return -1
      },
      onCell: (record) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'startOperationDate');
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : backgroundColor, }, }
      },
      ...getColumnSearchProps('startOperationDate') as any,
    },
    {
      title: "運用終了日",
      dataIndex: 'endOperationDate',
      valueType: 'date',
      search: false,
      editable: allowEditPkFields,
      sorter: (a, b) => {
        if(a.endOperationDate! > b.endOperationDate!) return 1
        else return -1
      },
      onCell: (record) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'endOperationDate');
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : backgroundColor, }, }
      },
      ...getColumnSearchProps('endOperationDate') as any,
    },
    {
      title: "従来工場名",
      dataIndex: 'previousFactoryName',
      search: false,
      sorter: (a, b) => {
        const firstElement = a.previousFactoryName ?? '';
        const secondElement = b.previousFactoryName ?? '';
        return firstElement.localeCompare(secondElement, "ja", { sensitivity: 'variant'  });
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'previousFactoryName');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('previousFactoryName') as any,
    },
    {
      title: "商品工場名",
      dataIndex: 'productFactoryName',
      search: false,
      sorter: (a, b) => {
        const firstElement = a.productFactoryName ?? '';
        const secondElement = b.productFactoryName ?? '';
        return firstElement.localeCompare(secondElement, "ja", { sensitivity: 'variant'  });
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'productFactoryName');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('productFactoryName') as any,
    },
    {
      title: "マテリアル部署コード",
      dataIndex: 'materialDepartmentCode',
      search: false,
      sorter: (a, b) => {
        if(a.materialDepartmentCode! > b.materialDepartmentCode!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'materialDepartmentCode');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('materialDepartmentCode') as any,
    },
    {
      title: "環境情報",
      dataIndex: 'environmentalInformation',
      search: false,
      sorter: (a, b) => {
        if(a.environmentalInformation! > b.environmentalInformation!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'environmentalInformation');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('environmentalInformation') as any,
    },
    {
      title: "認証フラグ",
      dataIndex: 'authenticationFlag',
      search: false,
      sorter: (a, b) => {
        if(a.authenticationFlag! > b.authenticationFlag!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'authenticationFlag');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('authenticationFlag') as any,
    },
    {
      title: "企業コード",
      dataIndex: 'groupCorporateCode',
      search: false,
      sorter: (a, b) => {
        if(a.groupCorporateCode! > b.groupCorporateCode!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'groupCorporateCode');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('groupCorporateCode') as any,
    },
    {
      title: "連携パターン",
      dataIndex: 'integrationPattern',
      search: false,
      sorter: (a, b) => {
        if(a.integrationPattern! > b.integrationPattern!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'integrationPattern');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('integrationPattern') as any,
    },
    {
      title: "HULFTID",
      dataIndex: 'hulftid',
      search: false,
      sorter: (a, b) => {
        if(a.hulftid! > b.hulftid!) return 1
        else return -1
      },
      onCell: (record) => {
        const recordExist = errorResults.some(item => item?.record.id === record?.id);
        return { style: { backgroundColor: recordExist ? '#f7a968ff' : undefined, }, }
      },
      renderFormItem: (item, { record }) => {
        const {borderColor, backgroundColor} = calculateStyleForm(record!, 'hulftid');
        return (
          <Input
            style={{
              background: backgroundColor,
              borderColor: borderColor,
            }}
          />
        );
      },
      ...getColumnSearchProps('hulftid') as any,
    },
    {
      title: "",
      dataIndex: 'searchKeyword',
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
            pageTitle="menu.search.item-v2"
            pgId={"ABCD-1234"}
          />
        </div>

        {errorResults.length > 0 && (
          <div style={{
            flex: '0 0 auto',
            maxHeight: '105px',
            overflowY: 'auto',
            marginBottom: '12px',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            backgroundColor: '#fff2f0',
            padding: '8px 12px'
          }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errorResults.map((item, index) => {
                  const message = item.message
                  return (
                    <li
                      key={index}
                      style={{
                        marginBottom: '4px',
                        color: item.level === 'E' ? '#ff4d4f' : '#fa8c16',
                        listStyleType: 'disc'
                      }}
                    >
                      <FormattedMessage id={message} values={{value: item.detail}} />
                      
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        <EditableProTable<API.InventoryListItem, API.InventoryParams>
          headerTitle=""
          actionRef={actionRef}
          rowKey="id"
          size="small"
          search={{
            labelWidth: 120,
            resetText:"クリア",
            collapseRender:false,
            defaultCollapsed:false
          }}
          rowSelection={ showRowSelection ? {
            type: 'checkbox',
            selectedRowKeys,
            onChange: (selectedKeys) => {
              console.log('selectedRowKeys changed: ', selectedKeys);
              setSelectedRowKeys(selectedKeys);
              const newSelectedDataSource: any[] = [];
              dataSource.find((record) => {
                selectedKeys.forEach((selectedKey) => {
                  if(record.id == selectedKey){
                    newSelectedDataSource.push(record);
                  }
                })
              })
              setSelectedDataSource(newSelectedDataSource)
            },
          } : undefined}
          request={async (params) => {
            return await refreshDataSource(params);
          }}
          toolBarRender={() => [
            (!isEditing && !isInserting && !isDeleting &&
              <Space size="small">
                <CreateForm key="create" reload={actionRef.current?.reload} />
                <Button onClick={downloadData}>ダウンロード</Button>
                <Upload accept=".xlsx, .xls" beforeUpload={uploadData} showUploadList={false}>
                  <Button>アップロード</Button>
                </Upload>
                <Button onClick={enableMultiUpdate}><FormattedMessage id="pages.searchList.batchUpdatingButton"/></Button>
                <Button onClick={enableMultiInsert}><FormattedMessage id="pages.searchList.batchInsertionButton"/></Button>
                <Button onClick={enableMultiDelete}><FormattedMessage id="pages.searchList.batchDeleteButton"/></Button>
              </Space>
            ),
            (isEditing && 
              <Space size="small">
                <Button onClick={updateDataSource} type='primary'><FormattedMessage id="pages.searchList.saveButton"/></Button>
                <Button onClick={cancelMultipleUpdate}><FormattedMessage id="pages.searchList.cancelButton"/></Button>
              </Space>
            ),
            (isInserting && 
              <Space size="small">
                <Button onClick={saveNewRecordsOnDataSource} type='primary'><FormattedMessage id="pages.searchList.saveButton"/></Button>
                <Button onClick={cancelMultipleUpdate}><FormattedMessage id="pages.searchList.cancelButton"/></Button>
                <Button onClick={addNewRecordRow}><FormattedMessage id="pages.searchList.addRecordButton"/></Button>
              </Space>
            ),
            (isDeleting && 
              <Space size="small">
                <Button onClick={deleteRecordsInDataSource} color="danger" variant="solid"><FormattedMessage id="pages.searchList.deleteButton"/></Button>
                <Button onClick={cancelMultipleUpdate}><FormattedMessage id="pages.searchList.cancelButton"/></Button>
              </Space>
            )
            
          ]}
          // Add class for customized toolbar CSS
          className='custom-toolbar'
          columns={columns}
          options={{ fullScreen: false,  reload :false, density: false, setting: false}}
          scroll={{ x: 'max-content' }}
          value={dataSource}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
            pageSizeOptions: [10,20],
            showTotal: (total: number, range: [number, number]) => (
              <FormattedMessage
                id="table.showTotal"
                values={{ current: current, total: total, range0: range[0], range1: range[1] }}
              />
            ),
            total: total,
            current: current,
            onChange: (page) => {
              setCurrent(page);
            },
            position: ['bottomRight'],
          }}

          recordCreatorProps={false}

          editableFormRef={formRef}

          editable={{
            type: 'multiple',
            editableKeys,
            onValuesChange: (record, recordList) => {
              const editDataSourceIndex = editDataSource.findIndex((editRecord) => {
                if (editRecord.id == record.id){
                  return true;
                } else {
                  return false;
                }
              })

              const newEditDataSource = [...editDataSource];
              if (editDataSourceIndex !== -1){
                newEditDataSource[editDataSourceIndex] = record;
                setEditDataSource(newEditDataSource);
              } else {
                newEditDataSource.push(record);
                setEditDataSource(newEditDataSource);
              }
              // console.log(editDataSource);
            },
            onChange: setEditableRowKeys,
          }}
        />
      </PageContent>
    </PageContainer>
  );
};

export default SearchListV2;


