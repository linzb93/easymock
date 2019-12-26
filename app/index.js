const express = require('express');
const {mainRouter, mockRouter} = require('./router');
const detectPort = require('detect-port');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./uncaughtError');

const app = express();

app.use(cors());
app.use('/', express.static('build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', mainRouter);
app.use('/', mockRouter);

(async () => {
  const port = await detectPort(4000);
  app.listen(port, () => {
    console.log(`listen on port: ${port}`)
  });
})();