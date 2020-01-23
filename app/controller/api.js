const fs = require('fs-extra');
const Mock = require('mockjs');
const {remove} = require('lodash');
const archiver = require('archiver');
const {formatRes, resolve, jsonFormat} = require('../util');

// 获取项目api分页
exports.page = async (req, res) => {
  const {page = 1, size = 10, project_id} = req.query;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    data: {
      list: data.items.filter((_, index) => {
        return index >= (page - 1) * size && index < page * size
      }),
      total: data.items.length
    }
  })
}

// 预览项目api
exports.preview = async (req, res) => {
  const {api_id, project_id} = req.query;
  const type = req.method;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`), 'utf8');
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
  }
  const match = data.items.filter(item => item.id === api_id)[0];
  if (match.type !== type.toLowerCase()) {
    formatRes(res, {
      error: 'client',
      message: '请求方式有误'
    });
    return;
  }
  const url = match.url;
  let originData;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}${url}.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const ret = Mock.mock(originData);
  formatRes(res, {
    data: ret
  });
}

// 创建项目api
exports.create = async (req, res) => {
  const {project_id, url, type, title, code} = req.body;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const {items} = data;
  items.unshift({
    url,
    type,
    title,
    id: uuid()
  });
  data.items = items;
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}${url}.json`), code);
  } catch (e) {
    const dir = url.split('/').slice(0, -1).join('/');
    await fs.mkdir(resolve(`./run/project/${project_id}/${dir}`), {recursive: true});
    await fs.writeFile(resolve(`./run/project/${project_id}${url}.json`), code);
  }
  formatRes(res, {
    message: '添加成功'
  });
}

// 更新项目api
exports.update = async (req, res) => {
  const {project_id, api_id, url, type, title, code} = req.body;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  let match = data.items.filter(item => item.id === api_id)[0];
  if (match.url !== url) {
    try {
      await fs.unlink(resolve(`./run/project/${project_id}${match.url}.json`));
    } catch (e) {
      formatRes(res, {
        error: 'server',
        message: e
      });
      return;
    }
  }
  match = {
    ...match,
    url,
    type,
    title
  };
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}${url}.json`), code);
  } catch (e) {
    const dir = url.split('/').slice(0, -1).join('/');
    await fs.mkdir(resolve(`./run/project/${project_id}/${dir}`), {recursive: true});
    await fs.writeFile(resolve(`./run/project/${project_id}${url}.json`), code);
  }
  formatRes(res, {
    message: '修改成功'
  });
}

// 获取项目api详情
exports.detail = async (req, res) => {
  const {project_id, api_id} = req.query;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const match = data.items.filter(item => item.id === api_id)[0];
  let str;
  try {
    str = await fs.readFile(resolve(`./run/project/${project_id}${match.url}.json`), 'utf8');
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    data: {
      ...match,
      code: str
    }
  });
}

// 删除项目api
exports.delete = async (req, res) => {
  const {project_id, api_id} = req.body;
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const {items} = data;
  const match = remove(items, item => item.id === api_id);
  const {url} = match[0];
  data.items = items;
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
    await fs.unlink(resolve(`./run/project/${project_id}${url}.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    message: '删除成功'
  });
}

// 下载项目api压缩包
exports.download = async (req, res) => {
  const {project_id} = req.query;
  let data;
  try {
    data = await fs.readJson(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const {title} = data;
  const uid = uuid();
  let output = fs.createWriteStream(resolve(`./.temp/${uid}.zip`));
  let archive = archiver('zip', {
    zlib: {level: 9}
  });
  output.on('close', () => {
    res.download(resolve(`./.temp/${uid}.zip`));
  });
  archive.on('error', err => {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  });
  archive.pipe(output);
  archive.directory(`${process.cwd()}/run/project/${project_id}/`, `${project_id}`);
  archive.finalize();
}

// 复制项目api
exports.clone = async (req, res) => {
  const {project_id, api_id} = req.body;
  let data;
  try {
    data = await fs.readJson(`./run/project/${project_id}/meta.json`);
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const match = data.items.filter(item => item.id === api_id)[0];
  const newApi = {...match};
  newApi.id = uuid();
  newApi.title += `${new Date().getSeconds()}`;
  newApi.url += `_${new Date().getTime()}`;
  data.items.unshift(newApi);
  try {
    fs.copyFile(resolve(`./run/project/${project_id}${match.url}.json`), resolve(`./run/project/${project_id}${newApi.url}.json`));
    fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  formatRes(res, {
    message: '接口复制成功'
  });
}