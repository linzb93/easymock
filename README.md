# easymock
easymock是一个mock接口的平台，前端用React开发，后端用Egg.js开发，数据库用的是MySQL。

## 安装启动
下载Node.js版本号在V8.9.0以上，MySQL版本号在V5.7.27以上。下面是下载代码和导入数据库的代码。

```bash
git clone https://github.com/linzb93/easymock.git
npm install
npm start

mysql -u root -p easymock < easymock.sql
```

开发模式请运行
```bash
npm run dev
```

前端代码见 [easymock-fe](https://github.com/linzb93/easymock-fe)。

前端代码打包后放入 `app/public` 目录下即可。