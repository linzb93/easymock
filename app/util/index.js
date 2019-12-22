const path = require('path');
const PrettyError = require('pretty-error');
const prettier = require('prettier');
const pe = new PrettyError();

exports.resolve = function(dir) {
  return path.resolve(process.cwd(), dir);
}

exports.errorLogger = err => {
  console.log(pe.render(err));
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