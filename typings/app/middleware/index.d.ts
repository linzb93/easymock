// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportTokenVerify from '../../../app/middleware/tokenVerify';

declare module 'egg' {
  interface IMiddleware {
    tokenVerify: typeof ExportTokenVerify;
  }
}
