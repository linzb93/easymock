module.exports = () => {
  return async function tokenVerify(ctx: any, next: Function) {
    const {request: {url, header: {token}}, service: {user}} = ctx;
    // 登录注册功能不需要验证token
    if (
      url.startsWith('/project/') &&
      url.startsWith('/api/')) {
      if (!token) {
        ctx.status = 500;
        ctx.body = {
          message: '您没有权限访问'
        }
        return;
      }
      const checkData = await user.check(token);
      if (checkData.code !== 'SUCCESS') {
        ctx.status = 500;
        ctx.body = {
          message: checkData.message
        }
        return;
      }
      await next();
    } else {
      await next();
    }
  };
};