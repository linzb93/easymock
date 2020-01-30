const {project} = require('../util/db');
const uploadZip = require('../service/uploadZip');

// 获取项目列表
exports.list = async (_, res, next) => {
  let list;
  try {
    list = await project.select('*');
  } catch (e) {
    next(e);
  }
  res.send({
    message: '发送成功',
    data: list
  });
};

// 创建项目
exports.create = async (req, res, next) => {
  const {title, desc, prefix = ''} = req.body;
  try {
    await project.create({title, desc, prefix});
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '创建成功'
  });
};

// 更新项目
exports.update = async (req,res) => {
  const {title, desc, prefix = '', project_id} = req.body;
  try {
    await project.update({project_id, title, desc, prefix});
  } catch (e) {
    throw e;
  }
  res.send({
    data: null,
    message: '更新成功'
  });
}

// 获取项目详情
exports.detail = async (req,res, next) => {
  const {project_id} = req.query;
  let match = project.selectOne({
    id: project_id
  });
  let data;
  try {
    data = await match.getMeta();
  } catch (e) {
    next(e);
  }
  res.send({data});
}

// 删除项目
exports.delete = async (req,res, next) => {
  const {project_id} = req.body;
  try {
    await project.delete({id: project_id});
  } catch(e) {
    next(e);
  }
  res.send({
    data: null,
    message: '删除成功'
  });
}

// 上传项目
exports.upload = async (req, res, next) => {
  const originFile = req.files[0];
  try {
    await uploadZip(originFile);
  } catch (e) {
    next(e);
  }
  res.send({
    data: null,
    message: '上传成功'
  });
}