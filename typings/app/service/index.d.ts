// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportApi from '../../../app/service/api';
import ExportImportProj from '../../../app/service/importProj';
import ExportMock from '../../../app/service/mock';
import ExportProject from '../../../app/service/project';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    api: ExportApi;
    importProj: ExportImportProj;
    mock: ExportMock;
    project: ExportProject;
    user: ExportUser;
  }
}
