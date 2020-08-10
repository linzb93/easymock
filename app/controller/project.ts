import { Controller } from 'egg';
import * as jwt from 'jsonwebtoken';
import {AnyObject} from '../../typings/app/service/util';

export default class extends Controller {
  // 获取项目列表
  public async list() {
    const {ctx, ctx: {request: {header}}, service: {project}} = this;
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const ret = await project.select({
      username
    });
    ctx.body = {
      message: '发送成功',
      data: ret
    };
  }
  
  // 创建项目
  public async create() {
    const {ctx, ctx: {request: {body, header}}, service: {project}} = this;
    ctx.validate({
      name: {type: 'string'},
      prefix: {type: 'string'}
    });
    const {name, description, prefix = ''} = body;
    const {name: username} = jwt.decode(header.token) as AnyObject;
    await project.create({name, description, prefix, username});
    ctx.body = {
      message: '创建成功'
    };
  };
  
  // 更新项目
  public async update () {
    const {ctx, ctx: {request: {body, header}}, service: {project}} = this;
    ctx.validate({
      name: {type: 'string'},
      prefix: {type: 'string'},
      id: {type: 'string'}
    });
    const {name, description, prefix = '', collaborators, id} = body;
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const ret = await project.update({id, name, description, prefix,collaborators, username});
    ctx.body = ret;
  }
  
  // 获取项目详情
  public async detail() {
    const {ctx, ctx: {request: {query}}, service: {project}} = this;
    const {id} = query;
    ctx.validate({
      id: {type: 'string'}
    }, query);
    const data = await project.getDetail({
      id
    });
    ctx.body = {
      message: '获取项目详情成功',
      data
    };
  }
  
  // 删除项目
  public async delete () {
    const {ctx, ctx: {request: {body, header}}, service: {project}} = this;
    ctx.validate({
      id: {type: 'string'}
    });
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const ret = await project.delete({
      id: body.id,
      username
    });
    ctx.body = ret;
  }
  
  // 上传项目
  public async upload() {
    const {ctx, ctx: {request: {files, header}}, service: {importProj}} = this;
    const {name: username} = jwt.decode(header.token) as AnyObject;
    let resp = {};
    try {
      await importProj.main({
        file: files[0],
        username
      });
      resp = {
        code: 'SUCCESS',
        data: null,
        message: '上传成功'
      };
    } catch (e) {
      resp = {
        code: 'UPLOAD_ERROR',
        data: {
          errors: e
        },
        message: '上传失败'
      }
    }
    ctx.body = resp;
  }
}
