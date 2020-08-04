module.exports = (app: any) => {
  const {router, controller} = app;
  const prefix = '/api/api';
  router.get(`${prefix}/page`, controller.api.page); // 获取项目api分页
  router.post(`${prefix}/create`, controller.api.create); // 创建项目api
  router.post(`${prefix}/update`, controller.api.update); // 更新项目api
  router.post(`${prefix}/delete`, controller.api.delete); // 删除项目api
  router.get(`${prefix}/detail`, controller.api.detail); // 获取项目api详情
  router.post(`${prefix}/clone`, controller.api.clone); // 复制项目api
  router.get(`${prefix}/download`, controller.api.download); // 下载项目
};