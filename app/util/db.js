const fs = require('fs-extra');
const uuid = require('uuid/v4');
const path = require('path');
const produce = require('immer').default;
const archiver = require('archiver');
const globParent = require('glob-parent');
const del = require('del');
const {isPlainObject, remove} = require('lodash');
const {resolve, jsonFormat, ServerError, ClientError} = require('./');

exports.get = key => {
  const str = fs.readFileSync(resolve(`run/data.json`), 'utf8');
  if (str !== '') {
    const data = JSON.parse(str);
    return data[key];
  }
  return '';
}
exports.set = (key, value) => {
  const str = fs.readFileSync(resolve(`run/data.json`), 'utf8');
  let data = {};
  if (str !== '') {
    data = JSON.parse(str);
  }
  data[key] = value;
  fs.writeFileSync(resolve(`run/data.json`), jsonFormat(data));
}

const writeFile = async (filePath, content) => {
  try {
    await fs.writeFile(filePath, content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.mkdir(globParent(filePath), {recursive: true});
      await fs.writeFile(filePath, content);
    } else {
      throw new ServerError(e);
    }
  }
}

const readFile = async filePath => {
  let data;
  try {
    data = await fs.readFile(filePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new ClientError('文件不存在');
    } else {
      throw new ServerError(e);
    }
  }
  return data;
}

const writeMeta = async (id, content) => {
  try {
    await writeFile(resolve(`run/project/${id}/meta.json`), content);
  } catch (e) {
    throw e;
  }
}

const readMeta = async id => {
  let data;
  let str;
  try {
    str = await readFile(resolve(`run/project/${id}/meta.json`));
  } catch (e) {
    if (e instanceof ClientError) {
      throw new ClientError('project不存在');
    } else {
      throw new ServerError(e);
    }
  }
  try {
    data = JSON.parse(str);
  } catch (e) {
    throw new ServerError(e);
  }
  return data;
}

const writeCode = async (filePath, content) => {
  try {
    await writeFile(resolve(`run/project/${filePath}.json`), content);
  } catch (e) {
    throw e;
  }
}

const readCode = async filePath => {
  let data;
  try {
    data = readFile(resolve(`run/project/${filePath}.json`));
  } catch (e) {
    if (e instanceof ClientError) {
      throw new ClientError('api文件不存在');
    } else {
      throw new ServerError(e);
    }
  }
  return data;
}

const create = async ({title, desc, prefix}) => {
  const uid = uuid();
  try {
    await writeMeta(uid, jsonFormat({
      title,
      desc,
      prefix,
      items: []
    }))
  } catch(e) {
    throw e;
  }
  return {
    project_id: uid
  };
}

const update = async ({project_id, title, desc, prefix}) => {
  let data;
  try {
    data = await readMeta(project_id);
  } catch (e) {
    throw e;
  }
  try {
    await writeMeta(project_id, jsonFormat({
      ...data,
      title,
      desc,
      prefix
    }));
  } catch (e) {
    throw e;
  }
}

const deleteProject = async ({id}) => {
  try {
    await del(resolve(`run/project/${id}`));
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
      dirs = await fs.readdir(resolve(`run/project`));
    } catch (e) {
      throw new ServerError(e);
    }
    const pMap = dirs
    .filter(dir => !path.extname(dir)) // 避免Mac OS下读取.DS_Store
    .map(async dir => {
      let data;
      try {
        data = await readMeta(dir);
      } catch (e) {
        throw e;
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
      throw e;
    }
    return list;
  }
  const {where, columns} = obj;
  if (isPlainObject(where)) {
    const pMap = where.ids.map(async id => {
      let data;
      try {
        data = await readMeta(id);
      } catch (e) {
        throw e;
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
const selectOne = ({id}) => {
  return new Project(id);
}

class Project {
  constructor(id) {
    this.id = id;
  }
  async getMeta() {
    let data;
    try {
      data = await readMeta(this.id);
    } catch (e) {
      throw e;
    }
    const {title, desc, prefix} = data;
    return {title, desc, prefix};
  }
  
  async create({url, type, title, code}) {
    let data;
    try {
      data = await readMeta(this.id);
    } catch (e) {
      throw e;
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
      await writeMeta(this.id, jsonFormat(data));
    } catch (e) {
      throw e;
    }
    try {
      await writeCode(`${this.id}${url}`, code);
    } catch (e) {
      throw e;
    }
  }
  
  async update({api_id, url, type, title, code}) {
    let data;
    try {
      data = await readMeta(this.id);
    } catch (e) {
      throw e;
    }
    let match = data.items.filter(item => item.id === api_id)[0];
    let matchIndex = data.items.findIndex(item => item.id === api_id);
    if (match.url !== url) {
      try {
        await fs.unlink(resolve(`./run/project/${this.id}${match.url}.json`));
      } catch (e) {
        throw new ServerError(e);
      }
    }
    const nextItems = produce(data.items, draftItems => {
      draftItems[matchIndex] = {
        ...match,
        url,
        type,
        title
      }
    });
    data.items = nextItems;
    try {
      await writeMeta(this.id, jsonFormat(data));
    } catch (e) {
      throw e;
    }
    try {
      await writeCode(`${this.id}${url}`, code);
    } catch (e) {
      throw e;
    }
  }
  
  async delete({api_id}) {
    let data;
    try {
      data = await readMeta(this.id);
    } catch (e) {
      throw e;
    }
    const {items} = data;
    const match = remove(items, item => item.id === api_id);
    const {url} = match[0];
    data.items = items;
    try {
      await writeMeta(this.id, jsonFormat(data));
      await fs.unlink(resolve(`./run/project/${this.id}${url}.json`));
    } catch (e) {
      throw new ServerError(e);
    }
  }
  
  // 返回多条数据，不含code
  async select(obj) {
    let data;
    try {
      data = await readMeta(this.id)
    } catch (e) {
      throw e;
    }
    let match;
    if (obj === '*') {
      match = data.items;
    } else if (isPlainObject(obj)) {
      const {where, offset, limit} = obj;
      match = data.items
      .filter(item => where ? where(item) : true)
      .filter((_, index) => index >= offset && index < offset + limit);
    }
    return {
      list: match,
      total: data.items.length
    }
  }
  
  // 返回单条数据，包含code
  async selectOne({api_id, url}) {
    let match;
    if (api_id) {
      let data;
      try {
        data = await readMeta(this.id);
      } catch (e) {
        throw e;
      }
      match = data.items.filter(item => item.id === api_id);
      if (!match.length) {
        throw new ClientError('api不存在');
      }
      url = match[0].url;
    }
    let code;
    try {
      code = await readCode(`${this.id}${url}`);
    } catch (e) {
      throw e;
    }
    return {
      ...match[0],
      code
    };
  }
  
  async copyFile(originFile, destFile) {
    try {
      await fs.copyFile(resolve(`run/project/${this.id}${originFile}.json`), resolve(`run/project/${this.id}${destFile}.json`));
    } catch (e) {
      throw new ServerError(e);
    }
  }
  
  async export() {
    return new Promise((res, rej) => {
      const uid = uuid();
      let output = fs.createWriteStream(resolve(`.temp/${uid}.zip`));
      let archive = archiver('zip', {
        zlib: {level: 9}
      });
      output.on('close', () => {
        res(resolve(`.temp/${uid}.zip`));
      });
      archive.on('error', err => {
        rej(err);
      });
      archive.pipe(output);
      archive.directory(`${process.cwd()}/run/project/${this.id}/`, `${this.id}`);
      archive.finalize();
    });
  }
}

exports.project = {
  create,
  update,
  delete: deleteProject,
  select,
  selectOne
};