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

3. 如果希望前端直接读取 Strapi，把 `web/.env.local` 里的这两个值补上：

```env
STRAPI_URL=http://127.0.0.1:1337
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

- `web` 部署到 Vercel
- `cms` 单独部署到支持 Node 服务和数据库的环境

当前这套仓库已经适合按 monorepo 方式使用：在 Vercel 导入仓库时，把前端项目的 Root Directory 设为 `web`。
