# 学校官网项目

这个仓库现在已经从原始静态 demo 迁成了一个前后端分离结构：

- `web/`
  Next.js 16 前端，已完成首页、新闻、公告、教师分组与教师详情、活动相册、校园 3D 导览。
- `cms/`
  Strapi 5 后端，已完成内容类型建模与示例数据初始化。
- 根目录静态 `html/css/js`
  保留原始 demo，方便继续对照或回看。

## 本地运行

1. 启动 Strapi

```powershell
cd .\cms
npm.cmd run develop
```

2. 新开一个终端，启动 Next.js

```powershell
cd .\web
Copy-Item .env.example .env.local
npm.cmd run dev
```

3. 如果希望前端直接读取 Strapi，把 `web/.env.local` 里的这几个值补上：

```env
STRAPI_URL=http://127.0.0.1:1337
STRAPI_PUBLIC_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=你的只读 API Token
```

如果没配 `STRAPI_URL`，前端会自动回退到内置 demo 数据。

## 已实现

- Next.js App Router 页面结构
- 校园新闻 / 公告列表与详情路由
- 师资队伍分组页与教师档案页
- 活动相册页
- Three.js 校园导览客户端组件
- Strapi 内容类型：
  - `site-setting`
  - `news-post`
  - `notice-post`
  - `teacher-subject`
  - `teacher-profile`
  - `campus-spot`
  - `gallery-album`
- Strapi 启动时自动灌入示例数据

## 部署建议

- 推荐部署到中国内地可备案环境，例如阿里云 ECS / 轻量应用服务器、腾讯云 CVM / 轻量应用服务器。
- `web` 使用 Node.js 自托管，建议经 `Nginx -> Next.js` 反向代理对外提供服务。
- `cms` 使用 Strapi 自托管，建议经 `Nginx -> Strapi` 暴露独立子域名，如 `cms.example.cn`。
- 生产数据库优先使用阿里云 RDS、腾讯云数据库等托管 MySQL / PostgreSQL，避免继续使用 SQLite。

## 国内生产部署

- 前端公网域名建议使用 `https://www.example.cn`
- CMS 公网域名建议使用 `https://cms.example.cn`
- 前端服务端访问 CMS 时，可把 `STRAPI_URL` 配成同机 `http://127.0.0.1:1337` 或同 VPC 内网地址
- 浏览器访问图片、附件等静态资源时，使用 `STRAPI_PUBLIC_URL=https://cms.example.cn`
- 样例环境变量见 [web/.env.production.example](web/.env.production.example) 和 [cms/.env.production.example](cms/.env.production.example)
- 反向代理与进程管理样例见 [deploy/nginx/china-campus.conf](deploy/nginx/china-campus.conf) 和 [deploy/pm2/ecosystem.config.cjs](deploy/pm2/ecosystem.config.cjs)
- 详细步骤见 [docs/deploy-cn.md](docs/deploy-cn.md)
