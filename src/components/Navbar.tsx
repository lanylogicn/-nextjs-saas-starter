/**
 * @component Navbar（顶部导航栏）
 * @description
 * 全站通用导航栏，白底+极淡底影。
 * 包含：品牌名「奕诺」(indigo-600)、首页/买家查询/服务计划中心链接。
 * 未登录时显示「注册」「登录」按钮；已登录时显示用户名+下拉菜单（我的订单/服务计划中心/退出）。
 * 移动端折叠为汉堡菜单。
 *
 * 依赖：useAuth()，next/link
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (_e) { /* ignore */ }
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo-yinuo.png" alt="奕諾" className="h-10 w-10 rounded-full drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-shadow group-hover:drop-shadow-[0_0_16px_rgba(0,255,255,0.6)]" />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Service plan link */}
                <a
                  href="/upgrade"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-md hover:bg-indigo-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  服务计划中心
                </a>

                {/* User menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full p-0.5 hover:bg-slate-100 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        {(user.nickname || user.userId || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm text-slate-600 font-medium max-w-[80px] truncate">
                      {user.nickname || user.userId}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-700 truncate">{user.nickname || user.userId}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {user.membership_level === 'free' ? '测试版' : user.membership_level === 'pro' ? '普通版' : '完整版'}会员
                        </p>
                      </div>
                      <a
                        href="/upgrade"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors sm:hidden"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        服务计划中心
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'register' } }))}
                  className="inline-flex items-center justify-center h-8 px-3.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  注册
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: { view: 'login' } }))}
                  className="inline-flex items-center justify-center h-8 px-4 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                >
                  登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
