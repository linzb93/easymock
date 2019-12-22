const express = require('express');
const {mainRouter, mockRouter} = require('./router');
const detectPort = require('detect-port');
const bodyParser = require('body-parser');
const hook = require('./hook');
require('./uncaughtError');

const app = express();

app.all('*', function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
app.use('/', express.static('build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', mainRouter);
app.use('/', mockRouter);
hook(app);
(async () => {
  const port = await detectPort(4000);
  app.listen(port, () => {
    console.log(`listen on port: ${port}`)
  });
})();