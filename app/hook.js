const fs = require('fs-extra');
const {resolve} = require('./util');

module.exports = async app => {
  await createDir(`./run/project`, true);
  try {
    await fs.readFile(resolve(`./run/data.json`));
  } catch (e) {
    await fs.writeFile(resolve('./run/data.json'), '');
  }
  await createDir(`./.temp`);
  await createDir(`./logs`);
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