/**
 * @file 买家查询页 - 深色科技风格
 * @description
 * 买家通过SV编号查询服务单进度，无需登录。
 * 集成物流时间线、节点交互、进展记录。
 *
 * 路由：/buyer
 * API：GET /api/buyer/[orderNo]，POST /api/orders/[id]/review
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LogisticsTimeline } from '@/components/service/logistics-timeline';
import { ServiceProgressHistory } from '@/components/ServiceProgressHistory';
import {
  Search,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  Shield,
  Clock,
  Eye,
  AlertTriangle,
  ChevronRight,
  Truck,
  ClipboardCheck,
  Edit,
  PartyPopper,
  CheckCircle2,
  Send,
} from 'lucide-react';

const NODE_LABELS: Record<number, string> = {
  1: '订单接收',
  2: '需求梳理',
  3: '制作中',
  4: '初稿完成，等待客户审核',
  5: '审核通过，终稿输出',
  6: '终稿已交付',
  7: '确认完成',
};

const SERVICE_NODES = [
  { id: 1, name: '下单支付', icon: Package, gradient: 'from-blue-500 to-cyan-400' },
  { id: 2, name: '需求确认', icon: ClipboardCheck, gradient: 'from-indigo-500 to-blue-400' },
  { id: 3, name: '制作中', icon: Truck, gradient: 'from-violet-500 to-indigo-400' },
  { id: 4, name: '初稿交付', icon: Send, gradient: 'from-orange-500 to-amber-400' },
  { id: 5, name: '修改调整', icon: Edit, gradient: 'from-amber-500 to-yellow-400' },
  { id: 6, name: '终稿交付', icon: FileText, gradient: 'from-emerald-500 to-green-400' },
  { id: 7, name: '确认收货', icon: CheckCircle2, gradient: 'from-green-500 to-emerald-400' },
];

interface OrderInfo {
  id: string;
  order_no: string;
  buyer_nickname: string;
  service_type: string;
  service_content: string;
  current_node: number;
  estimated_delivery: string;
  created_at: string;
}

interface LogInfo {
  node: number;
  action: string;
  operator_type: string;
  rejection_reason: string;
  created_at: string;
}

interface ProgressItem {
  id: string;
  node_index: number;
  sub_node_index?: number;
  title: string;
  description?: string;
  image_urls?: string[];
  operator_type: string;
  is_virtual: boolean;
  created_at: string;
}

// Transform logs into progress items for timeline
function transformLogsToProgress(logs: LogInfo[], currentNode: number): ProgressItem[] {
  const items: ProgressItem[] = [];

  // Add virtual node for current status
  const currentNodeDef = SERVICE_NODES.find((n) => n.id === currentNode);
  if (currentNodeDef) {
    items.push({
      id: 'virtual-current',
      node_index: currentNode,
      title: `当前：${currentNodeDef.name}`,
      description: currentNode === 4 ? '等待买家审核初稿' : currentNode >= 6 ? '交付已完成' : '卖家正在处理中',
      operator_type: 'system',
      is_virtual: true,
      created_at: new Date().toISOString(),
    });
  }

  // Transform logs
  logs.forEach((log, idx) => {
    let title = '';
    let description = '';

    if (log.action === 'advance') {
      title = `推进到${NODE_LABELS[log.node] || `节点${log.node}`}`;
      description = '卖家更新了服务进度';
    } else if (log.action === 'approve') {
      title = '买家审核通过';
      description = '初稿审核通过，继续推进终稿输出';
    } else if (log.action === 'reject') {
      title = '买家驳回修改';
      description = log.rejection_reason || '初稿需要修改';
    } else if (log.action === 'create') {
      title = '订单已创建';
      description = '买家已下单，等待卖家接收';
    }

    if (title) {
      items.push({
        id: `log-${idx}`,
        node_index: log.node,
        title,
        description,
        operator_type: log.operator_type,
        is_virtual: false,
        created_at: log.created_at,
      });
    }
  });

  return items;
}

export default function BuyerPage() {
  const [orderNo, setOrderNo] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [logs, setLogs] = useState<LogInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);

  const handleQuery = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!orderNo.trim()) return;
      setLoading(true);
      setError('');
      setOrder(null);
      setLogs([]);
      try {
        const res = await fetch(`/api/buyer/${orderNo.trim()}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data.order);
          setLogs(data.logs || []);
        }
      } catch {
        setError('查询失败，请检查网络');
      } finally {
        setLoading(false);
      }
    },
    [orderNo]
  );

  const handleReview = async () => {
    if (!order || !reviewAction) return;
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      alert('请填写修改意见');
      return;
    }
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          rejection_reason: reviewAction === 'reject' ? rejectionReason : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setReviewAction(null);
        setRejectionReason('');
        setShowRejectInput(false);
        // Re-query
        await handleQuery();
        setProgressRefreshKey((k) => k + 1);
      }
    } catch {
      alert('操作失败');
    } finally {
      setReviewLoading(false);
    }
  };

  const progress = order ? transformLogsToProgress(logs, order.current_node) : [];
  const currentNodeDef = order
    ? SERVICE_NODES.find((n) => n.id === order.current_node)
    : null;
  const CurrentIcon = currentNodeDef?.icon || Package;

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-20">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Query Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
            <Shield size={14} />
            全程可溯 · 交付可验
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">查询服务进度</h1>
          <p className="text-slate-400 text-sm">
            输入卖家提供的SV编号，实时查看交付进度
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-[#2a3a5f] rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
          <form onSubmit={handleQuery} className="relative flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="请输入SV编号，如 SV240101ABC123"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#2a3a5f] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? '查询中...' : '查询'}
            </button>
          </form>

          {error && (
            <div className="relative mt-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {order && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Current Status Card */}
            <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentNodeDef?.gradient || 'from-blue-500 to-cyan-400'} flex items-center justify-center shadow-lg ${order.current_node === 4 ? 'node-pulse' : ''}`}
                  >
                    <CurrentIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">当前状态</p>
                    <p className="text-xl font-bold text-white">
                      {NODE_LABELS[order.current_node]}
                    </p>
                    {order.current_node === 4 && (
                      <p className="text-sm text-orange-400 mt-0.5">
                        需要您审核初稿
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-blue-400 font-bold text-sm">
                      {order.order_no}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      第{order.current_node}步 / 共7步
                    </p>
                  </div>
                </div>

                {/* Order info grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a3a5f]/50">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">买家</p>
                    <p className="text-sm text-slate-300">
                      {order.buyer_nickname}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">服务类型</p>
                    <p className="text-sm text-slate-300">
                      {order.service_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">预计交付</p>
                    <p className="text-sm text-slate-300">
                      {order.estimated_delivery || '未设置'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">创建时间</p>
                    <p className="text-sm text-slate-300">
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold text-white">进展时间线</h2>
              </div>
              <LogisticsTimeline
                progress={progress}
                currentNode={order.current_node}
              />
            </div>

            {/* Node-specific interactions */}

            {/* Node 1-2: Payment upload area */}
            {order.current_node <= 2 && (
              <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={20} className="text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">上传付款凭证</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  请上传您的付款截图，方便卖家确认订单并开始制作
                </p>
                <ServiceProgressHistory
                  orderId={order.id}
                  refreshKey={progressRefreshKey}
                />
              </div>
            )}

            {/* Node 3: View progress (制作中) */}
            {order.current_node === 3 && (
              <div className="space-y-6">
                <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck size={20} className="text-violet-400" />
                    <h2 className="text-lg font-bold text-white">制作进展</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    卖家正在为您制作中，以下是最新进展记录
                  </p>
                  <ServiceProgressHistory
                    orderId={order.id}
                    refreshKey={progressRefreshKey}
                  />
                </div>
              </div>
            )}

            {/* Node 4: Review area (初稿审核) */}
            {order.current_node === 4 && (
              <div className="space-y-6">
                {/* Seller's submission */}
                <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye size={20} className="text-orange-400" />
                      <h2 className="text-lg font-bold text-white">
                        初稿已提交，请审核
                      </h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      卖家已完成初稿，请查看以下内容并进行审核
                    </p>

                    {/* Show progress entries with attachments */}
                    <ServiceProgressHistory
                      orderId={order.id}
                      refreshKey={progressRefreshKey}
                    />
                  </div>
                </div>

                {/* Review actions */}
                <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">审核操作</h2>
                  </div>

                  {!reviewAction && !showRejectInput && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setReviewAction('approve');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                      >
                        <CheckCircle size={18} />
                        审核通过
                      </button>
                      <button
                        onClick={() => {
                          setReviewAction('reject');
                          setShowRejectInput(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all"
                      >
                        <XCircle size={18} />
                        驳回修改
                      </button>
                    </div>
                  )}

                  {/* Approve confirmation */}
                  {reviewAction === 'approve' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-sm text-emerald-400">
                          确认审核通过后，卖家将继续推进终稿输出。请确认您已查看初稿内容。
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setReviewAction(null)}
                          className="flex-1 px-4 py-2.5 bg-[#1a2540] border border-[#2a3a5f] rounded-xl text-slate-300 text-sm hover:bg-[#2a3a5f] transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleReview}
                          disabled={reviewLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-all"
                        >
                          {reviewLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          确认通过
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reject with reason */}
                  {reviewAction === 'reject' && showRejectInput && (
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-sm text-red-400 mb-3">
                          驳回后进度将回退到「制作中」，请填写修改意见
                        </p>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="请详细说明需要修改的内容..."
                          rows={4}
                          className="w-full bg-[#0a0e1a] border border-[#2a3a5f] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setReviewAction(null);
                            setShowRejectInput(false);
                            setRejectionReason('');
                          }}
                          className="flex-1 px-4 py-2.5 bg-[#1a2540] border border-[#2a3a5f] rounded-xl text-slate-300 text-sm hover:bg-[#2a3a5f] transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleReview}
                          disabled={reviewLoading || !rejectionReason.trim()}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-all"
                        >
                          {reviewLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          确认驳回
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Node 5-7: Delivery/completion */}
            {order.current_node >= 5 && (
              <div className="space-y-6">
                <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <PartyPopper size={20} className="text-emerald-400" />
                      <h2 className="text-lg font-bold text-white">
                        {order.current_node >= 6 ? '交付完成' : '终稿输出'}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      {order.current_node >= 7
                        ? '订单已完成，感谢您的信任'
                        : order.current_node >= 6
                          ? '终稿已交付，请确认收货'
                          : '终稿已输出，请查收'}
                    </p>

                    {/* Delivery files */}
                    <ServiceProgressHistory
                      orderId={order.id}
                      refreshKey={progressRefreshKey}
                    />

                    {/* Delivery report link */}
                    {order.current_node >= 6 && (
                      <div className="mt-4 pt-4 border-t border-[#2a3a5f]/50">
                        <a
                          href={`/verify/${order.id}`}
                          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FileText size={16} />
                          查看交付报告
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Service Content */}
            <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-slate-400" />
                <h2 className="text-lg font-bold text-white">服务内容</h2>
              </div>
              <div className="bg-[#0a0e1a] rounded-xl p-4 border border-[#2a3a5f]/50">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {order.service_content}
                </p>
              </div>
            </div>

            {/* Operation Logs */}
            {logs.length > 0 && (
              <div className="bg-[#0f1629]/90 backdrop-blur-xl rounded-2xl border border-[#2a3a5f] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-slate-400" />
                  <h2 className="text-lg font-bold text-white">操作记录</h2>
                </div>
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm py-2 border-b border-[#2a3a5f]/30 last:border-0"
                    >
                      <span className="text-slate-500 shrink-0 font-mono text-xs mt-0.5">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </span>
                      <span
                        className={
                          log.action === 'reject'
                            ? 'text-red-400'
                            : log.action === 'approve'
                              ? 'text-emerald-400'
                              : 'text-slate-300'
                        }
                      >
                        {log.action === 'advance' &&
                          `推进到${NODE_LABELS[log.node] || `节点${log.node}`}`}
                        {log.action === 'approve' && '买家审核通过'}
                        {log.action === 'reject' &&
                          `买家驳回（退回${NODE_LABELS[log.node] || `节点${log.node}`}）`}
                        {log.action === 'create' && '订单创建'}
                      </span>
                      {log.rejection_reason && (
                        <span className="text-red-400/70 text-xs">
                          原因：{log.rejection_reason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
