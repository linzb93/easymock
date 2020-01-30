const fs = require('fs-extra');
const Mock = require('mockjs');
const {niceTry, resolve} = require('../util');
const {project} = require('../util/db');

module.exports = async (req, res) => {
  const {project_id} = req.params;
  let filePath = req.path.split('/').slice(3).join('/');
  let match = await project.selectOne({
    id: project_id
  });
  let metaData;
  try {
    metaData = match.getMeta();
  } catch (e) {
    throw e;
  }
  const {prefix = ''} = metaData;
  let retData;
  filePath = filePath.replace(prefix.slice(1), '');
  try {
    retData = await match.selectOne({
      url: filePath
    });
  } catch (e) {
    throw e;
  }
  res.send(Mock.mock(retData));
}