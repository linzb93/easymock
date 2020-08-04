module.exports = (app: any) => {
  const {router, controller} = app;
  const prefix = '/api/user';
  router.post(`${prefix}/login`, controller.user.login); // 登录
  router.post(`${prefix}/register`, controller.user.register); // 注册
  router.get(`${prefix}/checkExists`, controller.user.checkExists); // 监测用户是否存在
};