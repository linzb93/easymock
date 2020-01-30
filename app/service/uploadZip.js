const fs = require('fs-extra');
const uuid = require('uuid/v4');
const stream = require('stream');
const waterfall = require('p-waterfall');
const bytes = require('bytes');
const kindOf = require('kind-of');
const {remove, flatten} = require('lodash');
const unzip = require('unzip');
const Schema = require('async-validator').default;
const path = require('path');
const through = require('through2');
const {resolve, ClientError, ServerError} = require('../util');

/**
 * 上传项目
 * 文件检验规则：
 * 1. 外层有个总文件夹
 * 2. 文件夹根目录下有meta.json
 * 3. meta.json包括title必填，prefix，desc非必填，items是必填数组，里面的格式是 url,title,type必填，验证成功后每个api会加上id
 * 4. 每个接口对应的文件路径以及文件格式，语法正确。
 * 5.验证通过后在/run/project文件夹创建一个项目文件把上面的内容放进去
 * 6.如果不能到第5步，把上面所有的错误都返回给前端
 */

// 验证文件大小
const getSize = file => {
  if (file.size > bytes('1MB')) {
    throw new ClientError('上传文件不得大于1M');
  }
  return file;
}

// 收集所有文件的stream
const collectFileStream = file => {
  const fileStream = [];
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);
  const writeStream = bufferStream.pipe(unzip.Parse());
  return new Promise((res, _) => {
    writeStream.on('entry', entry => {
      fileStream.push(entry);
    });
    writeStream.on('close', () => {
      res(fileStream);
    });
  });
}

// 验证文件正确性
const validateMeta = fileStream => {
  let errors = [];
  // 获取meta.json文件的stream
  let metaStream = remove(fileStream, entry => {
    return entry.path.split('/').slice(1).join('/') !== 'meta.json';
  });
  // 收集api文件地址，等下和meta.json里面的api地址比对
  let filePathList = fileStream
  .map(entry => {
    return entry.path.split('/').slice(1).join('/');
  });
  if (!metaStream) {
    throw new ClientError('缺少配置文件meta.json');
  }
  const metaStream1 = metaStream.pipe(through(async function(chunk, _, callback) {
    const str = chunk.toString();
    let data;
    try {
      data = JSON.parse(str);
    } catch(e) {
      throw new ClientError('meta.json文件格式不正确！');
    }
    let validator = new Schema({
      title: {
        required: true,
        message: '项目名称(title)必填'
      },
      prefix: {
        validator(value) {
          return kindOf(value) === 'string' && value[0] === '/' && value.slice(-1) !== '/';
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
    let ret = [];
    try {
      await validator.validate(data);
    } catch (e) {
      ret = e.map(item => item.message);
    }
    errors.concat(ret);
    const pMap = data.items.map(async item => {
      const {title} = item;
      let resolveItem = [];
      validator = new Schema({
        title: {
          required: true,
          message: '有个接口名称(title)不存在'
        },
        type: {
          validator(val) {
            return ['get', 'post', 'delete', 'patch', 'put'].includes(val)
          },
          message: `接口“${title}”请求类型（type）只能是get, post, delete, patch, put`
        },
        url: [
          {
            validator(value) {
              return kindOf(value) === 'string' && value[0] === '/' && value.slice(-1) !== '/';
            },
            message: `接口“${title}”地址(url)是字符串，以"/"开头，不以"/"结尾`
          },
          {
            validator(value) {
              return filePathList.includes(value);
            },
            message: `接口“${title}”缺少返回文件`
          }
        ]
      });
      try {
        await validator.validate(item);
      } catch (e) {
        resolveItem = e.map(item => item.message);
      }
      return resolveItem;
    });
    const allRes = await Promise.all(pMap);
    errors.concat(flatten(allRes));
    // 验证是否有接口url重复了
    const s = new Set();
    const urlLen = 0;
    data.items.forEach(item => {
      s.add(item.url);
      urlLen += 1;
    });
    if (s.size < urlLen) {
      errors.push('至少有两个接口重复了');
    }
    if (!errors.length) {
      const newData = {
        title: data.title,
        prefix: data.prefix,
        desc: data.desc,
        items: data.items.map(item => ({
          title: item.title,
          type: item.type,
          url: item.url,
          id: uuid()
        }))
      };
      this.push(JSON.stringify(newData));
    } else {
      this.push(JSON.stringify(data));
    }
    callback();
  }));
  if (errors.length) {
    throw new ClientError(errors);
  }
  return fileStream.concat(metaStream1);
}

const saveFiles = fileStream => {
  const projectUid = uuid();
  try {
    fs.mkdir(resolve(`run/project/${projectUid}`));
  } catch (e) {
    throw new ServerError(e);
  }
  fileStream.forEach(st => {
    const npath = `/${st.path.split('/').slice(1).join('/')}`;
    if (path.extname(npath)) {
      if (npath !== '/meta.json' && !ret.urls.includes(npath.replace('.json', ''))) {
        return;
      }
      st.pipe(fs.createWriteStream(resolve(`run/project/${projectUid}${npath}`)));
    } else {
      try {
        fs.mkdir(`./run/project/${projectUid}${npath}`, {recursive: true});
      } catch (e) {
        throw new ServerError(e);
      }
    }
  });
}

module.exports = file => {
  try {
    waterfall([
      getSize,
      collectFileStream,
      validateMeta,
      saveFiles
    ], file);
  } catch (e) {
    throw e;
  }
}