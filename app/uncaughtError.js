const {errorLogger} = require('./util');

process.on('uncaughtException', err => {
  errorLogger(err);
});
process.on('unhandledRejection', err => {
  errorLogger(err);
})