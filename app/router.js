const express = require('express');
const router = express.Router();
const mockRouter = express.Router();
const controller = require('./controller');

// project
router.get('/project/list', controller.project.list);
router.post('/project/create', controller.project.create);
router.post('/project/update', controller.project.update);
router.get('/project/detail', controller.project.detail);
router.post('/project/delete', controller.project.delete);

// api
router.get('/api/page', controller.api.page);
router.all('/api/preview', controller.api.preview);
router.post('/api/create', controller.api.create);
router.post('/api/update', controller.api.update);
router.post('/api/delete', controller.api.delete);
router.get('/api/detail', controller.api.detail);
// router.post('/api/clone', controller.api.clone);
// router.post('/api/upload', controller.api.upload);
router.get('/api/download', controller.api.download);

// other
// router.post('/open_vscode', controller.other.open_vscode);

// mock
mockRouter.all('/mock/:project_id/*', controller.mock);

exports.mainRouter = router;
exports.mockRouter = mockRouter;