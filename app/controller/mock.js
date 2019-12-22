const fs = require('fs-extra');
const Mock = require('mockjs');
const {formatRes, resolve} = require('../util');

module.exports = (req, res) => {
  const {project_id} = req.params;
  const filePath = req.path.split('/').slice(3).join('/');
  fs.readFile(resolve(`./run/${project_id}/${filePath}`))
  .then(str => {
    const data = JSON.parse(str);
    const ret = Mock.mock(data);
    formatRes(res, {
      data: ret
    })
  })
}