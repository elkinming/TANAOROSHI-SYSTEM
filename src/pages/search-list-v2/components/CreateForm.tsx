import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  ProFormDatePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Col, message, Row } from 'antd';
import type { FC } from 'react';
import { addInventoryRecord } from '@/services/ant-design-pro/api';

interface CreateFormProps {
  reload?: ActionType['reload'],
}

const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;

  const [messageApi, contextHolder] = message.useMessage();
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const {run, loading} = useRequest(addInventoryRecord, {
    manual: true,
    onSuccess: () => {
      messageApi.success('新規登録されました。');
      setTimeout(() => {
        reload?.();
      },1000)
    },
    onError: () => {
      messageApi.error('新規登録できません。');
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title="新規登録"
        trigger={
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>         
        }
        width="80%"
        modalProps={{ okButtonProps: { loading }, okText: "登録" }}
        onFinish={async (value) => {
          await run(value as API.InventoryListItem);
          return true;
        }}
      >

        <Row>
          <Col span={8}>
            <ProFormText rules={[{ required: true, message: "必要" }]} width="md" label="会社コード" name="companyCode" />
          </Col>
          <Col span={8}>
            <ProFormText rules={[{ required: true, message: "必要" }]} width="md" label="従来工場コード" name="previousFactoryCode" />
          </Col>
          <Col span={8}>
            <ProFormText rules={[{ required: true, message: "必要" }]} width="md" label="商品工場コード" name="productFactoryCode" />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <ProFormDatePicker  rules={[{ required: true, message: "必要" }]} width="md" label="運用開始日" name="startOperationDate" />
          </Col>
          <Col span={8}>
            <ProFormDatePicker  rules={[{ required: true, message: "必要" }]} width="md" label="運用終了日" name="endOperationDate" />
          </Col>
          <Col span={8}>
            <ProFormText width="md" label="従来工場名" name="previousFactoryName" />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <ProFormText width="md" label="商品工場名" name="productFactoryName" />
          </Col>
          <Col span={8}>
            <ProFormText width="md" label="マテリアル部署コード" name="materialDepartmentCode" />
          </Col>
          <Col span={8}>
            <ProFormText width="md" label="環境情報" name="environmentalInformation" />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <ProFormText width="md" label="認証フラグ" name="authenticationFlag" />
          </Col>
          <Col span={8}>
            <ProFormText width="md" label="企業コード" name="groupCorporateCode" />
          </Col>
          <Col span={8}>
            <ProFormText width="md" label="連携パターン" name="integrationPattern" />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <ProFormText width="md" label="HULFTID" name="hulftid" />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default CreateForm;
