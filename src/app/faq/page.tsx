/**
 * 常见问题页面
 * 路由：/faq
 * 功能：手风琴式FAQ列表，支持搜索，至少10个常见问题
 */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: '注册与登录',
    q: '如何注册奕诺账号？',
    a: '点击首页右上角「注册」按钮，使用手机号+短信验证码+密码即可完成注册。验证码测试模式固定为123456，正式环境会发送真实短信。',
  },
  {
    category: '注册与登录',
    q: '忘记密码怎么办？',
    a: '在登录弹窗点击「忘记密码」，输入手机号和验证码验证身份后即可重置密码并自动登录。',
  },
  {
    category: '订单与进度',
    q: '买家如何查询订单进度？',
    a: '在「买家查询」页面输入卖家提供的服务单编号（如SV000001），即可查看7节点进度详情。无需登录，直接输入编号即可查询。',
  },
  {
    category: '订单与进度',
    q: '7节点进度是什么？',
    a: '每个服务单有7个节点：订单接收 → 需求梳理 → 制作中 → 初稿完成等待审核 → 审核通过终稿输出 → 终稿已交付 → 确认完成。节点4（初稿完成）需要买家审核通过才能继续，驳回则回到节点3。',
  },
  {
    category: '订单与进度',
    q: '买家如何审核初稿？',
    a: '当卖家推进到「初稿完成等待审核」节点时，买家在查询页面可以看到审核按钮。点击「通过」继续流程，点击「驳回」并填写原因后订单退回修改阶段。',
  },
  {
    category: '会员与升级',
    q: '会员等级有什么区别？',
    a: '测试版免费，最多5个服务单；普通版最多50个服务单，可导出审核记录；完整版无服务单数量限制，享有全部高级功能。升级请联系客服。',
  },
  {
    category: '会员与升级',
    q: '如何升级服务计划？',
    a: '在「服务计划中心」页面选择合适的版本，点击升级按钮后会弹出联系客服的弹窗。客服会帮您完成升级流程。',
  },
  {
    category: '高级功能',
    q: '什么是专业交付报告？',
    a: '专业交付报告是订单完成后的详细交付凭证，包含全流程时间轴、客户审核记录、修改记录详情和交付小结。每份报告有唯一公证编号，可通过公证查验页面验证真伪。',
  },
  {
    category: '高级功能',
    q: '卖家信誉名片是什么？',
    a: '信誉名片是卖家的专属主页，展示入驻天数、累计订单、审核通过率、成就徽章等信息。卖家可以将信誉宣言复制到闲鱼等平台，或生成信誉长图分享。',
  },
  {
    category: '数据与安全',
    q: '我的数据安全吗？',
    a: '奕诺使用Supabase（基于PostgreSQL）存储数据，所有密码使用bcrypt加密，认证使用JWT+httpOnly Cookie。操作日志完整记录，数据全程可追溯。',
  },
  {
    category: '数据与安全',
    q: '公证查验是如何工作的？',
    a: '每份交付报告自动生成唯一公证编号和查验Token。扫描报告上的二维码或输入公证编号，即可在公证查验页面验证报告真伪，查看报告详情。',
  },
  {
    category: '其他',
    q: '如何联系客服？',
    a: '在任意页面点击「联系我们」或「联系客服」按钮，即可查看客服联系方式。工作时间为周一至周五 9:00-18:00。',
  },
];

const CATEGORIES = ['全部', ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCat = category === '全部' || f.category === category;
      const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-page-gradient py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">常见问题</h1>
          <p className="text-slate-500">查找关于奕诺平台常见问题的解答</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索问题..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
          />
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ列表 */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-slate-400 py-10">未找到相关问题</div>
          )}
          {filtered.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">{faq.category}</span>
                  <span className="text-sm font-medium text-slate-800">{faq.q}</span>
                </div>
                <span className={`text-slate-400 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部链接 */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm mb-3">还有其他问题？</p>
          <div className="flex gap-4 justify-center">
            <Link href="/guide" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">查看使用指南</Link>
            <Link href="/verify" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">公证查验</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
