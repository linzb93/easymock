const shell = require('shelljs');
const chalk = require('chalk');
const {setLocal} = require('./util/local');

const hook = require('./hook');

(async () => {
  await hook();
  if (process.env.NODE_ENV === 'development') {
    shell.exec('cross-env NODE_ENV=development nodemon app');
  } else {
    setLocal('dev_time', Date.now());
    console.log(chalk.green(`请打开新窗口，输入：npm run start:server`));
    shell.exec('react-scripts start');
  }
})();