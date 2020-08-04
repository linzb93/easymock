import { Controller } from 'egg';

export default class MockController extends Controller {
  public async main() {
    const {ctx, ctx: {path, params, request: {query, body, method}}, service: {mock}} = this;
    const realPath = path.split('/').slice(3).join('/');
    const ret = await mock.main({
      path: realPath,
      type: method.toLowerCase(),
      query,
      body,
      project_id: params[0]
    });
    ctx.body = ret;
  }
}