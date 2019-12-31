const fs = require('fs');
// const data = /* 在这里填写浏览器console面板生成的对象字符串，然后取消注释 */

let meta = {
  title: data.title,
  prefix: data.prefix,
  items: data.items.map(item => ({
    url: item.url,
    type: item.method,
    title: item.title
  }))
};

fs.writeFile('./meta.json', JSON.stringify(meta), err => {
  console.log('ok')
})