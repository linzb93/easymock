import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  require('./router/user')(app);
  require('./router/project')(app);
  require('./router/api')(app);

  // router.get('/api/download', controller.rest.download); // 文件下载
  router.all(/^\/mock\/([\w-]+)\/(.+)$/, controller.mock.main); // mock接口
};
