// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const URL = "http://127.0.0.1:8002"

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

// function for getting all the inventory
export async function getAllInventory(
  params: {
    previousFactoryCode?: string;
    productFactoryCode?: string;
  },
  options?: { [key: string]: any },
) {
  // return request<API.InventoryList>(`${URL}/inventory/record-list`, {
  return request<API.InventoryList>(`/inventory/record-list`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addInventoryRecord(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem>(`${URL}/inventory/record`, {
  return request<API.InventoryListItem>(`/inventory/record`, {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
    requestType: 'json',
  });
}

export async function updateInventoryRecord(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem>(`${URL}/inventory/record`, {
  return request<API.InventoryListItem>(`/inventory/record`, {
    method: 'PUT',
    data: {
      method: 'update',
      ...(options || {}),
    },
    requestType: 'json',
  });
}

// Function for inserting a batch of records.
// Body: record[]
export async function addInventoryRecordBatch(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem[]>(`${URL}/inventory/record-batch`, {
  return request<API.InventoryListItem[]>(`/inventory/record-batch`, {
    method: 'POST',
    data: (options || []),
    requestType: 'json',
  });
}

// Function for updating a batch of records.
// Body: record[]
export async function updateInventoryRecordBatch(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem[]>(`${URL}/inventory/record-batch`, {
  return request<API.InventoryListItem[]>(`/inventory/record/multiple`, {
    method: 'PUT',
    data: (options || []),
    requestType: 'json',
  });
}

export async function insertInventoryRecordArray(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem[]>(`${URL}/inventory/record-batch`, {
  return request<API.InventoryListItem[]>(`/inventory/record/multiple`, {
    method: 'POST',
    data: (options || []),
    requestType: 'json',
  });
}

export async function deleteInventoryRecordArray(options?: { [key: string]: any }) {
  // return request<API.InventoryListItem[]>(`${URL}/inventory/record-batch`, {
  return request<string[]>(`/inventory/record/multiple`, {
    method: 'DELETE',
    data: (options || []),
    requestType: 'json',
  });
}
