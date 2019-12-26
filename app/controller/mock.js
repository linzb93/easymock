const fs = require('fs-extra');
const Mock = require('mockjs');
const {formatRes, resolve} = require('../util');

module.exports = async (req, res) => {
  const {project_id} = req.params;
  let filePath = req.path.split('/').slice(3).join('/');
  let metaData;
  try {
    const str = await fs.readFile(resolve(`./run/project/${project_id}/meta.json`));
    metaData = JSON.parse(str);
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const {prefix = ''} = metaData;
  let retData;
  filePath = filePath.replace(prefix.slice(1), '');
  try {
    const str = await fs.readFile(resolve(`./run/project/${project_id}/${filePath}.json`));
    retData = JSON.parse(str);
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const ret = Mock.mock(retData);
  res.send(ret);
}