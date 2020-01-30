const Mock = require('mockjs');
const {ClientError} = require('../util');
const {project} = require('../util/db');

// 获取项目api分页
exports.page = async (req, res, next) => {
  const {page = 1, size = 10, project_id} = req.query;
  let match = project.selectOne({
    id: project_id
  });
  let data;
  try {
    data = await match.select({
      offset: size * (page - 1),
      limit: size
    });
  } catch (e) {
    next(e);
  }
  res.send({
    message: '获取项目api分页成功',
    data
  });
}

// 预览项目api
exports.preview = async (req, res, next) => {
  const {api_id, project_id} = req.query;
  const type = req.method;
  let match = project.selectOne({
    id: project_id
  });
  let meta;
  try {
    meta = await match.getMeta();
  } catch (e) {
    next(e);
  }
  let data;
  try {
    data = await match.selectOne({
      api_id
    });
  } catch (e) {
    next(e);
  }
  if (data.type !== type.toLowerCase()) {
    next(new ClientError('请求方式有误'));
  }
  res.send({
    data: Mock.mock(data.code)
  });
}

// 创建项目api
exports.create = async (req, res, next) => {
  const {project_id, url, type, title, code} = req.body;
  let match = project.selectOne({
    id: project_id
  });
  try {
    await match.create({
      url,
      type,
      title,
      code
    });
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '添加成功'
  });
}

// 更新项目api
exports.update = async (req, res, next) => {
  const {project_id, api_id, url, type, title, code} = req.body;
  let match = project.selectOne({
    id: project_id
  });
  try {
    await match.update({
      api_id,
      url,
      type,
      title,
      code
    });
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '修改成功'
  });
}

// 获取项目api详情
exports.detail = async (req, res, next) => {
  const {project_id, api_id} = req.query;
  let match = project.selectOne({
    id: project_id
  });
  let data;
  try {
    data = await match.selectOne({
      api_id
    });
  } catch (e) {
    next(e);
  }
  res.send({
    message: '获取项目api详情成功',
    data
  });
}

// 删除项目api
exports.delete = async (req, res, next) => {
  const {project_id, api_id} = req.body;
  let match = project.selectOne({
    id: project_id
  });
  try {
    await match.delete({
      api_id
    });
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '删除成功'
  });
}

// 下载项目api压缩包
exports.download = async (req, res, next) => {
  const {project_id} = req.query;
  let match = project.selectOne({
    id: project_id
  });
  let downloadUrl = '';
  try {
    downloadUrl = await match.export();
  } catch (e) {
    next(e);
  }
  res.download(downloadUrl);
}

// 复制项目api
exports.clone = async (req, res, next) => {
  const {project_id, api_id} = req.body;
  let match = project.selectOne({
    id: project_id
  });
  let data;
  try {
    data = await match.selectOne({
      api_id
    });
  } catch (e) {
    next(e);
  }
  const newApi = {
    type: data.type
  };
  newApi.title = `${data.title}${new Date().getSeconds()}`;
  newApi.url = `${data.url}_${new Date().getTime()}`;
  try {
    await match.copyFile(data.url, newApi.url);
  } catch (e) {
    next(e);
  }
  try {
    await match.create({
      title: newApi.title,
      url: newApi.url,
      type: data.type
    });
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '接口复制成功'
  });
}