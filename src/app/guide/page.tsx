/**
 * 使用指南页面
 * 路由：/guide
 * 功能：买家使用指南 + 卖家使用指南，图文说明，步骤清晰
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';

type GuideTab = 'buyer' | 'seller';

interface GuideStep {
  title: string;
  desc: string;
  icon: string;
}

const BUYER_GUIDE: GuideStep[] = [
  { title: '查询订单进度', desc: '在买家查询页输入卖家提供的服务单编号（如 SV000001），即可实时查看订单处理进度。7个节点透明展示，每步操作留痕可追溯。', icon: '🔍' },
  { title: '跟踪7节点进度', desc: '进度系统包含7个节点：订单接收 → 需求梳理 → 制作中 → 初稿完成 → 审核通过 → 终稿交付 → 确认完成。每个节点状态变化都会实时更新。', icon: '📊' },
  { title: '审核初稿', desc: '当订单推进到「初稿完成等待审核」节点时，买家需要对初稿进行审核。点击「通过」继续推进，点击「驳回」附上原因退回修改。', icon: '✅' },
  { title: '使用高级功能', desc: '买家可使用高级功能：优先审核（加快审核速度）、专业交付报告（获取含公证编号的报告）、进度卡片（在商品页展示进度）。需卖家开通相应功能。', icon: '⭐' },
  { title: '查验交付报告', desc: '收到交付报告后，可通过公证编号或扫描二维码在「公证查验」页面验证报告真伪。每份报告都有唯一公证编号和查验链接。', icon: '🔐' },
  { title: '查看卖家信誉', desc: '在卖家信誉名片页，可以查看卖家的入驻天数、累计订单、审核通过率、成就徽章等信息，帮助判断卖家服务质量。', icon: '🏅' },
];

const SELLER_GUIDE: GuideStep[] = [
  { title: '注册账号', desc: '点击首页「注册」按钮，使用手机号+验证码+密码完成注册。系统会自动生成唯一的卖家ID。', icon: '📝' },
  { title: '创建服务单', desc: '登录后在商家后台点击「新建服务单」，填写买家联系方式、服务类型、需求描述、预计交付时间等信息。系统自动生成唯一编号。', icon: '📋' },
  { title: '推进进度', desc: '在订单列表中点击「推进进度」，将订单推进到下一个节点。每次推进都会记录操作日志，买家可实时查看。', icon: '▶️' },
  { title: '等待买家审核', desc: '推到「初稿完成等待审核」节点后，需等待买家审核。买家通过后可继续推进；驳回后订单回到「制作中」节点重新修改。', icon: '⏳' },
  { title: '使用交付报告', desc: '开通专业交付报告功能后，可为已完成的订单生成交付报告。报告包含全流程时间轴、审核记录、交付小结和公证编号。', icon: '📄' },
  { title: '展示信誉名片', desc: '开通信誉名片功能后，可生成专属信誉主页。页面展示你的入驻天数、订单数据、审核通过率和成就徽章，支持复制信誉宣言和生成信誉长图。', icon: '🌟' },
  { title: '获取成就徽章', desc: '系统自动检测并颁发成就徽章：极速交付（10次提前完成）、一次过稿（连续5次无驳回）、金牌口碑（20次好评）。徽章展示在信誉主页上。', icon: '🏆' },
  { title: '升级服务计划', desc: '测试版最多5个服务单，普通版最多50个，完整版无限制。点击「升级服务计划」联系客服进行升级。', icon: '🚀' },
];

export default function GuidePage() {
  const [tab, setTab] = useState<GuideTab>('buyer');

  const steps = tab === 'buyer' ? BUYER_GUIDE : SELLER_GUIDE;

  return (
    <div className="min-h-screen bg-page-gradient py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">使用指南</h1>
          <p className="text-slate-500">快速了解奕诺平台的核心功能和使用方式</p>
        </div>

        {/* Tab切换 */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-8 max-w-xs mx-auto">
          <button
            onClick={() => setTab('buyer')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'buyer' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            买家指南
          </button>
          <button
            onClick={() => setTab('seller')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'seller' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            卖家指南
          </button>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">步骤 {idx + 1}</span>
                    <h3 className="font-semibold text-slate-800">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部链接 */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm mb-3">还有其他问题？</p>
          <div className="flex gap-4 justify-center">
            <Link href="/faq" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">查看常见问题</Link>
            <Link href="/verify" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">公证查验</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
