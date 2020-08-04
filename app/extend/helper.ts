// import * as prettier from 'prettier';
import {resolve} from 'path';

module.exports = {
  //error type
  ClientError: new Error('ClientError'),

  // json format
  jsonFormat(data: object) {
    // return prettier.format(JSON.stringify(data), {
    //   parser: 'json'
    // });
    return data;
  },

  resolve: function(dir: string) {
    return resolve(process.cwd(), dir);
  }
}