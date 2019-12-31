import axios from 'axios';
import {stringify} from 'qs';
const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api' : '/api';

const service = axios.create({
  baseURL
});
service.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  return Promise.reject(error);
});

/**
 * 项目
 */
// 获取项目列表
export function getProjectList() {
  return service.get('/project/list');
}
// 创建项目
export function createProject(params) {
  return service.post('/project/create', {
    ...params
  });
}
// 编辑项目
export function updateProject(params) {
  return service.post('/project/update', {
    ...params
  });
}
// 获取项目详情
export function getProjectDetail(params) {
  return service.get(`/project/detail?${stringify(params)}`);
}
// 删除项目
export function deleteProject(params) {
  return service.post('/project/delete', {
    ...params
  });
}
// 导入项目的接口地址
export const uploadProjectUrl = `${baseURL}/project/upload`;

/**
 * 接口
 */
// 获取接口地址
export function getApiPage(params) {
  return service.get(`/api/page?${stringify(params)}`);
}
// 预览接口
export function getApiPreview(params) {
  return service[params.type](`/api/preview?${stringify(params)}`);
}
// 创建接口
export function createApi(params) {
  return service.post(`/api/create`, {
    ...params
  })
}
// 更新接口
export function updateApi(params) {
  return service.post(`/api/update`, {
    ...params
  })
}
// 获取接口详情
export function getApiDetail(params) {
  return service.get(`/api/detail?${stringify(params)}`);
}
// 删除接口
export function deleteApi(params) {
  return service.post(`/api/delete`, {
    ...params
  });
}
// 导出所有接口
export function exportApi(params) {
  return `${baseURL}/api/download?${stringify(params)}`
}
// 复制接口
export function cloneApi(params) {
  return service.post(`/api/clone`, {
    ...params
  });
}

/**
 * 其他
 */
// 在VsCode中打开
export function openVscode(params) {
  return service.post(`/open_vscode`, {
    ...params
  });
}
// 文件下载
export function fileDownload(params) {
  return `${baseURL}/download?${stringify(params)}`
}