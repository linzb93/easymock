const fs = require('fs-extra');
const {resolve} = require('./util');

module.exports = app => {
  fs.access(resolve('./run'), fs.constants.F_OK)
  .catch(e => {
    if (e.code === 'ENOENT') {
      fs.mkdir(resolve('./run'))
    }
  });
}