import Index from '../pages/Index/Index';
import Api from '../pages/Api/List';
import Editor from '../pages/Api/Create';

export default [
  {
    name: '首页',
    path: '/',
    component: Index
  },
  {
    name: '列表',
    path: '/project/:project_id',
    component: Api
  },
  {
    name: '添加接口',
    path: '/project/:project_id/create',
    component: Editor
  },
  {
    name: '编辑接口',
    path: '/project/:project_id/update/:api_id',
    component: Editor
  }
]