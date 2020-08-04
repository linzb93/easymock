import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import {MysqlType, AnyObject} from '../../typings/app/service/util';


export default class Db extends Service {
  // 创建项目
  public async create(params: AnyObject) {
    const {name, description, prefix, username} = params;
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const project_id = uuidv4();
    await mysql.insert('project', {
      id: project_id,
      name,
      prefix,
      description,
      creator: username,
      count: 0,
      collaborators: ''
    });
    return {
      project_id
    };
  }

  // 获取项目列表
  public async select({username}: {username: string}) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const ret = await mysql.select('project', {
      where: {creator: username}
    });
    if (ret === null) {
      return [];
    } else if (!Array.isArray(ret)) {
      return [ret];
    }
    return ret;
  }

  // 获取项目详情
  public async getDetail({id}: {id: string}) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const ret = await mysql.get('project', {id});
    return ret;
  }

  // 更新项目
  public async update(params: AnyObject) {
    const {name, description, prefix, id, username, collaborators} = params;
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const ret = await mysql.update('project', {
      name,
      prefix,
      description,
      collaborators
    }, {
      where: {
        id,
        creator: username
      }
    });
    if (ret.affectedRows === 1) {
      // 更新成功
      return {
        data: true,
        message: '更新成功'
      }
    }
    return {
      data: false,
      message: '无权限更新'
    }
  }

  // 删除项目
  public async delete(params: AnyObject) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const {id, username} = params;
    const ret = await mysql.delete('project', {
      id,
      creator: username
    });
    if (ret.affectedRows === 1) {
      // 更新成功
      return {
        data: true,
        message: '删除成功'
      }
    }
    return {
      data: false,
      message: '无权限删除'
    }
  }
}
