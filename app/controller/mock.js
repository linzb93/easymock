const fs = require('fs-extra');
const Mock = require('mockjs');
const {formatRes, resolve} = require('../util');

module.exports = (req, res) => {
  const {project_id} = req.params;
  let filePath = req.path.split('/').slice(3).join('/');
  fs.readFile(resolve(`./run/${project_id}/meta.json`))
  .then(str => {
    const data = JSON.parse(str);
    const {prefix} = data;
    filePath = filePath.replace(prefix.slice(1), '');
    return fs.readFile(resolve(`./run/${project_id}/${filePath}.json`))
  })
  .then(str => {
    const data = JSON.parse(str);
    const ret = Mock.mock(data);
    res.send(ret);
  })
}