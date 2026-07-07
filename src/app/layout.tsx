/**
 * @file 全局根布局
 * @description
 * Next.js App Router 根布局，所有页面共享。
 * 包含：HTML元数据（标题/描述/关键词）、全局字体、最小高度、渐变背景。
 * 子组件 ClientLayout 处理客户端逻辑（Navbar/Footer/认证Provider/新手引导）。
 */
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: '奕諾-服务进度存证管家',
  description: '闲鱼卖家与买家的服务交付进度管理工具，支持进度追踪、审核确认、存证管理',
  keywords: ['奕諾', '服务进度', '交付管理', '闲鱼工具', '存证管家'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
