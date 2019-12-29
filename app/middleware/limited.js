// 限制访问频率
const moment = require('moment');

const reqTimeList = [];

module.exports = times => (req, res, next) => {
  reqTimeList.push(new Date());
  if (reqTimeList.length > times) {
    reqTimeList.shift();
  }
  const start = reqTimeList[0];
  const end = reqTimeList[reqTimeList.length - 1];
  if (reqTimeList.length === times && moment(start).add(1, 's').isAfter(moment(end))) {
    res.status(400).send({
      message: '请求太频繁，请稍后再试'
    });
  } else {
    next();
  }
}