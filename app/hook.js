const fs = require('fs-extra');
const {resolve} = require('./util');

module.exports = app => {
  fs.readdir(resolve('./run'), fs.constants.F_OK)
  .catch(e => {
    if (e.code === 'ENOENT') {
      fs.mkdir(resolve('./run'))
    }
  });
  fs.readdir(resolve('./.temp'), fs.constants.F_OK)
  // .then(files => {
  //   files.forEach(file => {
  //     console.log(resolve(`./.temp/${file}`));
  //     fs.unlink(resolve(`./.temp/${file}`));
  //   });
  // })
  .catch(e => {
    if (e.code === 'ENOENT') {
      fs.mkdir(resolve('./.temp'))
    }
  });
}