// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportApi from '../../../app/controller/api';
import ExportHome from '../../../app/controller/home';
import ExportMock from '../../../app/controller/mock';
import ExportProject from '../../../app/controller/project';
import ExportRest from '../../../app/controller/rest';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    api: ExportApi;
    home: ExportHome;
    mock: ExportMock;
    project: ExportProject;
    rest: ExportRest;
    user: ExportUser;
  }
}
