// 错误处理
const {ClientError, ServerError, errorLogger} = require('../util');
module.exports = (err, req, res, next) => {
  if (!err) {
    return;
  }
  if (err instanceof ClientError) {
    res.status(400).send({
      data: null,
      message: err.message
    });
  } else {
    res.status(500).send({
      data: null,
      message: '服务器故障，请稍后再试！'
    });
    errorLogger(err.message);
  }
}