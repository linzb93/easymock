const express = require('express');
const mainRouter = require('./router');
const detectPort = require('detect-port');
const app = express();


app.all('*', function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use('/', mainRouter);

(async () => {
  const port = await detectPort(3000);
  app.listen(port);
})();