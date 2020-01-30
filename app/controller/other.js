const {resolve} = require('../util');

// 文件下载
exports.download = (req, res) => {
  const {fileName} = req.query;
  res.download(resolve(`app/attachment/${fileName}`));
}