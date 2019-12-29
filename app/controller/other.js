const shell = require('shelljs');
const fs = require('fs-extra');
const address = require('address');
const {resolve, formatRes} = require('../util');
exports.open_vscode = async (req, res) => {
  const {ip, body} = req;
  const {project_id, api_id} = body;
  let data;
  try {
    const str = await fs.readFile(resolve(`./run/project/${project_id}/meta.json`));
    data = JSON.parse(str);
  } catch (e) {
    formatRes(res, {
      error: 'server',
      message: e
    });
    return;
  }
  const match = data.items.filter(item => item.id === api_id)[0];
  const {url} = match;
  if (address.ip() === ip) {
    shell.exec(`code run/project/${project_id}/meta.json`);
    shell.exec(`code run/project/${project_id}${url}.json`);
  }
  formatRes(res, {
    message: '已在vscode中打开'
  });
}