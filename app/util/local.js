const fs = require('fs-extra');
const prettier = require('prettier');
const {resolve, jsonFormat} = require('./');

const get = key => {
  const str = fs.readFileSync(resolve(`./run/data.json`), 'utf8');
  if (str !== '') {
    const data = JSON.parse(str);
    return data[key];
  }
  return '';
}

const set = (key, value) => {
  const str = fs.readFileSync(resolve(`./run/data.json`), 'utf8');
  let data = {};
  if (str !== '') {
    data = JSON.parse(str);  
  }
  data[key] = value;
  fs.writeFileSync(resolve(`./run/data.json`), jsonFormat(data));
}

module.exports = {
  getLocal: get,
  setLocal: set
}
