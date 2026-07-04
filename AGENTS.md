# 奕诺 - 代做服务信任基础设施

## 项目概览

奕诺是代做服务信任基础设施，提供三大核心功能：
1. **AI 检测报告** - 多维度 AI 生成概率分析，出具权威检测报告
2. **品类化交付模板** - 覆盖学术、设计、开发、文案、翻译、咨询等品类的标准化交付模板
3. **版权声明生成** - 一键生成具备法律参考价值的版权声明文件

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                     # 静态资源
├── scripts/                    # 构建与启动脚本
├── src/
│   ├── app/                    # 页面路由与布局
│   │   ├── page.tsx            # 首页 - 品牌展示
│   │   ├── report/page.tsx     # AI 检测报告页
│   │   ├── templates/page.tsx  # 品类化交付模板页
│   │   ├── copyright/page.tsx  # 版权声明页
│   │   └── api/detect/route.ts # AI 检测 API
│   ├── components/
│   │   ├── ui/                 # Shadcn UI 组件库
│   │   ├── layout/             # 布局组件 (header, footer)
│   │   ├── report/             # 检测报告组件
│   │   ├── templates/          # 交付模板组件
│   │   └── copyright/          # 版权声明组件
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/utils.ts            # 通用工具函数
│   └── server.ts               # 自定义服务端入口
├── DESIGN.md                   # 设计规范文件
├── next.config.ts              # Next.js 配置
└── package.json                # 项目依赖管理
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**
