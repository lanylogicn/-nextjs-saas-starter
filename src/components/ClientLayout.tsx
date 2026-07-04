/**
 * @component ClientLayout（客户端根布局）
 * @description
 * 包装所有页面内容，提供：
 * - AuthProvider：全局认证上下文（登录状态/用户信息）
 * - Navbar：顶部导航栏（品牌Logo/首页/买家查询/服务计划中心/登录按钮/用户菜单）
 * - Footer：底部信息栏（品牌/产品/支持/法律 四列布局）
 * - 新手引导弹窗（首次访问时展示）
 * - ContactModal：联系客服弹窗
 */
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <Navbar />
      <AuthModal />
      <div className="pt-14 min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
