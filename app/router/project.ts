module.exports = (app: any) => {
  const {router, controller} = app;
  const prefix = '/api/project';
  router.get(`${prefix}/list`, controller.project.list); // 获取项目列表
  router.post(`${prefix}/create`, controller.project.create); // 创建项目
  router.post(`${prefix}/update`, controller.project.update); // 更新项目
  router.get(`${prefix}/detail`, controller.project.detail); // 获取项目详情
  router.post(`${prefix}/delete`, controller.project.delete); // 删除项目
  router.post(`${prefix}/upload`, controller.project.upload); // 上传项目
};