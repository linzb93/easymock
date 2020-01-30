const shell = require('shelljs');
const fs = require('fs-extra');
const moment = require('moment');
const {resolve} = require('./util');
const {set, get} = require('./util/db');
const hook = require('./hook');

(async () => {
  process.env.FORCE_COLOR = 1; // shelljs使用的命令行不默认开启支持color
  await hook();
  try {
    await fs.access(resolve(`./build`));
    if (!get('prod_time') || moment(get('dev_time')).isAfter(get('prod_time'))) {
      set('prod_time', Date.now());
      shell.exec('react-scripts build && node app');
    } else {
      shell.exec('node app');
    }
  } catch (e) {
    set('prod_time', Date.now());
    shell.exec('react-scripts build && node app');
  }
})();