import { Controller } from 'egg';
import * as jwt from 'jsonwebtoken';
import {createReadStream} from 'fs';
import {AnyObject} from '../../typings/app/service/util';
// import * as Mock from 'mockjs';

export default class ApiController extends Controller {
  // 获取项目api分页
  public async page () {
    const {ctx, ctx: {request: {query}}, service: {api}} = this;
    const {page = 1, size = 10, project_id} = query;
    ctx.validate({
      project_id: {type: 'string'}
    }, query);
    const data = await api.select({
      project_id,
      offset: Number(size) * (Number(page) - 1),
      limit: Number(size)
    });
    ctx.body = {
      message: '获取项目api分页成功',
      data
    };
  }
  // 创建项目api
  public async create() {
    const {ctx, ctx: {request: {body, header}}, service: {api}} = this;
    ctx.validate({
      project_id: {type: 'string'},
      url: {type: 'string'},
      type: {type: 'string'},
      name: {type: 'string'},
      code: {type: 'string'}
    });
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const {project_id, url, type, name, code} = body;
    await api.create({
      project_id,
      url,
      type,
      name,
      code,
      username
    })
    ctx.body = {
      data: null,
      message: '添加成功'
    };
  }

  // 更新项目api
  public async update() {
    const {ctx, ctx: {request: {body, header}}, service: {api}} = this;
    ctx.validate({
      id: {type: 'string'},
      url: {type: 'string'},
      type: {type: 'string'},
      name: {type: 'string'},
      code: {type: 'string'}
    });
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const {id, url, type, name, code, project_id} = body;
    await api.update({
      username,
      project_id,
      id,
      name,
      type,
      url,
      code
    })
    ctx.body = {
      data: null,
      message: '修改成功'
    };
  }

  // 获取项目api详情
  public async detail() {
    const {ctx, ctx: {request: {query}}, service: {api}} = this;
    ctx.validate({
      id: {type: 'string'}
    }, query);
    const {id} = query;
    const data = await api.getDetail({id});
    ctx.body = {
      message: '获取项目api详情成功',
      data
    };
  }

  // 删除项目api
  public async delete () {
    const {ctx, ctx: {request: {body}}, service: {api}} = this;
    ctx.validate({
      id: {type: 'string'}
    });
    const {id} = body;
    await api.delete({id});
    ctx.body = {
      data: null,
      message: '删除成功'
    };
  }

// 下载项目api压缩包
  public async download() {
    const {ctx, ctx: {request}, service: {api}} = this;
    const {project_id} = request.query;
    let downloadUrl = '';
    downloadUrl = await api.export({
      project_id
    });
    ctx.attachment(downloadUrl);
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.body = createReadStream(downloadUrl);
    // ctx.body = downloadUrl;
  }

  // 复制项目api
  public async clone() {
    const {ctx, ctx: {request: {body}}, service: {api}} = this;
    ctx.validate({
      id: {type: 'string'}
    });
    const {project_id, id} = body;
    await api.clone({
      project_id,
      id
    });
    ctx.body = {
      data: null,
      message: '接口复制成功'
    };
  }
}