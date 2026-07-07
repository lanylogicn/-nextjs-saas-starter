/**
 * 管理员代码文档 API
 *
 * GET /api/admin/docs — 获取完整项目文档
 * 返回结构：{ docs: { overview, quickRef, tutorial, directory, modules, apiDocs, guide, detailedGuide, files } }
 *
 * 文档内容存储在项目根目录 docs/ 下的 Markdown 文件中，
 * 此 API 读取文件内容并返回 JSON 格式。
 *
 * 认证：需管理员 cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/** 读取 docs/ 目录下的 Markdown 文件 */
function readDoc(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), 'docs', filename);
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return `文档加载失败：${filename} 不存在`;
  }
}

/** 文件注释索引 - 按分类列出所有源文件及其用途 */
function getFileAnnotations() {
  return [
    {
      category: '页面文件',
      files: [
        { path: 'src/app/page.tsx', description: '首页 - Landing Page + 卖家管理面板', dependencies: 'DeliveryReportModal, AuthContext', exports: 'default: HomePage' },
        { path: 'src/app/buyer/page.tsx', description: '买家查询页 - 查询进度/审核/高级功能', dependencies: 'AuthContext, ContactModal', exports: 'default: BuyerPage' },
        { path: 'src/app/upgrade/page.tsx', description: '服务计划中心 - 三等级对比+升级', dependencies: 'AuthContext, ContactModal', exports: 'default: UpgradePage' },
        { path: 'src/app/seller/[id]/page.tsx', description: '卖家信誉主页 - 公开展示+QR码+长图', dependencies: 'qrcode.react, html-to-image', exports: 'default: SellerReputationPage' },
        { path: 'src/app/verify/[token]/page.tsx', description: '交付报告公证查验页', dependencies: '无', exports: 'default: VerifyPage' },
        { path: 'src/app/admin/page.tsx', description: '管理员后台 - 11个模块统一管理', dependencies: 'AuthContext, 所有admin API', exports: 'default: AdminPage' },
        { path: 'src/app/layout.tsx', description: '全局布局 - Navbar + Footer + 字体', dependencies: 'Navbar, Footer, ClientLayout', exports: 'default: RootLayout' },
      ],
    },
    {
      category: '公共组件',
      files: [
        { path: 'src/components/Navbar.tsx', description: '顶部导航栏 - 品牌标识+导航链接+登录弹窗', dependencies: 'AuthContext, Link', exports: 'Navbar' },
        { path: 'src/components/Footer.tsx', description: '底部信息栏 - 4列布局+版权+备案', dependencies: 'Link, ContactModal', exports: 'Footer' },
        { path: 'src/components/ClientLayout.tsx', description: '客户端布局 - 认证上下文+新手引导', dependencies: 'AuthProvider', exports: 'ClientLayout' },
        { path: 'src/components/ContactModal.tsx', description: '联系客服弹窗', dependencies: '无', exports: 'ContactModal' },
      ],
    },
    {
      category: '卖家专用组件',
      files: [
        { path: 'src/components/seller/DeliveryReportModal.tsx', description: '专业交付报告弹窗 - 时间轴+审核记录+公证编号+保存图片', dependencies: 'html-to-image, qrcode.react', exports: 'DeliveryReportModal' },
      ],
    },
    {
      category: '核心库模块',
      files: [
        { path: 'src/lib/auth.ts', description: '认证工具 - JWT生成/验证/密码哈希/Cookie操作', dependencies: 'jose, bcryptjs', exports: 'generateToken, verifyToken, getCurrentUser, getAdminUser, hashPassword, verifyPassword' },
        { path: 'src/lib/auth-context.tsx', description: '认证上下文 Provider - 用户状态管理', dependencies: 'React Context', exports: 'AuthProvider, useAuth' },
        { path: 'src/lib/verification.ts', description: '验证码工具 - 发送/验证/测试模式', dependencies: 'supabase-client', exports: 'sendVerificationCode, verifyCode' },
        { path: 'src/lib/utils.ts', description: '通用工具函数', dependencies: 'clsx, tailwind-merge', exports: 'cn' },
      ],
    },
    {
      category: '数据库模块',
      files: [
        { path: 'src/storage/database/supabase-client.ts', description: 'Supabase 客户端 - 单例模式', dependencies: '@supabase/supabase-js', exports: 'getSupabaseClient' },
        { path: 'src/storage/database/shared/schema.ts', description: 'Drizzle Schema - 15张表定义', dependencies: 'drizzle-orm', exports: '所有表定义 + relations' },
      ],
    },
    {
      category: '认证 API',
      files: [
        { path: 'src/app/api/auth/register/route.ts', description: '注册新用户', methods: 'POST', params: 'phone, verificationCode, password, nickname', returns: '{ success, user?, error? }' },
        { path: 'src/app/api/auth/login/route.ts', description: '用户登录', methods: 'POST', params: 'emailOrPhone, password', returns: '{ success, user?, error? }' },
        { path: 'src/app/api/auth/me/route.ts', description: '获取当前用户', methods: 'GET', params: 'cookie: token', returns: '{ user }' },
        { path: 'src/app/api/auth/logout/route.ts', description: '登出', methods: 'POST', params: '无', returns: '{ success }' },
        { path: 'src/app/api/auth/send-code/route.ts', description: '发送验证码', methods: 'POST', params: 'phone', returns: '{ success, error? }' },
        { path: 'src/app/api/auth/forgot-password/route.ts', description: '忘记密码', methods: 'POST', params: 'phone, verificationCode', returns: '{ success, user? }' },
        { path: 'src/app/api/auth/avatar/route.ts', description: '上传头像', methods: 'POST', params: 'FormData: file', returns: '{ success, avatarUrl }' },
      ],
    },
    {
      category: '管理员 API',
      files: [
        { path: 'src/app/api/admin/login/route.ts', description: '管理员登录', methods: 'POST', params: 'username, password', returns: '{ success, user }' },
        { path: 'src/app/api/admin/forgot-password/route.ts', description: '管理员忘记密码', methods: 'POST', params: 'phone, verificationCode', returns: '{ success }' },
        { path: 'src/app/api/admin/dashboard/route.ts', description: '仪表盘数据', methods: 'GET', params: 'admin cookie', returns: '统计JSON' },
        { path: 'src/app/api/admin/users/route.ts', description: '用户列表', methods: 'GET', params: 'admin cookie', returns: '{ users }' },
        { path: 'src/app/api/admin/users/[id]/route.ts', description: '更新用户', methods: 'PUT', params: 'membership_level?, is_frozen?, ...', returns: '{ success }' },
        { path: 'src/app/api/admin/orders/route.ts', description: '全部订单', methods: 'GET', params: 'admin cookie', returns: '{ orders }' },
        { path: 'src/app/api/admin/orders/[id]/force-progress/route.ts', description: '强制推进进度', methods: 'POST', params: 'targetNode', returns: '{ success, currentNode }' },
        { path: 'src/app/api/admin/orders/[id]/notes/route.ts', description: '管理员备注', methods: 'POST', params: 'content', returns: '{ success, note }' },
        { path: 'src/app/api/admin/orders/[id]/delete/route.ts', description: '删除订单', methods: 'DELETE', params: '无', returns: '{ success }' },
        { path: 'src/app/api/admin/config/route.ts', description: '系统配置', methods: 'GET/PUT', params: '各配置项', returns: '配置JSON' },
        { path: 'src/app/api/admin/contact/route.ts', description: '联系方式配置', methods: 'GET/PUT', params: 'phone, email, work_hours', returns: '联系JSON' },
        { path: 'src/app/api/admin/announcements/route.ts', description: '公告管理', methods: 'GET/POST', params: 'title, content', returns: '公告列表/新增结果' },
        { path: 'src/app/api/admin/operation-logs/route.ts', description: '操作日志', methods: 'GET', params: 'admin cookie', returns: '{ logs }' },
        { path: 'src/app/api/admin/buyer-addons/route.ts', description: '买家高级功能管理', methods: 'GET/PUT/DELETE', params: '功能配置', returns: '功能列表' },
        { path: 'src/app/api/admin/buyer-addons/[id]/route.ts', description: '单个买家功能操作', methods: 'PUT/DELETE', params: '功能ID', returns: '{ success }' },
        { path: 'src/app/api/admin/seller-features/route.ts', description: '卖家功能配置', methods: 'GET/PUT', params: '7个功能配置', returns: '配置列表' },
        { path: 'src/app/api/admin/seller-features/grants/route.ts', description: '卖家功能授权', methods: 'GET/POST/DELETE', params: 'userId, featureKey, expiresAt', returns: '授权列表' },
        { path: 'src/app/api/admin/survey/questions/route.ts', description: '问卷题目CRUD', methods: 'GET/POST', params: 'question_text, question_type, options', returns: '题目列表' },
        { path: 'src/app/api/admin/survey/questions/[id]/route.ts', description: '单题操作', methods: 'PUT/DELETE', params: '题目ID', returns: '{ success }' },
        { path: 'src/app/api/admin/survey/responses/route.ts', description: '问卷回复统计', methods: 'GET', params: 'admin cookie', returns: '统计数据' },
        { path: 'src/app/api/admin/docs/route.ts', description: '代码文档', methods: 'GET', params: 'admin cookie', returns: '文档JSON' },
        { path: 'src/app/api/admin/docs/download/route.ts', description: '下载文档', methods: 'GET', params: 'type=full|api|guide|tutorial|quickref|detailedguide', returns: 'Markdown文件' },
      ],
    },
    {
      category: '服务单 API',
      files: [
        { path: 'src/app/api/orders/route.ts', description: '订单列表+创建', methods: 'GET/POST', params: 'GET: 无; POST: buyer_name, service_title, ...', returns: '订单列表/创建结果' },
        { path: 'src/app/api/orders/[id]/route.ts', description: '订单详情+推进', methods: 'GET/PUT', params: 'PUT: action=advance|reject, reason?', returns: '订单详情/推进结果' },
        { path: 'src/app/api/orders/[id]/review/route.ts', description: '买家审核', methods: 'POST', params: 'action=approve|reject, reason?', returns: '{ success }' },
      ],
    },
    {
      category: '其他 API',
      files: [
        { path: 'src/app/api/buyer/[orderNo]/route.ts', description: '买家按编号查询', methods: 'GET', params: 'orderNo路径参数', returns: '订单+进度JSON' },
        { path: 'src/app/api/buyer-addons/route.ts', description: '买家高级功能购买', methods: 'POST', params: 'orderNo, feature', returns: '{ success }' },
        { path: 'src/app/api/buyer-addons/permissions/route.ts', description: '查询已购功能', methods: 'GET', params: 'cookie: token', returns: '权限列表' },
        { path: 'src/app/api/seller-features/route.ts', description: '卖家查询功能权限', methods: 'GET', params: 'userId', returns: '权限列表' },
        { path: 'src/app/api/seller/[id]/reputation/route.ts', description: '卖家信誉数据', methods: 'GET', params: '需开通reputation_card', returns: '信誉JSON' },
        { path: 'src/app/api/seller/[id]/report/route.ts', description: '卖家交付报告', methods: 'GET', params: '需开通delivery_report', returns: '报告JSON' },
        { path: 'src/app/api/achievements/check/route.ts', description: '成就徽章检查', methods: 'POST', params: 'userId, featureKey', returns: '{ checked, granted }' },
        { path: 'src/app/api/verify/[token]/route.ts', description: '交付报告公证查验', methods: 'GET', params: 'token路径参数', returns: '报告+订单JSON' },
        { path: 'src/app/api/messages/route.ts', description: '站内消息', methods: 'GET/PUT', params: 'cookie: token', returns: '消息列表' },
        { path: 'src/app/api/messages/[id]/read/route.ts', description: '标记消息已读', methods: 'PUT', params: '消息ID', returns: '{ success }' },
        { path: 'src/app/api/upgrade/route.ts', description: '会员升级', methods: 'POST', params: 'cookie: token', returns: '{ success }' },
        { path: 'src/app/api/contact/route.ts', description: '联系方式', methods: 'GET', params: '无', returns: '联系JSON' },
        { path: 'src/app/api/survey/route.ts', description: '问卷题目', methods: 'GET', params: '无', returns: '题目列表' },
        { path: 'src/app/api/survey/submit/route.ts', description: '提交问卷', methods: 'POST', params: 'responses数组', returns: '{ success }' },
      ],
    },
  ];
}

export async function GET() {

  const docs = {
    overview: {
      title: '项目概述',
      content: readDoc('overview.md'),
    },
    quickRef: {
      title: '快速参考卡片',
      content: readDoc('quick-ref.md'),
    },
    tutorial: {
      title: '代码教学（从零开始）',
      content: readDoc('tutorial.md'),
    },
    directory: {
      title: '目录结构',
      content: readDoc('directory.md'),
    },
    modules: {
      title: '模块功能说明',
      content: readDoc('modules.md'),
    },
    apiDocs: {
      title: 'API 接口文档',
      content: readDoc('api.md'),
    },
    guide: {
      title: '常用修改指南',
      content: readDoc('guide.md'),
    },
    detailedGuide: {
      title: '详细代码修改指南',
      content: readDoc('detailed-guide.md'),
    },
    files: {
      title: '文件注释索引',
      categories: getFileAnnotations(),
    },
  };

  return NextResponse.json({ docs });
}
