/**
 * 服务单管理页面 - Linear/Vercel 科技风格
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
  Sparkles,
  Zap,
} from 'lucide-react';

// 7个服务节点定义
const SERVICE_NODES = [
  { id: 1, name: '下单支付', icon: Package, gradient: 'from-blue-500 to-cyan-400', description: '订单已创建，等待卖家确认' },
  { id: 2, name: '需求确认', icon: ClipboardCheck, gradient: 'from-indigo-500 to-blue-400', description: '卖家已确认，正在梳理需求' },
  { id: 3, name: '制作中', icon: Truck, gradient: 'from-violet-500 to-indigo-400', description: '卖家正在制作中' },
  { id: 4, name: '初稿交付', icon: Send, gradient: 'from-orange-500 to-amber-400', description: '初稿已完成，等待买家审核' },
  { id: 5, name: '修改调整', icon: AlertCircle, gradient: 'from-amber-500 to-yellow-400', description: '根据买家反馈进行修改' },
  { id: 6, name: '终稿交付', icon: FileText, gradient: 'from-emerald-500 to-green-400', description: '终稿已交付，等待确认' },
  { id: 7, name: '确认收货', icon: CheckCircle2, gradient: 'from-green-500 to-emerald-400', description: '订单已完成' },
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
  estimated_delivery?: string;
  created_at: string;
  completed_at?: string;
  amount?: number;
  price?: number;
}

type ViewMode = 'seller' | 'buyer';

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function getNodeStatus(nodeId: number, currentNode: number): 'completed' | 'current' | 'pending' {
  if (nodeId < currentNode) return 'completed';
  if (nodeId === currentNode) return 'current';
  return 'pending';
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('seller');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, viewMode]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    const status = order.current_node === 7 ? 'completed' : order.current_node >= 4 ? 'reviewing' : 'active';
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      reviewing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    const labels = { completed: '已完成', reviewing: '审核中', active: '进行中' };
    return <Badge className={`${styles[status]} border text-xs`}>{labels[status]}</Badge>;
  };

  const getNodeIcon = (nodeId: number, currentNode: number) => {
    const node = SERVICE_NODES.find(n => n.id === nodeId);
    if (!node) return null;
    const Icon = node.icon;
    const status = getNodeStatus(nodeId, currentNode);

    if (status === 'completed') {
      return (
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (status === 'current') {
      return (
        <div className="relative">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.gradient} flex items-center justify-center shadow-lg shadow-blue-500/30 node-pulse`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-4">
            请先登录
          </h2>
          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">我的服务单</h1>
                <p className="text-xs text-slate-400">实时跟踪服务进度</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <button
                onClick={() => setViewMode('seller')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'seller'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                卖家视角
              </button>
              <button
                onClick={() => setViewMode('buyer')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'buyer'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                买家视角
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-4 border border-slate-800/50 hover:border-blue-500/30 transition-all">
            <p className="text-xs text-slate-400 mb-1">进行中</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-mono">
              {orders.filter(o => o.current_node < 7).length}
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-4 border border-slate-800/50 hover:border-amber-500/30 transition-all">
            <p className="text-xs text-slate-400 mb-1">待审核</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-mono">
              {orders.filter(o => o.current_node === 4 || o.current_node === 5).length}
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-4 border border-slate-800/50 hover:border-emerald-500/30 transition-all">
            <p className="text-xs text-slate-400 mb-1">已完成</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-mono">
              {orders.filter(o => o.current_node === 7).length}
            </p>
          </div>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-400 mb-4">暂无服务单</p>
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20">
                创建第一个服务单
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card
                key={order.id}
                className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <CardContent className="p-5">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/20">
                        <Package className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{order.order_no}</span>
                          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">{order.service_type}</Badge>
                          {getStatusBadge(order)}
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {viewMode === 'seller' ? (
                            <><User className="w-3 h-3 inline mr-1" />买家：{order.buyer_nickname}</>
                          ) : (
                            <><User className="w-3 h-3 inline mr-1" />卖家：{order.seller_nickname || '专业卖家'}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {(order.amount || order.price) && (
                        <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-mono">
                          ¥{((order.amount || order.price || 0) / 100).toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="bg-slate-800/30 rounded-lg p-3 mb-4 border border-slate-700/30">
                    <p className="text-sm text-slate-300 line-clamp-2">{order.service_content}</p>
                  </div>

                  {/* Progress Timeline */}
                  <div className="relative mb-4">
                    <div className="flex items-center justify-between">
                      {SERVICE_NODES.map((node, index) => (
                        <React.Fragment key={node.id}>
                          <div className="flex flex-col items-center relative z-10">
                            {getNodeIcon(node.id, order.current_node)}
                            <span className={`text-xs mt-1.5 text-center max-w-[60px] ${
                              getNodeStatus(node.id, order.current_node) === 'current'
                                ? 'text-blue-400 font-medium'
                                : getNodeStatus(node.id, order.current_node) === 'completed'
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                            }`}>
                              {node.name}
                            </span>
                          </div>
                          {index < SERVICE_NODES.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                              node.id < order.current_node
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : 'bg-slate-800'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        预计：{order.estimated_delivery ? formatDate(order.estimated_delivery) : '未设置'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        第{order.current_node}步/共7步
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${order.id}`);
                      }}
                    >
                      查看详情
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
