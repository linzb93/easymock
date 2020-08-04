import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import * as preitter from 'prettier';
import {MysqlType, AnyObject} from '../../typings/app/service/util';

export default class Project extends Service {
  // 获取api列表
  public async select({project_id, page, size}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const [list, total] = await Promise.all([
      mysql.select('api', {
        where: {
          project_id
        },
        limit: size,
        offset: page * size
      }),
      mysql.query(`SELECT COUNT(*) FROM \`api\` WHERE \`project_id\` = '${project_id}'`)
    ])
    return {
      list,
      total: total[0][`COUNT(*)`]
    };
  }
  // 创建api
  public async create({name, url, type, code, project_id, username}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const projRet = await mysql.get('project', {
      id: project_id,
      creator: username
    });
    if (projRet === null) {
      throw new Error('无权限添加');
    }
    await mysql.insert('api', {
      id: uuidv4(),
      name,
      url,
      type,
      code,
      project_id
    });
  }
  // 更新api
  public async update({name, project_id, url, type, code, id, username}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const projRet = await mysql.get('project', {
      id: project_id,
      creator: username
    });
    if (projRet === null) {
      throw new Error('无权限修改');
    }
    await mysql.update('api', {
      name,
      url,
      type,
      code
    }, {
      where: {
        id
      }
    });
  }
  // 删除api
  public async delete({project_id, username, id}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const projRet = await mysql.get('project', {
      project_id,
      creator: username
    });
    if (projRet === null) {
      throw new Error('无权限删除');
    }
    await mysql.delete('project', {id});
  }
  // 获取api详情
  public async getDetail(option: AnyObject) {
    const {id} = option;
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const ret = await mysql.get('api', {id});
    return ret;
  }
  // 导出项目
  public async export({project_id}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const [projectMeta, apiList] = await Promise.all([
      mysql.get('project', {id: project_id}),
      mysql.select('api', {
        where: {project_id}
      })
    ]);
    let metaFile = {
      name: projectMeta.name,
      prefix: projectMeta.prefix,
      description: projectMeta.description,
      items: [] as any[]
    };
    const target = `${process.cwd()}/.temp/${projectMeta.name}_api.json`;
    apiList.forEach((item: AnyObject) => {
      metaFile.items.push({
        name: item.name,
        type: item.type,
        url: item.url,
        code: item.code
      });
    });
    await fs.writeFile(target, preitter.format(JSON.stringify(metaFile), {
      parser: 'json'
    }));
    return target;
  }

  // 复制api
  public async clone({api_id, project_id, username}: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const projRet = await mysql.get('project', {
      project_id,
      creator: username
    });
    if (projRet === null) {
      throw new Error('无权限复制');
    }
    const originApi = await mysql.get('api', {id: api_id});
    const newApi = {
      type: originApi.type,
      title: `${originApi.title}${new Date().getSeconds()}`,
      url: `${originApi.url}_${new Date().getTime()}`
    }
    await this.create({
      project_id,
      ...newApi,
      code: originApi.code
    });
  }
}