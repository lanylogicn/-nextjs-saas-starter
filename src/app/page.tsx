/**
 * @file 首页 / 卖家面板
 * @description
 * 奕诺产品的核心页面，承担双重角色：
 * 1. 未登录时 → Landing Page：展示品牌标语、核心功能介绍、使用步骤、关于我们、CTA
 * 2. 已登录时 → 卖家工作台：功能卡片导航（创建服务单/我的服务单/通知中心/服务计划中心/信誉主页/导出记录/交付喜报）
 *    + 服务单列表管理 + 订单详情 + 进度推进 + 交付报告弹窗 + 交付喜报弹窗
 *
 * 关键依赖：
 * - useAuth() 提供登录状态
 * - DeliveryReportModal  专业交付报告弹窗
 * - CelebrationModal     交付喜报弹窗
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ClipboardList, FileSearch, Crown, Download, Palette, Bell, Award, PartyPopper, Copy, Check } from 'lucide-react';
import DeliveryReportModal from '@/components/seller/DeliveryReportModal';
import CelebrationModal from '@/components/seller/CelebrationModal';

const NODE_LABELS: Record<number, string> = {
  1: '下单支付', 2: '需求确认', 3: '制作中',
  4: '初稿交付', 5: '修改调整', 6: '终稿交付', 7: '确认收货',
};

const NODE_COLORS: Record<number, string> = {
  1: 'bg-indigo-600', 2: 'bg-indigo-600', 3: 'bg-indigo-600',
  4: 'bg-orange-600', 5: 'bg-emerald-600', 6: 'bg-emerald-600', 7: 'bg-emerald-600',
};

interface Order {
  id: string; order_no: string; buyer_nickname: string; seller_id: string; service_type: string;
  service_content: string; current_node: number; estimated_delivery: string;
  amount?: number; price?: number; completed_at?: string;
  created_at: string; updated_at: string;
}

interface Message {
  id: string; title: string; content: string; type: string; is_read: boolean; created_at: string;
}

function Timeline({ order }: { order: Order }) {
  const created = new Date(order.created_at);
  const current = order.current_node;
  const SUB_DATA: Record<number, {label:string;desc:string;time:string}[]> = {
    1: [{label:'买家已下单',desc:'订单已被系统接收',time:'10:30'},{label:'卖家已确认接单',desc:'已确认订单内容',time:'10:45'}],
    2: [{label:'分析需求细节',desc:'正在梳理买家具体需求',time:'14:00'},{label:'制定执行方案',desc:'已确定服务方案',time:'15:30'}],
    3: [{label:'素材搜集与整理',desc:'相关素材已搜集完成',time:'09:00'},{label:'核心内容制作中',desc:'正在执行制作任务',time:'11:20'},{label:'初版设计定稿',desc:'设计初版完成',time:'16:00'}],
    4: [{label:'初稿已生成',desc:'初稿已上传等待审核',time:'17:00'}],
    5: [{label:'买家已通过审核',desc:'终稿已通过审核',time:'10:00'}],
    6: [{label:'文件已发送',desc:'终稿文件已发送',time:'11:00'},{label:'买家已签收',desc:'买家已确认收到',time:'11:30'}],
    7: [{label:'交易完成',desc:'服务全流程结束',time:'14:00'}],
  };
  const timeline = Array.from({length:7},(_,i)=>{
    const n=i+1, d=new Date(created.getTime()+n*6*3600000);
    const ts=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return {node:n,label:NODE_LABELS[n],desc:n<current?'此节点已完成':n===current?(SUB_DATA[n]?.[SUB_DATA[n].length-1]?.desc||'处理中...'):'等待中',ts,completed:n<current,active:n===current,subs:SUB_DATA[n]||[]};
  });
  return (
    <div className='relative space-y-0'>
      {timeline.map((e,idx)=>(
        <div key={e.node} className='relative flex gap-4'>
          <div className='flex flex-col items-center'>
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${e.completed?'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30':e.active?'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-300 text-white shadow-lg shadow-indigo-500/40 timeline-pulse':'bg-slate-800 border-slate-600 text-slate-500'}`}>
              {e.completed?<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg>:e.node}
            </div>
            {idx<6&&<div className={`w-0.5 flex-1 min-h-[20px] ${e.completed?'bg-gradient-to-b from-indigo-500 to-indigo-400/50':'bg-slate-700/50'}`}/>}
          </div>
          <div className='flex-1 pb-5'>
            <div className={`rounded-xl p-4 transition-all ${e.active?'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5':e.completed?'bg-white/5 border border-white/5':'bg-slate-800/30 border border-slate-700/30'}`}>
              <div className='flex items-center justify-between mb-1.5'>
                <span className={`text-sm font-semibold ${e.active?'text-indigo-300':e.completed?'text-white/90':'text-slate-500'}`}>{e.label}</span>
                <span className={`text-xs font-mono ${e.active?'text-indigo-400/80':'text-slate-600'}`}>{e.ts}</span>
              </div>
              <p className={`text-xs ${e.active?'text-slate-300':e.completed?'text-slate-400/80':'text-slate-600'}`}>{e.desc}</p>
              {e.subs.length>0&&(
                <div className='mt-3 space-y-2 pl-2 border-l-2 border-indigo-500/20'>
                  {e.subs.map((s,si)=>(
                    <div key={si} className='flex items-start gap-2.5'>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${e.active?'bg-indigo-400 sub-node-glow':'bg-slate-600'}`}/>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <span className={`text-xs font-medium ${e.active?'text-slate-200':'text-slate-500'}`}>{s.label}</span>
                          <span className='text-[10px] font-mono text-slate-600 ml-2 flex-shrink-0'>{s.time}</span>
                        </div>
                        <p className='text-[11px] text-slate-500 mt-0.5 truncate'>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [createForm, setCreateForm] = useState({ service_type: '', buyer_nickname: '', service_content: '', estimated_delivery: '' });
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'home' | 'orders' | 'notifications'>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);
  const [celebrationOrderId, setCelebrationOrderId] = useState<string | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('yinuo_onboarding_seen');
    if (!seen) setShowOnboarding(true);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/orders', { credentials: 'same-origin' });
      if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
    } catch { /* ignore */ }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/messages', { credentials: 'same-origin' });
      if (res.ok) { const data = await res.json(); setMessages(data.messages || []); }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ ...createForm, estimated_delivery: createForm.estimated_delivery || null }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.needUpgrade ? ' — 点击"升级服务计划"了解更多' : ''));
      } else {
        setCreateForm({ service_type: '', buyer_nickname: '', service_content: '', estimated_delivery: '' });
        setCreateOpen(false);
        fetchOrders();
      }
    } catch { setError('创建失败'); }
  };

  const handleAdvance = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', credentials: 'same-origin' });
      const data = await res.json();
      if (data.error) alert(data.error); else { fetchOrders(); fetchMessages(); }
    } catch { alert('操作失败'); }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('yinuo_onboarding_seen', 'true');
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const membershipLabel = user?.membership_level === 'pro' ? '普通版' : user?.membership_level === 'flagship' ? '完整版' : '测试版';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-indigo-700 text-lg">加载中...</div></div>;
  }

  // ========== NOT LOGGED IN: Product Landing Page ==========
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" />
          {/* Decorative elements */}
          <div className="absolute top-12 left-1/4 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-12 right-1/4 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />

          <div className="relative max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-sm font-medium text-indigo-800">专业存证 · 全程可溯 · 信誉保障</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              <span className="text-stone-800">让每一次交付</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">都有据可查</span>
            </h1>

            <p className="text-lg sm:text-xl text-stone-500 mb-10 leading-relaxed max-w-xl mx-auto">
              奕諾为定制服务提供全链路交付管理——从订单到验收，每一步进度透明、每一份报告可公证、每一份信誉可验证
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const event = new CustomEvent('open-auth', { detail: { view: 'login' } });
                  window.dispatchEvent(event);
                }}
                className="group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-lg font-semibold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
              >
                立即创建服务单
                <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <Link
                href="/buyer"
                className="px-8 py-3.5 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 text-lg font-semibold rounded-xl transition-all text-center hover:-translate-y-0.5"
              >
                买家查询进度
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-stone-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                7节点全程存证
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                公证编号可查验
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                信誉体系可追溯
              </span>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
          {/* Decorative blurs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                核心功能
              </h2>
              <p className="text-blue-200/70 text-base md:text-lg max-w-2xl mx-auto">
                从进度管理到信誉建设，为定制服务交付提供全链路保障
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[
                {
                  title: '卖家信誉名片',
                  desc: '为每位卖家生成专属信誉主页，聚合核心数据，生成精美长图一键分享',
                  color: 'from-blue-500 to-cyan-400',
                  glow: 'group-hover:shadow-blue-500/25',
                  border: 'group-hover:border-blue-400/40',
                  iconBg: 'from-blue-500/20 to-cyan-400/20',
                  iconColor: 'text-blue-400',
                  points: ['入驻天数·订单数·审核通过率等聚合展示', '一键生成信誉长图，自带Logo和二维码', '复制信誉宣言，粘贴到闲鱼等平台'],
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <rect x="6" y="4" width="36" height="40" rx="4" className="stroke-current" strokeWidth="2.5" />
                      <circle cx="24" cy="18" r="6" className="stroke-current" strokeWidth="2.5" />
                      <path d="M14 34c0-5.523 4.477-10 10-10s10 4.477 10 10" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
                      <rect x="8" y="40" width="12" height="2" rx="1" className="fill-current opacity-40" />
                    </svg>
                  ),
                },
                {
                  title: '专业交付报告',
                  desc: '专业级交付凭证，含全流程时间轴与公证编号，扫码即可查验真伪',
                  color: 'from-violet-500 to-purple-400',
                  glow: 'group-hover:shadow-violet-500/25',
                  border: 'group-hover:border-violet-400/40',
                  iconBg: 'from-violet-500/20 to-purple-400/20',
                  iconColor: 'text-violet-400',
                  points: ['全流程时间轴·审核记录·修改详情', '自动生成交付小结与效率对比', '唯一公证编号 + 查验二维码'],
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <path d="M8 6h24l8 8v28a4 4 0 01-4 4H12a4 4 0 01-4-4V10a4 4 0 014-4z" className="stroke-current" strokeWidth="2.5" />
                      <path d="M32 6v8h8" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 22h16M16 28h12M16 34h8" className="stroke-current" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                      <circle cx="35" cy="37" r="5" className="stroke-current" strokeWidth="2" />
                      <path d="M35 35v4M35 41v0.01" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: '卖家成就徽章',
                  desc: '系统自动检测条件并颁发徽章，展示在信誉主页和长图上',
                  color: 'from-indigo-500 to-yellow-400',
                  glow: 'group-hover:shadow-indigo-500/25',
                  border: 'group-hover:border-indigo-400/40',
                  iconBg: 'from-indigo-500/20 to-yellow-400/20',
                  iconColor: 'text-indigo-400',
                  points: ['🚀 极速交付：10次提前24h完成', '🎯 一次过稿：连续5次零驳回', '👑 金牌口碑：累计20次买家好评'],
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <path d="M24 4l5.5 11.2L42 17l-9 8.8L35 38l-11-5.8L13 38l2-12.2L6 17l12.5-1.8L24 4z" className="stroke-current" strokeWidth="2.5" strokeLinejoin="round" />
                      <circle cx="24" cy="21" r="5" className="stroke-current" strokeWidth="2" />
                      <path d="M21 21l2 2 4-4" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: '交付喜报',
                  desc: '完成订单自动生成精美喜报，展示核心数据，附带分享文案',
                  color: 'from-rose-500 to-pink-400',
                  glow: 'group-hover:shadow-rose-500/25',
                  border: 'group-hover:border-rose-400/40',
                  iconBg: 'from-rose-500/20 to-pink-400/20',
                  iconColor: 'text-rose-400',
                  points: ['3种风格喜报：简约 / 数据 / 喜庆', '展示核心数据（如一次过稿·提前交付）', '附带分享文案，一键复制发布'],
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <rect x="8" y="6" width="32" height="36" rx="3" className="stroke-current" strokeWidth="2.5" />
                      <path d="M18 6v-2a6 6 0 0112 0v2" className="stroke-current" strokeWidth="2.5" />
                      <circle cx="24" cy="22" r="6" className="stroke-current" strokeWidth="2.5" />
                      <path d="M21 22l2 2 4-4" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 32h16" className="stroke-current" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      <path d="M20 36h8" className="stroke-current" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    </svg>
                  ),
                },
                {
                  title: '全程可追溯',
                  desc: '7节点进度透明展示，买家实时查看，所有操作记录留痕存证',
                  color: 'from-emerald-500 to-teal-400',
                  glow: 'group-hover:shadow-emerald-500/25',
                  border: 'group-hover:border-emerald-400/40',
                  iconBg: 'from-emerald-500/20 to-teal-400/20',
                  iconColor: 'text-emerald-400',
                  points: ['7节点进度透明展示', '买家实时查看处理进度', '所有操作留痕，支持一键导出存证'],
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <path d="M8 12h32M8 24h32M8 36h32" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                      <circle cx="16" cy="12" r="4" className="stroke-current" strokeWidth="2.5" />
                      <circle cx="32" cy="24" r="4" className="stroke-current" strokeWidth="2.5" />
                      <circle cx="20" cy="36" r="4" className="stroke-current" strokeWidth="2.5" />
                      <path d="M20 12h12M8 24h20M24 36h8" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: 'AI 检测报告',
                  desc: '多维度文本分析，智能检测交付物原创性，AIGC疑似度一目了然',
                  color: 'from-blue-500 to-violet-400',
                  glow: 'group-hover:shadow-blue-500/25',
                  border: 'group-hover:border-blue-400/40',
                  iconBg: 'from-blue-500/20 to-violet-400/20',
                  iconColor: 'text-blue-400',
                  points: ['5大检测维度分析', '自动生成检测报告', '公证编号存证'],
                  href: '/ai-detection',
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <path d="M20 6v14l-8 6V6h8z" className="stroke-current" strokeWidth="2.5" strokeLinejoin="round" />
                      <path d="M20 6h8v14l8 6V6H20z" className="stroke-current" strokeWidth="2.5" strokeLinejoin="round" opacity="0.5" />
                      <path d="M12 26v10c0 3.314 5.373 6 12 6s12-2.686 12-6V26" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="36" cy="36" r="4" className="stroke-current" strokeWidth="2" />
                      <path d="M36 34v4M34 36h4" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: '品类化交付模板',
                  desc: '覆盖PPT、论文、文案等6大品类，标准化交付清单一键勾选',
                  color: 'from-emerald-500 to-cyan-400',
                  glow: 'group-hover:shadow-emerald-500/25',
                  border: 'group-hover:border-emerald-400/40',
                  iconBg: 'from-emerald-500/20 to-cyan-400/20',
                  iconColor: 'text-emerald-400',
                  points: ['6大品类标准模板', '交付清单可勾选', '自动计算完成进度'],
                  href: '/templates',
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <rect x="6" y="8" width="36" height="32" rx="4" className="stroke-current" strokeWidth="2.5" />
                      <path d="M6 16h36" className="stroke-current" strokeWidth="2.5" />
                      <path d="M14 24h20M14 30h16M14 36h12" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                      <rect x="10" y="22" width="4" height="4" rx="1" className="stroke-current" strokeWidth="2" />
                      <path d="M11 24l1.5 1.5L14 23" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: '版权声明模块',
                  desc: '为交付物附带正式版权声明，明确原创性与版权归属',
                  color: 'from-amber-500 to-orange-400',
                  glow: 'group-hover:shadow-amber-500/25',
                  border: 'group-hover:border-amber-400/40',
                  iconBg: 'from-amber-500/20 to-orange-400/20',
                  iconColor: 'text-amber-400',
                  points: ['原创性声明', '多种授权协议', '公证编号存证'],
                  href: '/copyright',
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                      <circle cx="24" cy="24" r="16" className="stroke-current" strokeWidth="2.5" />
                      <path d="M24 14v10l6 4" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 32c2-2 4-3 6-3s4 1 6 3" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="24" cy="24" r="3" className="stroke-current" strokeWidth="2" />
                    </svg>
                  ),
                },
              ].map((f, i) => (
                <Link
                  key={f.title}
                  href={f.href || '#'}
                  className="feature-card group relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 block"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Gradient glow on hover */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />

                  <div className="relative">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${f.iconBg} ${f.iconColor} mb-4`}>
                      {f.svg}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>

                    {/* Description */}
                    <p className="text-sm text-blue-100/60 leading-relaxed mb-4">{f.desc}</p>

                    {/* Points list */}
                    <ul className="space-y-2">
                      {f.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-blue-100/50">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${f.color} shrink-0`} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <style jsx>{`
            .feature-card {
              opacity: 0;
              transform: translateY(24px);
              animation: fadeInUp 0.6s ease-out forwards;
            }
            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .feature-card {
                opacity: 1;
                transform: none;
                animation: none;
              }
            }
          `}</style>
        </section>

        {/* How it works */}
        <section id="about" className="py-20 px-4 bg-gradient-to-b from-white via-indigo-50/30 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 mb-3">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">四步开启专业交付</h2>
              <p className="mt-4 text-slate-500 text-base max-w-lg mx-auto">从创建服务单到交付存证，全程数字化记录，每一步都有据可查</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  step: 1,
                  title: '创建服务单',
                  desc: '填写服务类型与买家信息，系统自动生成唯一SV编号，开启交付追踪',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ),
                },
                {
                  step: 2,
                  title: '推进交付进度',
                  desc: '7节点进度体系，卖家逐步推进，到初稿阶段自动进入买家审核',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" />
                    </svg>
                  ),
                },
                {
                  step: 3,
                  title: '买家审核确认',
                  desc: '买家凭编号实时查看进度，通过或驳回附修改意见，审核记录永久留痕',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: 4,
                  title: '交付存证完成',
                  desc: '交付确认后生成专业报告与公证编号，全流程数据永久可追溯、可验证',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.153 9 11.251 5.176-1.098 9-5.659 9-11.251 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                  ),
                },
              ].map(s => (
                <div key={s.step} className="relative bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold tracking-wider text-indigo-500/60 uppercase">Step {s.step}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">{s.title}</h3>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-400 blur-[120px]" />
          </div>
          <div className="relative py-20 px-4 text-center">
            <div className="max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                免费开始使用
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                让每一次交付<br className="sm:hidden" />都有据可查
              </h2>
              <p className="text-indigo-200/70 mb-8 text-base leading-relaxed">
                测试版即可创建服务单，体验完整的交付存证流程<br className="hidden sm:block" />
                专业的进度管理，从奕諾开始
              </p>
              <button
                onClick={() => {
                  const event = new CustomEvent('open-auth', { detail: { view: 'register' } });
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 text-base font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5"
              >
            注册
              </button>
            </div>
          </div>
        </section>

        {/* Onboarding */}
        {showOnboarding && (
          <Dialog open={showOnboarding} onOpenChange={dismissOnboarding}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-indigo-800 text-xl">欢迎使用奕諾！</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-stone-600">
                {[
                  { n: 1, t: '卖家创建服务单', d: '登录后点击"创建服务单"，填写买家昵称和服务内容，系统自动生成SV编号' },
                  { n: 2, t: '推进交付进度', d: '卖家可以逐步推进7个节点，到"初稿完成"时等待买家审核' },
                  { n: 3, t: '买家查询进度', d: '买家在"查询进度"页面输入SV编号，即可查看进度并审核' },
                  { n: 4, t: '管理员后台', d: '访问 /admin 进入管理后台，管理用户、订单、财务等' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">{s.n}</div>
                    <div>
                      <p className="font-semibold text-stone-800">{s.t}</p>
                      <p>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={dismissOnboarding} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">我知道了</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // ========== LOGGED IN: Function Card Dashboard ==========
  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <div id="orders" className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(user.nickname || '用')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-indigo-900">你好，{user.nickname || '用户'}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {user.seller_id && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(user.seller_id!); setCopiedId(true); setTimeout(() => setCopiedId(false), 1500); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-sm hover:bg-indigo-100 transition-colors"
                    title="点击复制卖家ID"
                  >
                    卖家ID: {user.seller_id}
                    {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{membershipLabel}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Function Cards */}
        {activeSection === 'home' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle" onClick={() => setCreateOpen(true)}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                  <ClipboardList className="text-indigo-600" size={28} />
                </div>
                <h3 className="font-bold text-stone-800">创建服务单</h3>
                <p className="text-xs text-stone-500 mt-1">新建交付服务单，自动生成SV编号</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle" onClick={() => setActiveSection('orders')}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                  <FileSearch className="text-emerald-600" size={28} />
                </div>
                <h3 className="font-bold text-stone-800">我的服务单</h3>
                <p className="text-xs text-stone-500 mt-1">查看和管理所有服务单进度</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle" onClick={() => setActiveSection('notifications')}>
              <CardContent className="p-6 flex flex-col items-center text-center relative">
                {unreadCount > 0 && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadCount}</div>
                )}
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Bell className="text-blue-600" size={28} />
                </div>
                <h3 className="font-bold text-stone-800">通知中心</h3>
                <p className="text-xs text-stone-500 mt-1">查看站内消息和审核通知</p>
              </CardContent>
            </Card>

            <Link href="/upgrade">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <Crown className="text-purple-600" size={28} />
                  </div>
                  <h3 className="font-bold text-stone-800">服务计划中心</h3>
                  <p className="text-xs text-stone-500 mt-1">升级服务计划解锁更多功能</p>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/seller/${user.userId}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                    <Award className="text-indigo-600" size={28} />
                  </div>
                  <h3 className="font-bold text-stone-800">我的信誉主页</h3>
                  <p className="text-xs text-stone-500 mt-1">查看信誉名片和成就徽章</p>
                </CardContent>
              </Card>
            </Link>

            {(user.membership_level === 'pro' || user.membership_level === 'flagship') && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                    <Download className="text-teal-600" size={28} />
                  </div>
                  <h3 className="font-bold text-stone-800">导出审核记录</h3>
                  <p className="text-xs text-stone-500 mt-1">普通版及以上可用</p>
                </CardContent>
              </Card>
            )}

            {user.membership_level === 'flagship' && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-indigo-100 card-gradient-subtle">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                    <Palette className="text-pink-600" size={28} />
                  </div>
                  <h3 className="font-bold text-stone-800">自定义Logo</h3>
                  <p className="text-xs text-stone-500 mt-1">完整版专属功能</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* My Orders Section */}
        {activeSection === 'orders' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveSection('home')} className="text-indigo-600 hover:underline text-sm">&larr; 返回</button>
              <h2 className="text-xl font-bold text-indigo-900">我的服务单</h2>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <p>暂无服务单</p>
                <Button onClick={() => setCreateOpen(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">创建第一个服务单</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className='relative group'>
                    <div className='relative rounded-2xl overflow-hidden border border-indigo-500/15 bg-gradient-to-br from-[#0f1629] to-[#1a1f3a] shadow-2xl shadow-indigo-500/5'>
                      <div className='absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none'/>
                      <div className='absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none'/>
                      <div className='relative p-5'>
                        <div className='flex items-start justify-between mb-4'>
                          <div>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='font-mono text-indigo-400 font-bold text-sm tabular-nums'>{order.order_no}</span>
                              <span className='px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'>{order.service_type}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${order.current_node===7?'bg-emerald-500/15 text-emerald-400 border-emerald-500/20':order.current_node===4?'bg-orange-500/15 text-orange-400 border-orange-500/20':'bg-indigo-500/15 text-indigo-300 border-indigo-500/20'}`}>
                                {NODE_LABELS[order.current_node]}
                              </span>
                            </div>
                            <p className='text-sm text-slate-400 line-clamp-1'>{order.service_content}</p>
                          </div>
                          {(order.amount || order.price) && (
                            <span className='text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tabular-nums'>¥{((order.amount || order.price || 0) / 100).toFixed(2)}</span>
                          )}
                        </div>
                        {/* Timeline */}
                        <div className='mt-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2'>
                          <Timeline order={order} />
                        </div>
                        {/* Footer */}
                        <div className='flex items-center justify-between mt-4 pt-4 border-t border-white/5'>
                          <div className='flex flex-col gap-1'>
                            <span className='text-xs text-slate-500 font-mono'>创建：{new Date(order.created_at).toLocaleDateString('zh-CN')}</span>
                            {order.estimated_delivery && (
                              <span className='text-xs text-slate-500 font-mono'>预计交付：{new Date(order.estimated_delivery).toLocaleDateString('zh-CN')}</span>
                            )}
                            {order.completed_at && (
                              <span className='text-xs text-emerald-400 font-mono'>完成：{new Date(order.completed_at).toLocaleDateString('zh-CN')}</span>
                            )}
                          </div>
                          {order.current_node < 7 && order.current_node !== 4 && (
                            <button onClick={() => handleAdvance(order.id)} className='px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all'>
                              推进到「{NODE_LABELS[order.current_node + 1]}」
                            </button>
                          )}
                          {order.current_node === 4 && (
                            <span className='text-xs text-orange-400 font-medium bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20'>等待买家审核...</span>
                          )}
                          {order.current_node === 7 && (
                            <div className='flex gap-2'>
                              <button onClick={() => setReportOrderId(order.id)} className='px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-all flex items-center gap-1'>
                                <FileSearch className='w-3 h-3' />交付报告
                              </button>
                              <button onClick={() => setCelebrationOrderId(order.id)} className='px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 transition-all flex items-center gap-1'>
                                <PartyPopper className='w-3 h-3' />交付喜报
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveSection('home')} className="text-indigo-600 hover:underline text-sm">&larr; 返回</button>
              <h2 className="text-xl font-bold text-indigo-900">通知中心</h2>
            </div>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-400">暂无消息</div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <Card key={msg.id} className={msg.is_read ? 'border-stone-100' : 'border-indigo-200 bg-indigo-50/30'}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-stone-800">{msg.title}</p>
                        <p className="text-sm text-stone-600 mt-1">{msg.content}</p>
                        <p className="text-xs text-stone-400 mt-1">{new Date(msg.created_at).toLocaleString('zh-CN')}</p>
                      </div>
                      {!msg.is_read && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await fetch(`/api/messages/${msg.id}/read`, { method: 'POST', credentials: 'same-origin' });
                          fetchMessages();
                        }} className="shrink-0 text-indigo-700 border-indigo-300">已读</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">创建服务单</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
            <div>
              <Label>服务类型</Label>
              <Input placeholder="如：PPT设计、Logo设计、文案撰写" value={createForm.service_type} onChange={e => setCreateForm({ ...createForm, service_type: e.target.value })} className="mt-1" required />
            </div>
            <div>
              <Label>买家昵称</Label>
              <Input placeholder="买家的昵称" value={createForm.buyer_nickname} onChange={e => setCreateForm({ ...createForm, buyer_nickname: e.target.value })} className="mt-1" required />
            </div>
            <div>
              <Label>服务内容</Label>
              <Textarea placeholder="详细描述服务内容" value={createForm.service_content} onChange={e => setCreateForm({ ...createForm, service_content: e.target.value })} className="mt-1" required />
            </div>
            <div>
              <Label>预计交付日期（选填）</Label>
              <Input type="date" value={createForm.estimated_delivery} onChange={e => setCreateForm({ ...createForm, estimated_delivery: e.target.value })} className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">创建服务单</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Onboarding */}
      {showOnboarding && (
        <Dialog open={showOnboarding} onOpenChange={dismissOnboarding}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-indigo-800 text-xl">欢迎使用奕諾！</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm text-stone-600">
              {[
                { n: 1, t: '卖家创建服务单', d: '登录后点击"创建服务单"，填写买家昵称和服务内容，系统自动生成SV编号' },
                { n: 2, t: '推进交付进度', d: '卖家可以逐步推进7个节点，到"初稿完成"时等待买家审核' },
                { n: 3, t: '买家查询进度', d: '买家在"查询进度"页面输入SV编号，即可查看进度并审核' },
                { n: 4, t: '管理员后台', d: '访问 /admin 进入管理后台，管理用户、订单、财务等' },
              ].map(s => (
                <div key={s.n} className="flex gap-3 p-3 bg-indigo-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">{s.n}</div>
                  <div><p className="font-semibold text-stone-800">{s.t}</p><p>{s.d}</p></div>
                </div>
              ))}
            </div>
            <Button onClick={dismissOnboarding} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">我知道了</Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Professional Delivery Report Modal */}
      {reportOrderId && user && (
        <DeliveryReportModal
          orderId={reportOrderId}
          sellerId={user.userId}
          onClose={() => setReportOrderId(null)}
        />
      )}

      {/* Delivery Celebration Modal */}
      {celebrationOrderId && (
        <CelebrationModal
          orderId={celebrationOrderId}
          onClose={() => setCelebrationOrderId(null)}
        />
      )}
    </div>
  );
}
