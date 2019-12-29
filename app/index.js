const express = require('express');
const cors = require('cors');
const open = require('open');
const bodyParser = require('body-parser');
const {mainRouter, mockRouter} = require('./router');
const limited = require('./middleware/limited');
const port = 4000;
const app = express();

require('./uncaughtError');

// 中间件
app.use(cors());
app.use('/', express.static('build'));
app.use(limited(5)); // 限制1秒只能访问5次接口
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// 路由
app.use('/api', mainRouter);
app.use('/', mockRouter);
// 启动
app.listen(port, () => {
  if (process.env.NODE_ENV === 'production') {
    open('http://localhost:4000');
    console.log(`服务器已启动`);
  }
});