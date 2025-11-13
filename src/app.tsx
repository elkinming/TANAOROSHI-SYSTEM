import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const userMockData = {
      name: '陶冶',
      avatar:
        'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      userid: '00000001',
      email: 'antdesign@alipay.com',
      signature: '海纳百川，有容乃大',
      title: '交互专家',
      group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        { key: '0', label: '很有想法的' },
        { key: '1', label: '专注设计' },
        { key: '2', label: '辣~' },
        { key: '3', label: '大长腿' },
        { key: '4', label: '川妹子' },
        { key: '5', label: '海纳百川' },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      geographic: {
        province: { label: '浙江省', key: '330000' },
        city: { label: '杭州市', key: '330100' },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    }

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // const msg = await queryCurrentUser({
      //   skipErrorHandler: true,
      // });

      // mock user
      const msg = {
        data: userMockData
      }
      return msg.data;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [
      // <Question key="doc" />,
      // <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      // src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      // render: (_, avatarChildren) => {
      //   return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      // },
    },
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    // footerRender: () => <Footer />,
    footerRender: () => <></>,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [ 
    ],
    links: isDev
      ? [
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  // baseURL: 'https://proapi.azurewebsites.net',
  baseURL: 'http://127.0.0.1:8002',
  ...errorConfig,
};
