import * as fs from 'fs-extra';

module.exports = class {
  async didLoad() {
    const tempIsExist = await fs.pathExists(`${process.cwd()}/.temp`);
    if (!tempIsExist) {
      fs.mkdir('.temp');
    }
  }
}