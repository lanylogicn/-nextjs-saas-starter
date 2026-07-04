/**
 * @file 买家查询页
 * @description
 * 买家通过SV编号查询服务单进度，无需登录。
 * 已登录买家可使用高级功能：优先审核、专业交付报告、进度卡片。
 * 节点4（初稿完成）时买家可审核：通过→推进到节点5，驳回→回退到节点3。
 *
 * 路由：/buyer
 * API：GET /api/buyer/[orderNo]，POST /api/orders/[id]/review
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

const NODE_LABELS: Record<number, string> = {
  1: '订单接收',
  2: '需求梳理',
  3: '制作中',
  4: '初稿完成，等待客户审核',
  5: '审核通过，终稿输出',
  6: '终稿已交付',
  7: '确认完成',
};

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

export default function BuyerPage() {
  const [orderNo, setOrderNo] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [logs, setLogs] = useState<LogInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [addonError, setAddonError] = useState('');
  const [addonContactModal, setAddonContactModal] = useState(false);
  const [user, setUser] = useState<{ userId: string; role: string } | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleReview = async () => {
    if (!order || !reviewAction) return;
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      alert('请填写修改意见');
      return;
    }
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
        setShowReview(false);
        setReviewAction(null);
        setRejectionReason('');
        // Re-query
        handleQuery({ preventDefault: () => {} } as React.FormEvent);
      }
    } catch {
      alert('操作失败');
    }
  };

  const handleAddon = async (addonType: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!order) return;
    try {
      const res = await fetch('/api/buyer-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id, addon_type: addonType }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.needPermission) {
          setAddonContactModal(true);
        } else {
          setAddonError(data.error);
        }
      } else {
        alert(data.message);
      }
    } catch {
      setAddonError('操作失败');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Card className="border-0 shadow-lg card-gradient-subtle">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-indigo-800">查询服务进度</CardTitle>
            <p className="text-stone-500 text-sm">输入卖家提供的SV编号，查看交付进度</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuery} className="flex gap-3">
              <Input
                placeholder="请输入SV编号，如 SV240101ABC123"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="font-mono tabular-nums"
              />
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                {loading ? '查询中...' : '查询'}
              </Button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mt-4">
                {error}
              </div>
            )}

            {order && (
              <div className="mt-6 space-y-4">
                <div className="bg-white rounded-xl border border-stone-200 p-5 card-gradient-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-indigo-700 font-bold tabular-nums">{order.order_no}</span>
                    <Badge className={
                      order.current_node === 7 ? 'bg-emerald-100 text-emerald-700 border-0' :
                      order.current_node === 4 ? 'bg-orange-100 text-orange-700 border-0' :
                      'bg-indigo-100 text-indigo-700 border-0'
                    }>
                      {NODE_LABELS[order.current_node]}
                    </Badge>
                  </div>
                  <div className="text-sm text-stone-500 space-y-1">
                    <p>买家：{order.buyer_nickname}</p>
                    <p>服务类型：{order.service_type}</p>
                    <p>服务内容：{order.service_content}</p>
                    <p>创建时间：{new Date(order.created_at).toLocaleString('zh-CN')}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 7 }, (_, i) => {
                        const node = i + 1;
                        const filled = node <= order.current_node;
                        return (
                          <div key={node} className="flex items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                filled
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-stone-200 text-stone-400'
                              } ${filled && node === order.current_node ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
                            >
                              {filled ? '■' : '□'}
                            </div>
                            {node < 7 && (
                              <div className={`w-4 h-0.5 ${filled && node < order.current_node ? 'bg-indigo-600' : 'bg-stone-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      {Array.from({ length: 7 }, (_, i) => (
                        <span key={i} className="text-[10px] text-stone-400 w-8 text-center">
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Node labels */}
                  <div className="mt-3 space-y-1">
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((node) => (
                      <div key={node} className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded text-xs flex items-center justify-center ${node <= order.current_node ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-400'}`}>
                          {node}
                        </span>
                        <span className={`text-xs ${node <= order.current_node ? 'text-stone-800 font-medium' : 'text-stone-400'}`}>
                          {NODE_LABELS[node]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review section - only when at node 4 */}
                {order.current_node === 4 && (
                  <Card className="border-orange-200 bg-orange-50 shadow-sm">
                    <CardContent className="p-4">
                      <p className="font-semibold text-orange-800 mb-3">初稿已完成，请审核</p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => { setReviewAction('approve'); setShowReview(true); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          审核通过
                        </Button>
                        <Button
                          onClick={() => { setReviewAction('reject'); setShowReview(true); }}
                          variant="destructive"
                        >
                          驳回修改
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress logs */}
                {logs.length > 0 && (
                  <div className="bg-white rounded-xl border border-stone-200 p-5">
                    <h3 className="font-semibold text-stone-800 mb-3">操作记录</h3>
                    <div className="space-y-2">
                      {logs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-stone-400 shrink-0 tabular-nums">
                            {new Date(log.created_at).toLocaleString('zh-CN')}
                          </span>
                          <span className={
                            log.action === 'reject' ? 'text-red-600' :
                            log.action === 'approve' ? 'text-emerald-600' :
                            'text-stone-600'
                          }>
                            {log.action === 'advance' && `推进到节点${log.node}`}
                            {log.action === 'approve' && '买家审核通过'}
                            {log.action === 'reject' && `买家驳回（退回节点${log.node}）`}
                          </span>
                          {log.rejection_reason && (
                            <span className="text-red-500 text-xs">原因：{log.rejection_reason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buyer add-ons */}
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <h3 className="font-semibold text-stone-800 mb-3">高级功能</h3>
                  {addonError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-2 rounded-lg mb-3">
                      {addonError}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => handleAddon('urgent_review')}
                    >
                      <span className="font-semibold text-indigo-800">优先审核</span>
                      <span className="text-indigo-600 text-xs">9.9元</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => handleAddon('delivery_cert')}
                    >
                      <span className="font-semibold text-indigo-800">专业交付报告</span>
                      <span className="text-indigo-600 text-xs">19.9元</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => handleAddon('share_card')}
                    >
                      <span className="font-semibold text-indigo-800">进度卡片生成</span>
                      <span className="text-indigo-600 text-xs">3.9元</span>
                    </Button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">* 测试模式下支付将模拟成功</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">
              {reviewAction === 'approve' ? '确认审核通过' : '驳回修改'}
            </DialogTitle>
          </DialogHeader>
          {reviewAction === 'reject' && (
            <div>
              <Label>修改意见</Label>
              <Textarea
                placeholder="请详细说明需要修改的内容"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-stone-400 mt-1">驳回后进度将回退到&ldquo;制作中&rdquo;</p>
            </div>
          )}
          {reviewAction === 'approve' && (
            <p className="text-sm text-stone-600">确认审核通过后，卖家将继续推进终稿输出</p>
          )}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowReview(false)} className="flex-1">取消</Button>
            <Button
              onClick={handleReview}
              className={`flex-1 ${
                reviewAction === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              确认{reviewAction === 'approve' ? '通过' : '驳回'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">请先登录</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-600">使用高级功能需要登录账号</p>
          <div className="flex gap-3 mt-4">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">去登录/注册</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Addon Contact Dialog */}
      <Dialog open={addonContactModal} onOpenChange={setAddonContactModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">功能未开通</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-600">此功能需联系客服开通，请联系获取使用权限。</p>
          <div className="bg-indigo-50 rounded-lg p-3 mt-2 text-sm text-indigo-800">
            <p>客服电话：400-888-9999</p>
            <p>客服邮箱：support@yinuo.com</p>
            <p>工作时间：周一至周五 9:00-18:00</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setAddonContactModal(false)} className="flex-1">关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
