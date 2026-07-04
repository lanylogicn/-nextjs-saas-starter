# 项目上下文 — 奕諾·服务进度存证管家

## 产品概述

奕諾是一款面向闲鱼卖家/买家的定制服务交付进度管理工具。卖家创建服务单跟踪交付，买家查询进度并审核，管理员后台全局管控。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Drizzle ORM)
- **Auth**: JWT (jose) + bcryptjs

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/
│   │   ├── page.tsx        # 首页 - 卖家面板
│   │   ├── buyer/page.tsx  # 买家查询页
│   │   ├── upgrade/page.tsx# 服务计划中心
│   │   ├── seller/[id]/page.tsx # 卖家信誉主页
│   │   ├── verify/[token]/page.tsx # 交付报告公证查验页
│   │   ├── admin/page.tsx  # 管理员后台
│   │   ├── layout.tsx      # 全局布局（含品牌名+新手引导）
│   │   ├── globals.css     # 全局样式
│   │   └── api/            # API 路由
│   │       ├── auth/       # 认证：注册/登录/登出/me/发送验证码/忘记密码
│   │       ├── admin/      # 管理员：登录/用户/订单/仪表盘/配置/公告/日志/买家功能/卖家功能/忘记密码/代码文档
│   │       ├── orders/     # 服务单：CRUD/推进进度/买家审核/交付喜报
│   │       ├── buyer/      # 买家查询（按编号）
│   │       ├── messages/   # 站内消息
│   │       ├── upgrade/    # 会员升级（联系客服）
│   │       ├── buyer-addons/ # 买家高级功能
│   │       ├── seller-features/ # 卖家高级功能查询
│   │       ├── seller/[id]/ # 卖家信誉数据/交付报告
│   │       ├── achievements/ # 成就徽章检查
│   │       └── verify/[token]/ # 交付报告公证查验
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── components/seller/  # 卖家专用组件（交付报告弹窗/交付喜报弹窗）
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/
│   │   ├── auth.ts         # 认证工具（JWT/密码哈希/cookie）
│   │   ├── auth-context.tsx # 认证上下文 Provider
│   │   ├── verification.ts # 验证码工具（发送/验证，测试模式123456）
│   │   └── utils.ts        # 通用工具函数 (cn)
│   ├── storage/database/
│   │   ├── supabase-client.ts # Supabase 客户端
│   │   └── shared/schema.ts   # Drizzle Schema（15张表）
│   └── server.ts           # 自定义服务端入口
├── DESIGN.md               # 设计规范
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 数据库表结构（15张表）

| 表名 | 说明 |
|------|------|
| users | 用户（手机/邮箱+密码，会员等级free/pro/flagship） |
| verification_codes | 手机验证码记录（6位数字，5分钟过期，测试模式固定123456） |
| service_orders | 服务单（SV编号，7节点进度，关联seller_id） |
| progress_logs | 进度操作日志（含驳回原因） |
| messages | 站内消息通知 |
| announcements | 系统公告 |
| admin_notes | 管理员备注（仅管理员可见） |
| operation_logs | 管理员操作日志 |
| system_config | 系统配置（最大单数/开关等） |
| transactions | 交易记录 |
| seller_features | 卖家高级功能配置（功能名/最低等级/开关） |
| seller_feature_grants | 卖家功能授权（用户ID/功能/到期时间） |
| seller_achievements | 卖家成就定义（极速交付/一次过稿/金牌口碑） |
| seller_achievement_grants | 卖家成就发放记录（用户ID/成就/发放时间） |
| delivery_reports | 交付报告（公证编号/查验token/交付小结） |

## 进度节点定义（7个）

1. 订单接收 → 2. 需求梳理 → 3. 制作中 → 4. 初稿完成等待审核（强制关卡） → 5. 审核通过终稿输出 → 6. 终稿已交付 → 7. 确认完成

- 节点4必须买家审核通过才能继续
- 驳回回退到节点3
- 卖家推进进度(node+1)，买家在节点4审核

## API 路由清单

### 认证
- POST /api/auth/register — 注册（phone+verificationCode+password+nickname）
- POST /api/auth/login — 登录（emailOrPhone+password）
- GET /api/auth/me — 获取当前用户
- POST /api/auth/logout — 登出
- POST /api/auth/send-code — 发送手机验证码（测试模式固定123456，60秒冷却）
- POST /api/auth/forgot-password — 忘记密码（phone+verificationCode，验证后登录）

### 管理员
- POST /api/admin/login — 管理员登录（username+password）
- POST /api/admin/forgot-password — 管理员忘记密码（phone+verificationCode，绑定手机号15816734348）
- GET /api/admin/users — 用户列表
- PUT /api/admin/users/[id] — 更新用户（冻结/会员等级）
- GET /api/admin/orders — 全部订单
- POST /api/admin/orders/[id]/force-progress — 强制推进/回退
- POST /api/admin/orders/[id]/notes — 添加管理员备注
- DELETE /api/admin/orders/[id]/delete — 删除订单
- GET /api/admin/dashboard — 仪表盘数据（用户/订单/活跃统计）
- GET/PUT /api/admin/config — 系统配置（free/pro/flagship最大单数等）
- GET/POST /api/admin/announcements — 公告管理
- GET /api/admin/operation-logs — 操作日志
- GET/PUT/DELETE /api/admin/buyer-addons — 买家高级功能管理
- GET/PUT /api/admin/seller-features — 卖家功能配置
- GET/POST/DELETE /api/admin/seller-features/grants — 卖家功能授权
- GET /api/admin/docs — 代码文档
- GET /api/admin/docs/download?type=full|api|guide — 下载文档

### 服务单
- GET /api/orders — 卖家订单列表（需登录）
- POST /api/orders — 创建服务单（需登录，检查等级最大单数限制）
- GET /api/orders/[id] — 订单详情
- PUT /api/orders/[id] — 推进进度
- POST /api/orders/[id]/review — 买家审核（approve/reject）

### 买家
- GET /api/buyer/[orderNo] — 按编号查询进度（无需登录）

### 其他
- GET/PUT /api/messages — 站内消息
- PUT /api/messages/[id]/read — 标记已读
- POST /api/upgrade — 会员升级（联系客服）
- POST /api/buyer-addons — 买家高级功能（优先审核/专业交付报告/进度卡片）
- GET /api/seller-features — 卖家查询自己的功能权限

### 卖家信誉与交付
- GET /api/seller/[id]/reputation — 卖家信誉数据（需开通信誉名片功能）
- GET /api/seller/[id]/report — 卖家交付报告列表（需开通专业交付报告功能）
- POST /api/achievements/check — 检查并自动发放成就徽章
- GET /api/orders/[id]/celebration — 交付喜报数据（需开通交付喜报功能）
- GET /api/verify/[token] — 交付报告公证查验

## 会员等级

| 等级 | 标识 | 限制 |
|------|------|------|
| 测试版 | free | 最多5个服务单，基础进度条 |
| 普通版 | pro | 最多50个服务单，可导出审核记录 |
| 完整版 | flagship | 无限服务单，全部功能 |

## 卖家高级功能（7个）

| 功能键 | 名称 | 最低等级 | 说明 |
|--------|------|----------|------|
| export_records | 导出审核记录 | pro | 将订单审核记录导出为文件 |
| custom_branding | 自定义品牌Logo | flagship | 在进度页面展示卖家品牌标识 |
| batch_operations | 批量操作 | pro | 批量推进或管理多个订单 |
| reputation_card | 卖家信誉名片 | pro | 生成专属信誉主页、二维码和信誉长图 |
| delivery_report | 专业交付报告 | pro | 生成含公证编号的专业交付报告 |
| achievement_badge | 卖家成就徽章 | pro | 自动获取成就徽章并展示在信誉主页 |
| delivery_celebration | 交付喜报 | flagship | 完成订单自动生成交付喜报图片 |

注：所有功能默认关闭，管理员需手动为卖家开通

## 卖家成就徽章（3个）

| 成就键 | 名称 | 条件 | 图标 |
|--------|------|------|------|
| fast_delivery | 极速交付 | 累计10次在预计交付时间前24小时完成 | ⚡ |
| first_pass | 一次过稿 | 连续5次初稿通过审核无驳回 | 🎯 |
| gold_reputation | 金牌口碑 | 累计获得20次买家好评 | 🥇 |

## 管理员账号

- 默认账号：admin / St86330068
- 密码通过 bcrypt 哈希存储于 system_config 表

## 包管理规范

**仅允许使用 pnpm**，严禁使用 npm 或 yarn。

## 开发规范

- TypeScript strict 模式
- 禁止隐式 any
- 严禁在 JSX 中使用 typeof window / Date.now() / Math.random()（需 use client + useEffect）
- 配置路径用 path.resolve / import.meta.dirname，不硬编码绝对路径
- 三方 CSS/字体通过 globals.css @import 或 next/font，不通过 head 标签
