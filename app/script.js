// 这里是人为处理的实践，与项目关系不大。
const inquirer = require('inquirer');
const  fs = require('fs-extra');
const cliCursor = require('cli-cursor');
const clearConsole = require('react-dev-utils/clearConsole');
const {resolve} = require('./util');

(async () => {
  cliCursor.hide();
  const {task} = await inquirer.prompt([
    {
      type: 'list',
      name: 'task',
      message: '请选择要执行的任务：',
      choices: [
        '清理.DS_Store',
        '清理日志',
        '退出'
      ]
    }
  ]);
  switch (task) {
    case '清理.DS_Store':
      fs.unlink(resolve(`./run/project/.DS_Store`))
      .then(() => {
        console.log('清理成功');
        afterExec();
      })
      .catch(() => {
        console.log('文件不存在，不需要清理');
        afterExec();
      })
      break;
    case '清理日志':
      fs.writeFile(resolve(`./logs/error.log`), '')
      .then(() => {
        console.log('清理成功');
        afterExec();
      });
      break;
    default:
      afterExec();
      break;
  }

  function afterExec() {
    setTimeout(() => {
      clearConsole();
      cliCursor.show();
    }, 1000);
  }
})();
