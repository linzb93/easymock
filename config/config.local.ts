import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    mysql: {
      client: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'lzb930525',
        database: 'easymock'
      }
    },
    security: {
      csrf: {
        enable: false
      },
      domainWhiteList: [ '*' ]
    },
    cors: {
      origin: '*',
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    }
  };
  return config;
};