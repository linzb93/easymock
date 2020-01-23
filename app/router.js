const express = require('express');
const router = express.Router();
const mockRouter = express.Router();
const multer = require('multer');
const controller = require('./controller');

const upload = multer();

// project
router.get('/project/list', controller.project.list); // 获取项目列表
router.post('/project/create', controller.project.create); // 创建项目
router.post('/project/update', controller.project.update); // 更新项目
router.get('/project/detail', controller.project.detail); // 获取项目详情
router.post('/project/delete', controller.project.delete); // 删除项目
router.post('/project/upload',upload.any(), controller.project.upload); // 上传项目

// api
router.get('/api/page', controller.api.page); // 获取项目api分页
router.all('/api/preview', controller.api.preview); // 预览项目api
router.post('/api/create', controller.api.create); // 创建项目api
router.post('/api/update', controller.api.update); // 更新项目api
router.post('/api/delete', controller.api.delete); // 删除项目api
router.get('/api/detail', controller.api.detail); // 获取项目api详情
router.post('/api/clone', controller.api.clone); // 复制项目api
router.get('/api/download', controller.api.download); // 下载项目

// other
router.post('/open_vscode', controller.other.open_vscode); // 在vscode里编辑接口
router.get('/download', controller.other.download); // 文件下载

// mock
mockRouter.all('/mock/:project_id/*', controller.mock); // mock接口

exports.mainRouter = router;
exports.mockRouter = mockRouter;