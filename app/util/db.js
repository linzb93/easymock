const fs = require('fs-extra');
const uuid = require('uuid/v4');
const path = require('path');
const {isPlainObject, remove} = require('lodash');
const {resolve, jsonFormat, ServerError, ClientError} = require('./');

exports.get = key => {
  const str = fs.readFileSync(resolve(`./run/data.json`), 'utf8');
  if (str !== '') {
    const data = JSON.parse(str);
    return data[key];
  }
  return '';
}
exports.set = (key, value) => {
  const str = fs.readFileSync(resolve(`./run/data.json`), 'utf8');
  let data = {};
  if (str !== '') {
    data = JSON.parse(str);
  }
  data[key] = value;
  fs.writeFileSync(resolve(`./run/data.json`), jsonFormat(data));
}

const create = async ({title, desc, prefix}) => {
  const uid = uuid();
  try {
    await fs.mkdir(resolve(`./run/project/${uid}`));
  } catch (e) {
    throw new ServerError(e);
  }
  try {
    await fs.writeFile(resolve(`./run/project/${uid}/meta.json`), jsonFormat({
      title,
      desc,
      prefix,
      items: []
    }))
  } catch(e) {
    throw new ServerError(e);
  }
  return {
    project_id: uid
  };
}

const update = async ({project_id, title, desc, prefix}) => {
  let data;
  try {
    data = await fs.readJSON(resolve(`./run/project/${project_id}/meta.json`));
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new ClientError('project不存在');
    } else {
      throw new ServerError(e);
    }
  }
  data = {
    ...data,
    title,
    desc,
    prefix
  };
  try {
    await fs.writeFile(resolve(`./run/project/${project_id}/meta.json`), jsonFormat(data));
  } catch (e) {
    throw new ServerError(e);
  }
}

const deleteProject = async ({id}) => {
  try {
    await del(resolve(`./run/project/${id}`));
  } catch(e) {
    if (e.code === 'ENOENT') {
      throw new ClientError('project不存在');
    } else {
      throw new ServerError(e);
    }
  }
}

const select = async obj => {
  let dirs;
  if (obj === '*') {
    try {
      await fs.readdir(resolve(`./run/project`));
    } catch (e) {
      throw new ServerError(e);
    }
    const pMap = dirs
    .filter(dir => !path.extname(dir)) // 避免Mac OS下读取.DS_Store
    .map(async dir => {
      let data;
      try {
        data = await fs.readJSON(resolve(`./run/project/${dir}/meta.json`));
      } catch (e) {
        throw new Error(e);
      }
      return {
        title: data.title,
        project_id: dir,
        prefix: data.prefix,
        count: data.items.length
      };
    });
    let list;
    try {
      list = await Promise.all(pMap);
    } catch(e) {
      throw new ServerError(e);
    }
    return list;
  }
  const {where, columns} = obj;
  if (isPlainObject(where)) {
    const pMap = where.ids.map(id => {
      let data;
      try {
        data = await fs.readJSON(resolve(`./run/project/${id}/meta.json`));
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw new ClientError('project不存在');
        } else {
          throw new ServerError(e);
        }
      }
      const ret = columns.reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
      return {
        project_id: dir,
        ...ret,
        count: data.items.length
      };
    });
    let list;
    try {
      list = await Promise.all(pMap);
    } catch(e) {
      throw e;
    }
    return list;
  }
}

// 只选择一个，返回一个对象
const selectOne = async ({id}) => {
  return new Project(id);
}

class Project {
  constructor(id) {
    this.id = id;
  }
  async getMeta() {
    let data;
    try {
      data = await fs.readJSON(resolve(`./run/project/${this.id}/meta.json`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ClientError('project不存在');
      } else {
        throw new ServerError(e);
      }
    }
    const {title, desc, prefix} = data;
    return {title, desc, prefix};
  }

  async create({url, type, title, code}) {
    let data;
    try {
      data = await fs.readJSON(resolve(`./run/project/${this.id}/meta.json`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ClientError('project不存在');
      } else {
        throw new ServerError(e);
      }
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
      await fs.writeFile(resolve(`./run/project/${this.id}/meta.json`), jsonFormat(data));
    } catch (e) {
      throw new ServerError(e);
    }
    try {
      await fs.writeFile(resolve(`./run/project/${this.id}${url}.json`), code);
    } catch (e) {
      const dir = url.split('/').slice(0, -1).join('/');
      await fs.mkdir(resolve(`./run/project/${this.id}/${dir}`), {recursive: true});
      await fs.writeFile(resolve(`./run/project/${this.id}${url}.json`), code);
    }
  }

  async update({api_id, url, type, title, code}) {
    let data;
    try {
      data = await fs.readJSON(resolve(`./run/project/${this.id}/meta.json`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ClientError('project不存在');
      } else {
        throw new ServerError(e);
      }
    }
    let match = data.items.filter(item => item.id === api_id)[0];
    if (match.url !== url) {
      try {
        await fs.unlink(resolve(`./run/project/${this.id}${match.url}.json`));
      } catch (e) {
        throw new ServerError(e);
      }
    }
    match = {
      ...match,
      url,
      type,
      title
    };
    try {
      await fs.writeFile(resolve(`./run/project/${this.id}/meta.json`), jsonFormat(data));
    } catch (e) {
      formatRes(res, {
        error: 'server',
        message: e
      });
      return;
    }
    try {
      await fs.writeFile(resolve(`./run/project/${this.id}${url}.json`), code);
    } catch (e) {
      const dir = url.split('/').slice(0, -1).join('/');
      await fs.mkdir(resolve(`./run/project/${this.id}/${dir}`), {recursive: true});
      await fs.writeFile(resolve(`./run/project/${this.id}${url}.json`), code);
    }
  }

  async delete({api_id}) {
    let data;
    try {
      data = await fs.readJSON(resolve(`./run/project/${this.id}/meta.json`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ClientError('project不存在');
      } else {
        throw new ServerError(e);
      }
    }
    const {items} = data;
    const match = remove(items, item => item.id === api_id);
    const {url} = match[0];
    data.items = items;
    try {
      await fs.writeFile(resolve(`./run/project/${this.id}/meta.json`), jsonFormat(data));
      await fs.unlink(resolve(`./run/project/${this.id}${url}.json`));
    } catch (e) {
      throw new ServerError(e);
    }
  }

  async selectOne({api_id}) {
    let data;
    try {
      data = await fs.readJSON(resolve(`./run/project/${this.id}/meta.json`));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ClientError('project不存在');
      } else {
        throw new ServerError(e);
      }
    }
    const match = data.items.filter(item => item.id === api_id)[0];
    let str;
    try {
      str = await fs.readFile(resolve(`./run/project/${this.id}${match.url}.json`), 'utf8');
    } catch (e) {
      throw new ServerError(e);
    }
    return {
      ...match,
      code: str
    }
  }
}

exports.project = {
  create,
  update,
  delete: deleteProject,
  select,
  selectOne
};