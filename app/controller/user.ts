import { Controller } from 'egg';
import * as jwt from 'jsonwebtoken';
import {AnyObject} from '../../typings/app/service/util';

export default class UserController extends Controller {
  // 登录
  public async login() {
    const {ctx, ctx: {request}, service} = this;
    ctx.validate({
      name: {type: 'string'},
      password: {type: 'string'}
    });
    const ret = await service.user.login(request.body);
    ctx.body = ret;
  }
  // 注册
  public async register() {
    const {ctx, ctx: {request}, service} = this;
    ctx.validate({
      name: {type: 'string'},
      password: {type: 'string'}
    });
    const ret = await service.user.register(request.body);
    ctx.body = ret;
  }
  // 检测用户是否存在
  public async checkExists() {
    const {ctx, ctx: {request: {query, header}}, service} = this;
    ctx.validate({
      name: {type: 'string'}
    }, query);
    const {name: username} = jwt.decode(header.token) as AnyObject;
    const ret = await service.user.checkExists({
      name: query.name,
      excludeCurUser: Boolean(query.excludeCurUser),
      username
    });
    ctx.body = ret;
  }
};