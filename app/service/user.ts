import { Service } from 'egg';
import {MysqlType, AnyObject} from '../../typings/app/service/util';
import {randomBytes, createHmac} from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

interface LoginData {
  name: string,
  password: string
}

const loginRet = {
  SUCCESS: {
    code: 0,
    message: '登录成功'
  },
  FAIL: {
    code: 1,
    message: '密码不正确'
  },
  NO_REGIST: {
    code: 2,
    message: '账号未注册'
  }
};
const A_WEEK = 7 * 24 * 60 * 60; // 一周的秒数

export default class User extends Service {
  // 登录
  public async login(data: LoginData) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const matchUser = await mysql.get('user', {
      name: data.name
    });;
    if (matchUser === null) {
      return loginRet.NO_REGIST;
    }
    const {password: inputPwd} = data;
    const {salt: secrectKey} = matchUser;
    const signture = createHmac('sha1', secrectKey);
    signture.update(inputPwd);
    const cipher = signture.digest().toString('base64');
    if (cipher === matchUser.password) {
      // 密码正确，生成token返回
      const token = jwt.sign({name: data.name}, 'shhhhh', {
        expiresIn: A_WEEK
      });
      return {
        data: {token},
        ...loginRet.SUCCESS
      }
    } else {
      return loginRet.FAIL;
    }
  }
  // 注册
  public async register(data: LoginData) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    const {password: inputPwd} = data;
    const secrectKey = randomBytes(16).toString('hex');
    const signture = createHmac('sha1', secrectKey);
    signture.update(inputPwd);
    const cipher = signture.digest().toString('base64');
    await mysql.insert('user', {
      id: uuidv4(),
      name: data.name,
      salt: secrectKey,
      password: cipher
    });
    const token = jwt.sign({name: data.name}, 'shhhhh', {
      expiresIn: A_WEEK
    });
    return {
      token
    };
  }
  // 检测用户是否存在
  public async checkExists({name, excludeCurUser, username}: {name: string, excludeCurUser: boolean, username: string}) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    if (name === username && excludeCurUser) {
      return {
        message: '查找用户不能为当前登录用户',
        data: false
      }
    }
    const ret = await mysql.get('user', {name});
    if (ret === null) {
      return {
        message: '用户不存在',
        data: false
      }
    }
    return {
      message: '用户存在',
      data: true
    }
  }
  // token验证
  public async check(token: string) {
    const {app} = this;
    const {mysql}: {mysql: MysqlType} = app as any;
    try {
      jwt.verify(token,'shhhhh');
    } catch (e) {
      return {
        code: 'TOKEN_OVERDUE',
        message: 'token已过期，请重新登录'
      }
    }
    const {name} = jwt.decode(token) as AnyObject;
    const match = await mysql.get('user', {name});
    if (match === null) {
      return {
        code: 'TOKEN_UNKNOWN',
        message: '用户不存在，请重新登录'
      }
    } else {
      return {
        code: 'SUCCESS',
        name,
        message: 'token验证通过'
      }
    }
  }
}