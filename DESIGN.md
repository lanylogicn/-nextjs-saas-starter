# DESIGN.md

## 气质与意象
专业级交付存证平台：深蓝底色上的精密仪表盘，每个数据都经得起查验。光线冷静而有力，秩序清晰——这是「专业可信赖」的视觉隐喻。奕諾用深邃的靛蓝与清晰的秩序感传递「靠谱、专业、可验证」。

## 配色方案（全站统一）
- 主色：靛蓝 `#4F46E5`（indigo-600）— 专业可信，代表权威与保障
- 主色浅：`#818CF8`（indigo-400）— hover态、渐变过渡
- 主色深：`#3730A3`（indigo-800）— 标题重音、深色按钮
- 辅助色：深海蓝 `#1E1B4B`（indigo-950）— Hero/Footer深色背景
- 背景：极浅靛 `#EEF2FF`（indigo-50）— 柔和专业，不刺眼
- 卡片：纯白 `#FFFFFF` + 微阴影 + 极淡靛蓝边框
- 成功：翠绿 `#059669`（emerald-600）
- 警告：橘橙 `#EA580C`（orange-600）
- 驳回/危险：玫红 `#DC2626`（red-600）
- 中性文字：`#1E293B`（slate-800）
- 次要文字：`#64748B`（slate-500）
- 分隔线：`#E2E8F0`（slate-200）

## 全局组件样式
- 主按钮：`bg-indigo-600 hover:bg-indigo-700 text-white` + 圆角8px + 阴影
- 次按钮：`bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50`
- 危险按钮：`bg-red-600 hover:bg-red-700 text-white`
- 卡片：`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md`
- 输入框：`border-slate-200 focus:border-indigo-500 focus:ring-indigo-500`
- 标签/Badge：`bg-indigo-50 text-indigo-700` 或各语义色变体
- 圆角统一：卡片12px，按钮8px，输入框8px
- 间距统一：section间距 py-16~20，卡片间距 gap-6

## 字体排版
- 中文优先：系统字体栈 `-apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- 数字/编号：等宽风格，使用 `font-variant-numeric: tabular-nums`
- 标题：18-24px，font-weight 700
- 正文：14px，font-weight 400
- 进度节点文字：13px，紧凑但不拥挤

## 动效与交互
- 进度推进：节点方块从 □ 变 ■ 时有 0.3s scale 弹跳
- 页面切换：fade-in，0.2s
- 按钮 hover：微上移 1px + 阴影加深 + 背景色加深
- 弹窗：从中心 scale-in，0.2s ease-out
- 驳回回退：节点有 0.4s 红色闪烁
- 卡片 hover：阴影从 shadow-sm → shadow-md，边框色加深

## 品牌调性
- 核心感觉：信任感 + 专业感 + 差异化
- 参考风格：Notion / Figma / Vercel 官网质感
- 简洁但不简陋，信息丰富但不杂乱
- 深色区块+靛蓝品牌色营造专业科技氛围
- 关键词强化：「公证」「可验证」「唯一编号」「全程可溯」——每一次出现都强化信任锚点

## 首页Hero风格
- 标语大气直接：「让每一次交付，都有据可查」
- 副标题传达平台核心价值：进度透明、报告可公证、信誉可验证
- 深色背景(slate-900→indigo-950)+品牌色渐变文字，大号字体+宽松行距
- 背景：微弱径向渐变光晕 + 网格纹理暗示秩序感

## 首页核心功能区块
- 深色渐变背景(slate-900→blue-950→indigo-950)
- 玻璃拟态卡片+各功能独立主题色
- 渐变文字标题+滚动淡入动画
- 此区块允许使用渐变、glassmorphism等现代SaaS视觉手法

## 首页Footer风格
- 深色(slate-900)底，4列布局(品牌+产品+支持+法律)
- 品牌列含Logo+一句话定位
- 底部细线分隔+版权+备案号预留+联系方式
- 链接无下划线，hover时indigo色高亮

## Navbar风格
- 白底+极淡底影，品牌名「奕諾」用indigo-600
- 链接间距宽松，hover时底部indigo色指示线
- 登录后头像+用户名+下拉菜单

## 设计禁忌
- 不要使用圆角过大的卡片（max 12px）— 保持专业方正感
- 不要在进度条使用渐变色块 — 用纯色 ■ 和空心 □，清晰即正义
- 不要使用过细的字体（min font-weight 400）
- 进度条不要用横向线型，必须用方块节点
- 不要混用amber/黄色系和indigo/蓝色系 — 全站统一靛蓝色调
- 不要在不同页面使用不一致的按钮/卡片/颜色风格
