# 国内备案部署指南

## 推荐架构

- `www.example.cn` 对外提供学校官网，流量进入 `Nginx -> Next.js`
- `cms.example.cn` 对外提供 CMS 管理后台和静态资源，流量进入 `Nginx -> Strapi`
- 数据库使用阿里云 RDS、腾讯云数据库等中国内地托管 MySQL / PostgreSQL
- 如果前端和 CMS 不在同一台机器，优先让它们通过同一 VPC 内网互通

## 为什么要拆分 `STRAPI_URL` 和 `STRAPI_PUBLIC_URL`

- `STRAPI_URL` 给 Next.js 服务端使用，可以写成 `http://127.0.0.1:1337`、`http://10.x.x.x:1337` 或其他内网地址
- `STRAPI_PUBLIC_URL` 给浏览器使用，应该写成已备案并可公网访问的域名，例如 `https://cms.example.cn`
- 这样做可以兼顾内网访问速度和公网资源可访问性，避免图片、附件引用成内网地址

## 服务器建议

- 系统建议使用 Ubuntu 22.04 LTS 或 Alibaba Cloud Linux 3
- 起步配置建议 `2 vCPU / 4 GB RAM`
- Node.js 建议使用 20 LTS
- 只开放 `80`、`443`，把 `3000` 和 `1337` 仅保留给本机或内网访问

## 数据库建议

- 生产环境不要继续使用 SQLite
- `cms/.env.production.example` 默认按 MySQL 写好，也可切换到 PostgreSQL
- 数据库建议单独做自动备份，上传目录也要纳入备份

## 部署步骤

1. 准备中国内地云服务器、域名、ICP备案和 HTTPS 证书
2. 在服务器上安装 Node.js 20、Nginx、PM2
3. 克隆仓库后分别在 `web/` 和 `cms/` 执行 `npm ci`
4. 根据示例复制并填写生产环境变量
5. 在 `cms/` 执行 `npm run build`
6. 在 `web/` 执行 `npm run build`
7. 使用 `deploy/pm2/ecosystem.config.cjs` 启动两个 Node 进程
8. 把 `deploy/nginx/china-campus.conf` 调整成真实域名和证书路径后加载到 Nginx

## 环境变量映射

### `web/.env.production`

- `NEXT_PUBLIC_SITE_URL`: 前端公网地址，例如 `https://www.example.cn`
- `STRAPI_URL`: Next.js 服务端访问 CMS 的地址，可用同机或内网地址
- `STRAPI_PUBLIC_URL`: 浏览器访问 CMS 静态资源的公网地址
- `STRAPI_API_TOKEN`: Strapi 只读 API Token

### `cms/.env.production`

- `PUBLIC_URL`: CMS 对外地址，例如 `https://cms.example.cn`
- `IS_PROXIED=true`: 开启反向代理模式
- `DATABASE_*`: 托管数据库连接信息
- `FRONTEND_URL` 和 `CORS_ORIGINS`: 填前端备案域名
- `ADMIN_IP_ALLOWLIST`: 建议只放办公网或 VPN 出口 IP

## 上传文件与对象存储

- 当前仓库默认可直接使用 Strapi 本地上传目录 `cms/public/uploads`
- 如果后续改接阿里云 OSS、腾讯云 COS 或 CDN，把对应域名加入：
  - `web/.env.production` 的 `SITE_CSP_IMG_SOURCES`、`SITE_CSP_MEDIA_SOURCES`
  - `cms/.env.production` 的 `CSP_IMG_SOURCES`

## 运维注意事项

- 上线前把 `SEED_DEMO_DATA` 设为 `false`
- 为 Strapi 管理后台启用强密码和只读 API Token
- 定期备份数据库和 `cms/public/uploads`
- 先完成备案，再把中国内地公网域名正式切到服务器
