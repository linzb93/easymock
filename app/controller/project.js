const fs = require('fs-extra');
const uuid = require('uuid/v4');
const del = require('del');
const stream = require('stream');
const unzip = require('unzip');
const path = require('path');
const through = require('through2');
const {formatRes, resolve, jsonFormat} = require('../util');

// 获取项目列表
exports.list = async (_, res) => {
  let dirs;
  try {
    dirs = await fs.readdir(resolve('./run/project'));
  } catch(e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const pMap = dirs.map(async dir => {
    let data;
    try {
      const str = await fs.readFile(resolve(`./run/project/${dir}/meta.json`));
      data = JSON.parse(str);
    } catch (e) {
      return Promise.reject(e);
    }
    return Promise.resolve({
      title: data.title,
      project_id: dir,
      count: data.items.length
    });
  });
  let list;
  try {
    list = await Promise.all(pMap);
  } catch(e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    message: '发送成功',
    data: list
  });
};

// 创建项目
exports.create = async (req, res) => {
  const {title, desc, prefix = ''} = req.body;
  const uid = uuid();
  try {
    await fs.mkdir(resolve(`./run/project/${uid}`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  try {
    await fs.writeFile(resolve(`./run/project/${uid}/meta.json`), jsonFormat({
      title,
      desc,
      prefix,
      items: []
    }))
  } catch(e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    data: null,
    message: '创建成功'
  });
};

// 更新项目
exports.update = async (req,res) => {
  const {title, desc, prefix = '', project_id} = req.body;
  let data;
  try {
    const str = await fs.readFile(resolve(`./run/project/${project_id}/meta.json`));
    data = JSON.parse(str);
  } catch (e) {
    if (e.code === 'ENOENT') {
      formatRes(res, {
        error: 'client',
        message: 'project不存在'
      });
    } else {
      formatRes(res, {
        error: 'server',
        message: e
      });
    }
    return;
  }
  data = {
    ...data,
    title,
    desc,
    prefix
  }
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    data: null,
    message: '更新成功'
  });
}

// 获取项目详情
exports.detail = async (req,res) => {
  const {project_id} = req.query;
  let data;
  try {
    const str = await fs.readFile(resolve(`./run/project/${project_id}/meta.json`));
    data = JSON.parse(str);
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const {title, desc, prefix = ''} = data;
  formatRes(res, {
    data: {
      title,
      desc,
      prefix
    }
  });
}

// 删除项目
exports.delete = async (req,res) => {
  const {project_id} = req.body;
  try {
    await del(resolve(`./run/project/${project_id}`));
  } catch(e) {
    if (e.code === 'ENOENT') {
      formatRes(res, {
        error: 'client',
        message: 'project不存在'
      });
    } else {
      formatRes(res, {
        error: 'server',
        message: e
      });
    }
    return;
  }
  formatRes(res, {
    data: null,
    message: '删除成功'
  });
}

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
exports.upload = (req, res) => {
  let ret = {
    has_meta: false, // 根目录下是否有meta.json
    meta_error: false, // meta.json是否有误
    errors: [],
    urls: [],
    streams: []
  }
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.files[0].buffer);
  const writeStream = bufferStream.pipe(unzip.Parse());
  writeStream.on('entry', async entry => {
    const filePath = entry.path.split('/').slice(1).join('/');
    if (filePath === 'meta.json') {
      ret.has_meta = true;
      const metaStream = entry.pipe(through(function(chunk, enc, callback) {
        const str = chunk.toString();
        let data;
        try {
          data = JSON.parse(str);
        } catch(e) {
          ret.errors.push('meta.json 文件格式不正确！');
          meta_error = true;
          return;
        }
        if (data.title === undefined || data.title === '') {
          ret.errors.push('项目名称（title）不存在！');
          meta_error = true;
        }
        if (data.prefix) {
          if (!data.prefix.startsWith('/')) {
            ret.errors.push('项目地址前缀（prefix）必须以“/”开头');
            meta_error = true;
          } else if (data.prefix.endsWith('/')) {
            ret.errors.push('项目地址前缀（prefix）不需要以“/”结尾');
            meta_error = true;
          }
        }
        if (!data.items || !Array.isArray(data.items)) {
          ret.errors.push('项目api列表（items）必须是数组！');
          meta_error = true;
        } else {
          // 如果出现接口不规范的，提示一次就可以了
          let hasError = false;
          data.items.forEach(item => {
            if (hasError) {
              return;
            }
            if (!item.title) {
              ret.errors.push('有个接口名称（title）不存在！');
              hasError = true;
              meta_error = true;
            }
            if (!['get', 'post', 'delete', 'patch', 'put'].includes(item.type)) {
              ret.errors.push('请求类型（type）只能是get, post, delete, patch, put');
              hasError = true;
              meta_error = true;
            }
            if (!item.url) {
              ret.errors.push('有个接口地址（url）不存在！');
              hasError = true;
              meta_error = true;
            }
          });
          // 接口没有不规范的，为每个接口打上uuid
          if (!hasError) {
            for (let i = 0, len = data.items.length; i < len; i++) {
              data.items[i].id = uuid();
              ret.urls.push(data.items[i].url);
            }
            const s = new Set();
            ret.urls.forEach(x => s.add(x));
            if (s.size < ret.urls.length) {
              ret.errors.push('至少有两个接口url重复了');
              meta_error = true;
            }
          }
        }
        this.push(JSON.stringify(data));
        callback();
      }));
      metaStream.path = entry.path;
      ret.streams.push(metaStream);
    } else {
      if (ret.meta_error) {
        return;
      }
      // 只收文件夹和json文件
      if (!path.extname(filePath)) {
        ret.streams.push(entry);
      } else if (path.extname(filePath) == '.json') {
        ret.streams.push(entry);
      }
    }
  });
  writeStream.on('close', () => {
    if (!ret.has_meta) {
      formatRes(res, {
        data: {
          success: false,
          errors: ['缺少配置文件meta.json']
        }
      });
      return;
    } else if (ret.urls.meta_error) {
      formatRes(res, {
        data: {
          success: false,
          errors: ret.errors
        }
      });
      return;
    }
    const fileUrlList = ret.streams
    .filter(st => {
      const npath = st.path.split('/').slice(1).join('/');
      return path.extname(npath) && npath !== 'meta.json';
    })
    .map(st => {
      return `/${st.path.split('/').slice(1).join('/').replace('.json', '')}`; 
    });
    ret.urls.forEach(item => {
      if (!fileUrlList.includes(item)) {
        ret.errors.push(`接口 ${item} 缺少返回文件`);
      }
    });
    if (ret.errors.length) {
      formatRes(res, {
        data: {
          success: false,
          errors: ret.errors
        }
      });
    } else {
      // 验证全部通过，可以导入
      const projectUid = uuid();
      try {
        fs.mkdir(resolve(`./run/project/${projectUid}`));
      } catch (e) {
        formatRes(res, {
          error: 'server',
          message: e
        });
        return;
      }
      ret.streams.forEach(st => {
        const npath = `/${st.path.split('/').slice(1).join('/')}`;
        if (path.extname(npath)) {
          if (npath !== '/meta.json' && !ret.urls.includes(npath.replace('.json', ''))) {
            return;
          }
          st.pipe(fs.createWriteStream(resolve(`./run/project/${projectUid}${npath}`)));
        } else {
          fs.mkdir(`./run/project/${projectUid}${npath}`, {recursive: true});
        }
      })
      formatRes(res, {
        data: {
          success: true
        },
        message: '项目导入成功'
      });
    }
  });
}