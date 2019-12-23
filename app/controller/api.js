const fs = require('fs-extra');
// const ow = require('ow');
const uuid = require('uuid/v4');
const Mock = require('mockjs');
const {remove} = require('lodash');
const {formatRes, resolve, jsonFormat} = require('../util');

exports.page = (req, res) => {
  const {page, size, project_id} = req.query;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    formatRes(res, {
      data: data.items
    })
  })
}
exports.preview = (req, res) => {
  const {api_id, project_id} = req.query;
  const type = req.method;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const match = data.items.filter(item => item.id === api_id)[0];
    if (match.type !== type.toLowerCase()) {
      formatRes(res, {
        error: 'client',
        message: '请求方式有误'
      })
    } else {
      const url = match.url;
      return fs.readFile(resolve(`./run/${project_id}${url}.json`))
    }
  })
  .then(str => {
    if (!str) {
      return;
    }
    const data = JSON.parse(str);
    const ret = Mock.mock(data);
    formatRes(res, {
      data: ret
    });
  });
}
exports.create = (req, res) => {
  const {project_id, url, type, title, code} = req.body;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const {items} = data;
    items.unshift({
      url,
      type,
      title,
      id: uuid()
    });
    data.items = items;
    fs.writeFile(resolve(`./run/${project_id}/meta.json`), jsonFormat(data));
    fs.writeFile(resolve(`./run/${project_id}${url}.json`), code)
    .then(() => {
      formatRes(res, {
        message: '添加成功'
      });
    })
    .catch(() => {
      const dir = url.split('/').slice(0, -1).join('/');
      fs.mkdir(resolve(`./run/${project_id}/${dir}`), {recursive: true})
      .then(() => {
        return fs.writeFile(resolve(`./run/${project_id}${url}.json`), code)
      })
      .then(() => {
        formatRes(res, {
          message: '添加成功'
        });
      });
    });
  });
}

exports.update = (req, res) => {
  const {project_id, api_id, url, type, title, code} = req.body;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const match = data.items.filter(item => item.id === api_id)[0];
    if (match.url !== url) {
      fs.unlink(resolve(`./run/${project_id}${match.url}.json`));  
    }
    match.url = url;
    match.type = type;
    match.title = title;
    fs.writeFile(resolve(`./run/${project_id}/meta.json`), jsonFormat(data));
    fs.writeFile(resolve(`./run/${project_id}${url}.json`), code)
    .then(() => {
      formatRes(res, {
        message: '修改成功'
      });
    })
    .catch(() => {
      const dir = url.split('/').slice(0, -1).join('/');
      fs.mkdir(resolve(`./run/${project_id}/${dir}`), {recursive: true})
      .then(() => {
        return fs.writeFile(resolve(`./run/${project_id}${url}.json`), code)
      })
      .then(() => {
        formatRes(res, {
          message: '修改成功'
        });
      });
    })
    
  });
}

exports.detail = (req, res) => {
  const {project_id, api_id} = req.query;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const match = data.items.filter(item => item.id === api_id)[0];
    return Promise.all([
      fs.readFile(resolve(`./run/${project_id}${match.url}.json`), 'utf8'),
      Promise.resolve({
        title: match.title,
        url: match.url,
        type: match.type
      })
    ])
  })
  .then(([str, pre_data]) => {
    formatRes(res, {
      data: {
        ...pre_data,
        code: str
      }
    })
  })
}
exports.delete = (req, res) => {
  const {project_id, api_id} = req.body;
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const {items} = data;
    const match = remove(items, item => item.id === api_id);
    const {url} = match[0];
    data.items = items;
    fs.writeFile(resolve(`./run/${project_id}/meta.json`), jsonFormat(data));
    return fs.unlink(resolve(`./run/${project_id}${url}.json`));
  })
  .then(() => {
    formatRes(res, {
      message: '删除成功'
    });
  })
}