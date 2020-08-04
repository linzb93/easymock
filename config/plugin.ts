import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  static: true,
  mysql: {
    enable: true,
    package: 'egg-mysql'
  },
  cors: {
    enable: true,
    package: 'egg-cors'
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  }
};

export default plugin;
