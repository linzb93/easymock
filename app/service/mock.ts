import { Service } from 'egg';
import {MysqlType, AnyObject} from '../../typings/app/service/util';
import * as pathToRegexp from 'path-to-regexp';
import * as Mock from 'mockjs';

// 新增mock响应式语法，例如"@data(id)"
function mockWrapper(template: string, {body, query}) {
  let str = typeof template === 'string' ? template : JSON.stringify(template);
  str = str
  .replace(/@query\(([a-zA-Z0-9_]+)\)/g, (_, match) => query[match])
  .replace(/@body\(([a-zA-Z0-9_]+)\)/g, (_, match) => body[match])
  return JSON.parse(str);
}

export default class extends Service {
  public async main(option: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const {path, type,query,body, project_id} = option;
    const [matchProjMeta, apiFetchList] = await Promise.all([
      mysql.get('project', {id: project_id}),
      mysql.get('api', {project_id})
    ]);
    const {prefix = ''} = matchProjMeta;
    const noPrefixPath = path.replace(prefix.slice(1), '');
    const apiList = Array.isArray(apiFetchList) ? apiFetchList : [apiFetchList];
    const matchApi = apiList.find((api: AnyObject) => {
      const reg = pathToRegexp(api.url);
      console.log(api.type ,type)
      return reg.test(noPrefixPath) && api.type === type;
    });
    if (!matchApi) {
      throw new Error('接口不存在');
    }
    const newMockTemp = mockWrapper(matchApi.code, {
      query,
      body
    });
    return Mock.mock(newMockTemp);
  }
}