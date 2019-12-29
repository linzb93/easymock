const fs = require('fs-extra');
const del = require('del');
const semver = require('semver');
const {resolve} = require('./util');

module.exports = async app => {
  // Node v10.12.0支持递归创建文件夹
  if (semver.lt(process.version, '10.12.0')) {
    throw new Error('Node版本过低，请升级至v10.12.0以上');
  }
  await createDir(`./run/project`, true);
  try {
    await fs.readFile(resolve(`./run/data.json`));
  } catch (e) {
    await fs.writeFile(resolve('./run/data.json'), '');
  }
  await createDir(`./.temp`);
  await createDir(`./logs`);

  // 清理.temp文件夹
  await del(['.temp/*']);
}

async function createDir(dirPath, isRecursive) {
  try {
    await fs.readdir(resolve(dirPath));
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.mkdir(resolve(dirPath), {recursive: isRecursive});
    }
  }
}