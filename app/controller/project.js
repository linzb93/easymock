const fs = require('fs-extra');
const ow = require('ow');
const uuid = require('uuid/v4');
const del = require('del');
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
      project_id: dir
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