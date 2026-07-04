/**
 * 服务单管理页面 - 类似淘宝物流跟踪体验
 * 支持卖家和买家两种视角
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  MessageSquare,
  FileText,
  ChevronRight,
  Calendar,
  User,
  DollarSign,
  Eye,
  Truck,
  ClipboardCheck,
  Send,
  Star,
} from 'lucide-react';

// 7个服务节点定义
const SERVICE_NODES = [
  { id: 1, name: '下单支付', icon: Package, color: 'bg-blue-500', description: '订单已创建，等待卖家确认' },
  { id: 2, name: '需求确认', icon: ClipboardCheck, color: 'bg-indigo-500', description: '卖家已确认，正在梳理需求' },
  { id: 3, name: '制作中', icon: Truck, color: 'bg-violet-500', description: '卖家正在制作中' },
  { id: 4, name: '初稿交付', icon: Send, color: 'bg-orange-500', description: '初稿已完成，等待买家审核' },
  { id: 5, name: '修改调整', icon: AlertCircle, color: 'bg-amber-500', description: '根据买家反馈进行修改' },
  { id: 6, name: '终稿交付', icon: FileText, color: 'bg-emerald-500', description: '终稿已交付，等待确认' },
  { id: 7, name: '确认收货', icon: CheckCircle2, color: 'bg-green-500', description: '订单已完成' },
];

interface Order {
  id: string;
  order_no: string;
  buyer_nickname: string;
  seller_id: string;
  seller_nickname?: string;
  service_type: string;
  service_content: string;
  current_node: number;
  estimated_delivery: string | null;
  amount?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ProgressLog {
  id: string;
  node: number;
  action: string;
  operator_type: string;
  rejection_reason?: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [progressLogs, setProgressLogs] = useState<Record<string, ProgressLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'seller' | 'buyer'>('seller');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'same-origin' });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        // 获取每个订单的进度日志
        data.orders.forEach((order: Order) => {
          fetchProgressLogs(order.id);
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressLogs = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: 'same-origin' });
      const data = await res.json();
      if (data.progressLogs) {
        setProgressLogs(prev => ({ ...prev, [orderId]: data.progressLogs }));
      }
    } catch (error) {
      console.error('Failed to fetch progress logs:', error);
    }
  };

  const getNodeStatus = (nodeId: number, currentNode: number): 'completed' | 'current' | 'pending' => {
    if (nodeId < currentNode) return 'completed';
    if (nodeId === currentNode) return 'current';
    return 'pending';
  };

  const getNodeIcon = (nodeId: number, currentNode: number) => {
    const status = getNodeStatus(nodeId, currentNode);
    const node = SERVICE_NODES[nodeId - 1];
    const Icon = node.icon;

    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    if (status === 'current') {
      return <div className={`w-8 h-8 rounded-full ${node.color} flex items-center justify-center text-white animate-pulse`}><Icon className="w-4 h-4" /></div>;
    }
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  const getStatusBadge = (order: Order) => {
    if (order.current_node === 7) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">已完成</Badge>;
    }
    if (order.current_node === 4) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">待审核</Badge>;
    }
    if (order.current_node === 5) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">修改中</Badge>;
    }
    return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">进行中</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">我的服务单</h1>
            <p className="text-sm text-slate-500 mt-1">实时跟踪订单进度，每一步都清晰可见</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'seller' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('seller')}
              className={viewMode === 'seller' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              卖家视角
            </Button>
            <Button
              variant={viewMode === 'buyer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('buyer')}
              className={viewMode === 'buyer' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              买家视角
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">暂无服务单</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">创建第一个服务单</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card
                key={order.id}
                className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <CardContent className="p-5">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700">{order.order_no}</span>
                          {getStatusBadge(order)}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {viewMode === 'seller' ? (
                            <><User className="w-3 h-3 inline mr-1" />买家：{order.buyer_nickname}</>
                          ) : (
                            <><User className="w-3 h-3 inline mr-1" />卖家：{order.seller_nickname || '专业卖家'}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{order.service_type}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{order.service_content}</p>
                  </div>

                  {/* Progress Timeline */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {SERVICE_NODES.map((node, index) => (
                        <React.Fragment key={node.id}>
                          <div className="flex flex-col items-center relative z-10">
                            {getNodeIcon(node.id, order.current_node)}
                            <span className={`text-xs mt-1 text-center max-w-[60px] ${
                              getNodeStatus(node.id, order.current_node) === 'current'
                                ? 'text-indigo-700 font-medium'
                                : getNodeStatus(node.id, order.current_node) === 'completed'
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}>
                              {node.name}
                            </span>
                          </div>
                          {index < SERVICE_NODES.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${
                              node.id < order.current_node ? 'bg-emerald-400' : 'bg-slate-200'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        <Clock className="w-3 h-3 inline mr-1" />
                        预计交付：{order.estimated_delivery ? formatDate(order.estimated_delivery) : '未设置'}
                      </span>
                      <span className="flex items-center gap-1">
                        进度：{order.current_node}/7
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(selectedOrder?.id === order.id ? null : order);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">订单详情</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>关闭</Button>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">订单编号</p>
                    <p className="font-mono font-bold text-indigo-700">{selectedOrder.order_no}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">当前状态</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">创建时间</p>
                    <p className="text-sm text-slate-700">{new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">预计交付</p>
                    <p className="text-sm text-slate-700">
                      {selectedOrder.estimated_delivery
                        ? new Date(selectedOrder.estimated_delivery).toLocaleString('zh-CN')
                        : '未设置'}
                    </p>
                  </div>
                </div>

                {/* Service Content */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">服务内容</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">{selectedOrder.service_content}</p>
                  </div>
                </div>

                {/* Progress Timeline Detail */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">进度跟踪</h3>
                  <div className="space-y-3">
                    {SERVICE_NODES.map(node => {
                      const status = getNodeStatus(node.id, selectedOrder.current_node);
                      const logs = progressLogs[selectedOrder.id]?.filter(log => log.node === node.id) || [];

                      return (
                        <div key={node.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            {getNodeIcon(node.id, selectedOrder.current_node)}
                            {node.id < 7 && (
                              <div className={`w-0.5 h-8 mt-1 ${
                                node.id < selectedOrder.current_node ? 'bg-emerald-400' : 'bg-slate-200'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                status === 'current' ? 'text-indigo-700' :
                                status === 'completed' ? 'text-emerald-600' : 'text-slate-400'
                              }`}>
                                {node.name}
                              </span>
                              {status === 'current' && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs">当前</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{node.description}</p>
                            {logs.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {logs.map(log => (
                                  <div key={log.id} className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(log.created_at)}
                                    {log.rejection_reason && (
                                      <span className="text-red-500">（驳回：{log.rejection_reason}）</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  {viewMode === 'seller' && selectedOrder.current_node < 7 && selectedOrder.current_node !== 4 && (
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <ChevronRight className="w-4 h-4 mr-1" />
                      推进到下一节点
                    </Button>
                  )}
                  {viewMode === 'seller' && selectedOrder.current_node === 7 && (
                    <>
                      <Button variant="outline" className="flex-1 text-indigo-700 border-indigo-200">
                        <FileText className="w-4 h-4 mr-1" />
                        生成交付报告
                      </Button>
                      <Button variant="outline" className="flex-1 text-indigo-700 border-indigo-200">
                        <Star className="w-4 h-4 mr-1" />
                        生成交付喜报
                      </Button>
                    </>
                  )}
                  {viewMode === 'buyer' && selectedOrder.current_node === 4 && (
                    <>
                      <Button variant="outline" className="flex-1 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        审核通过
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-700 border-red-200">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        驳回修改
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="text-slate-700 border-slate-200">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    联系对方
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
