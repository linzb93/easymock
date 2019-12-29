const shell = require('shelljs');
const chalk = require('chalk');
const clipboardy = require('clipboardy');
const {setLocal} = require('./util/local');

const hook = require('./hook');

(async () => {
  await hook();
  if (process.env.NODE_ENV === 'development') {
    shell.exec('cross-env NODE_ENV=development nodemon app');
  } else {
    setLocal('dev_time', Date.now());
    clipboardy.writeSync('npm run start:server');
    console.log(chalk.green(`已将命令“npm run start:server”复制进剪贴板，请打开新窗口输入`));
    shell.exec('react-scripts start');
  }
})();