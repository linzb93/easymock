const path = require('path');
const PrettyError = require('pretty-error');
const prettier = require('prettier');
const log4js = require('log4js');
const errorex = require('error-ex');
const pe = new PrettyError();
log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'logs/error.log' } },
  categories: { default: { appenders: ['cheese'], level: 'error' } }
});
const logger = log4js.getLogger('cheese');

exports.resolve = function(dir) {
  return path.resolve(process.cwd(), dir);
}

exports.errorLogger = err => {
  if (process.env.NODE_ENV === 'production') {
    logger.error(err);
  } else {
    console.log(pe.render(err));
  }
}

// 标准输出
exports.formatRes = (res, {
  error,
  data,
  message
}) => {
  if (error === 'client') {
    res.status(400).send({
      data: null,
      message
    });
  } else if (error === 'server') {
    res.status(500).send({
      data: null,
      message: '服务器故障，请稍后再试！'
    });
    this.errorLogger(message);
  } else {
    res.send({
      data,
      message
    });
  }
}

// json输出格式化
exports.jsonFormat = data => {
  return prettier.format(JSON.stringify(data), {
    parser: 'json'
  })
}

// 遍历数组，满足条件即可退出
exports.each = (list, callback) => {
  for (let i = 0, len = list.length; i < len; i++) {
    if ( callback(list[i], i) === false ) {
      break;
    }
  }
}

// error type
exports.ServerError = errorex('ServerError');
exports.ClientError = errorex('ClientError');