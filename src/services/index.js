import axios from 'axios';
import {stringify} from 'qs';
const baseURL = 'http://localhost:4000/api';
const service = axios.create({
  baseURL
});

service.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  return Promise.reject(error);
});

export function getProjectList() {
  return service.get('/project/list');
}

export function createProject(params) {
  return service.post('/project/create', {
    ...params
  });
}

export function updateProject(params) {
  return service.post('/project/update', {
    ...params
  });
}
export function getProjectDetail(params) {
  return service.get(`/project/detail?${stringify(params)}`);
}
export function deleteProject(params) {
  return service.post('/project/delete', {
    ...params
  });
}

export function getApiPage(params) {
  return service.get(`/api/page?${stringify(params)}`);
}

export function getApiPreview(params) {
  return service[params.type](`/api/preview?${stringify(params)}`);
}
export function createApi(params) {
  return service.post(`/api/create`, {
    ...params
  })
}
export function updateApi(params) {
  return service.post(`/api/update`, {
    ...params
  })
}
export function getApiDetail(params) {
  return service.get(`/api/detail?${stringify(params)}`);
}
export function deleteApi(params) {
  return service.post(`/api/delete`, {
    ...params
  });
}
export function exportApi(params) {
  return `${baseURL}/api/download?${stringify(params)}`
}