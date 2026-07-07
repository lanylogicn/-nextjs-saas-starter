/**
 * @component Footer（底部信息栏）
 * @description
 * 专业4列布局：
 * - 品牌列：Logo + 一句话定位
 * - 产品列：首页/买家查询/服务计划中心
 * - 支持列：联系我们/帮助中心/交付报告查验
 * - 法律列：用户协议/隐私政策/ICP备案预留
 * 底部：版权信息 + 备案号预留 + 联系方式
 * 内部链接使用 next/link，外部链接使用 <a>
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ContactModal from './ContactModal';

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 border-t border-slate-800">
        {/* Main footer content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo-yinuo.png" alt="奕諾" className="h-8 w-8 drop-shadow-[0_0_8px_rgba(0,255,255,0.35)]" />
                <span className="text-white font-semibold text-base">奕诺</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                专业服务交付存证平台<br />
                让每一次交付，都有据可查
              </p>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide mb-4">产品功能</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">卖家工作台</Link>
                </li>
                <li>
                  <Link href="/buyer" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">买家查询</Link>
                </li>
                <li>
                  <Link href="/upgrade" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">服务计划中心</Link>
                </li>
                <li>
                  <Link href="/verify" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">公证查验</Link>
                </li>
                <li>
                  <Link href="/guide" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">使用指南</Link>
                </li>
              </ul>
            </div>

            {/* Support column */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide mb-4">支持与帮助</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    联系客服
                  </button>
                </li>
                <li>
                  <Link href="/guide" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">使用指南</Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">常见问题</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">隐私政策</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">服务条款</Link>
                </li>
              </ul>
            </div>

            {/* Contact & Verification column */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide mb-4">公证查验</h4>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                每份交付报告均含唯一公证编号，扫描二维码或输入编号即可在线查验真伪。
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                前往查验
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span>&copy; {new Date().getFullYear()} 奕諾</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">保留所有权利</span>
              </div>
              <div className="flex items-center gap-4">
                <span>ICP备案号：待备案</span>
                <span>·</span>
                <button
                  onClick={() => setContactOpen(true)}
                  className="hover:text-slate-300 transition-colors"
                >
                  联系我们
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
