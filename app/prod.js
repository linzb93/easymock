const shell = require('shelljs');
const fs = require('fs-extra');
const moment = require('moment');
const {resolve} = require('./util');
const {setLocal, getLocal} = require('./util/local');
const hook = require('./hook');

(async () => {
  process.env.FORCE_COLOR = 1; // shelljs使用的命令行不默认开启支持color
  await hook();
  try {
    await fs.access(resolve(`./build`));
    if (!getLocal('prod_time') || moment(getLocal('dev_time')).isAfter(getLocal('prod_time'))) {
      setLocal('prod_time', Date.now());
      shell.exec('react-scripts build && node app');
    } else {
      shell.exec('node app');
    }
  } catch (e) {
    setLocal('prod_time', Date.now());
    shell.exec('react-scripts build && node app');
  }
})();