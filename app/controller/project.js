const fs = require('fs-extra');
const ow = require('ow');
const uuid = require('uuid/v4');
const {formatRes, resolve, jsonFormat} = require('../util');

exports.list = (req, res) => {
  fs.readdir(resolve('./run'))
  .then(dirs => {
    const pMap = dirs.map(dir => {
      return fs.readFile(resolve(`./run/${dir}/meta.json`))
      .then(str => {
        const data = JSON.parse(str);
        return Promise.resolve({
          title: data.title,
          project_id: dir
        });
      });
    });
    return Promise.all(pMap);
  })
  .then(list => {
    formatRes(res, {
      message: '发送成功',
      data: list
    })
  })
}

exports.create = (req, res) => {
  const {title, desc, prefix = ''} = req.body;
  const uid = uuid();
  fs.mkdir(resolve(`./run/${uid}`))
  .then(() => {
    return fs.writeFile(resolve(`./run/${uid}/meta.json`), jsonFormat({
      title,
      desc,
      prefix,
      items: []
    }))
  })
  .then(() => {
    formatRes(res, {
      data: null,
      message: '创建成功'
    });
  });
}

exports.update = (req,res) => {
  const {title, desc, prefix = '', project_id} = req.body;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    let data = JSON.parse(str);
    data.title = title;
    data.desc = desc;
    data.prefix = prefix;
    fs.writeFile(resolve(`./run/${project_id}/meta.json`), jsonFormat(data))
    .then(() => {
      formatRes(res, {
        data: null,
        message: '更新成功'
      });
    })
  })
  .catch(e => {
    if (e.code === 'ENOENT') {
      formatRes(res, {
        error: 'client',
        message: 'project不存在'
      });
    }
  })
}
exports.detail = (req,res) => {
  const {project_id} = req.query;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const {title, desc, prefix} = data;
    formatRes(res, {
      data: {
        title,
        desc,
        prefix
      }
    });
  })
}
exports.delete = (req,res) => {
  const {project_id} = req.body;
  fs.rmdir(resolve(`./run/${project_id}`))
  .then(() => {
    formatRes(res, {
      data: null,
      message: '删除成功'
    });
  })
  .catch(e => {
    if (e.code === 'ENOENT') {
      formatRes(res, {
        error: 'client',
        message: 'project不存在'
      });
    }
  })
}