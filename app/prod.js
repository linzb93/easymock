const shell = require('shelljs');
const fs = require('fs-extra');
const {resolve} = require('./util');

fs.access(resolve(`./build`))
.then(() => {
  shell.exec('node app');
})
.catch(() => {
  shell.exec('react-scripts build && node app');
});