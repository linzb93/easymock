import { Service } from 'egg';
import * as fs from 'fs-extra';
import * as bytes from 'bytes';
import waterfall from 'p-waterfall'; 
import Schema from 'async-validator';
import {EggFile} from 'egg-multipart';

// /**
//  * 上传项目
//  * 文件检验规则：
//  * 1. 文件格式是json
//  * 2. name必填，prefix，desc非必填，items是必填数组，里面的格式是 url,name,type,code必填，验证成功后每个api会加上id
//  * 3.验证通过后导入数据库
//  * 4.如果不能到第3步，把上面所有的错误都返回给前端
//  */

interface MetaFile {
  name: string,
  prefix: string,
  desc: string,
  items: MetaItem[]
}
interface MetaItem {
  name: string,
  type: string,
  url: string,
  code: string
}

export default class extends Service {
  // 验证文件大小
  private async getSize({file, username}: {file: EggFile, username: string}) {
    const {ctx: {helper: {ClientError}}} = this;
    const stats = await fs.stat(file.filepath);
    if (stats.size > bytes('2MB')) {
      throw new ClientError('上传文件不得大于2M');
    }
    return {file, username};
  }
  // 验证文件正确性
  public async validateFile({file, username}: {file: EggFile, username: string}) {
    const targetObj:MetaFile = await fs.readJSON(file.filepath);
    let errors: string[] = [];
    const metaValidator = new Schema({
      name: {
        required: true,
        message: '项目名称(name)必填'
      },
      prefix: {
        validator(_: any, value: string) {
          return typeof value === 'string' && value[0] === '/' && value.slice(-1) !== '/';
        },
        message: '项目地址前缀(prefix)是字符串，以"/"开头，不以"/"结尾'
      },
      items: [
        {
          required: true,
          message: '项目api列表(item)必填'
        },
        {
          type: 'array',
          message: '项目api列表(item)类型必须是数组'
        }
      ]
    })
    try {
      await metaValidator.validate(targetObj);
    } catch (e) {
      errors = e.errors.map((item:{message: string}) => item.message);
    }
    if (targetObj.items.length > 1) {
      targetObj.items.forEach(async (item: MetaItem) => {
        const apiValidator = new Schema({
          title: {
            required: true,
            message: '项目名称(title)必填'
          },
          url: {
            required: true,
            message: '接口地址(url)必填'
          },
          type: {
            required: true,
            message: '请求类型(type)必填'
          },
          code: {
            required: true,
            message: '接口返回(code)必填'
          }
        });
        try {
          await apiValidator.validate(item);
        } catch (e) {
          errors.concat(e.errors.map((item:{message: string}) => item.message))
        }
      });
      // 验证是否有两个接口url和type都重复
      targetObj.items.forEach((api1: MetaItem) => {
        targetObj.items.forEach((api2: MetaItem) => {
          if (api1.url === api2.url && api1.type === api2.type) {
            errors.push(`接口${api1.name}和接口${api2.name}重复`);
          }
        })
      });
    }
    if (errors.length) {
      throw new Error(errors.join(','));
    }
    return {
      file: targetObj,
      username
    };
  }

  // 导入数据库
  public async importToDB({file, username}: {file: MetaFile, username: string}) {
    const {service: {project, api}} = this;
    const {project_id} = await project.create({
      name: file.name,
      prefix: file.prefix,
      desc: file.desc,
      username
    });
    const pImportApis = file.items.map((iApi: MetaItem) => api.create({
      ...iApi,
      username,
      project_id
    }));
    await Promise.all(pImportApis);
  }
  public async main({file, username}: {file: EggFile, username: string}) {
    try {
      await waterfall([
        this.getSize.bind(this),
        this.validateFile.bind(this),
        this.importToDB.bind(this)
      ], {file, username});
    } catch (e) {
      throw e;
    }
  }
}
