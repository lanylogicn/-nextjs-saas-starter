/**
 * 服务单详情页 - Linear/Vercel 科技风格
 * 物流式时间线 + 卖家/买家操作区
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LogisticsTimeline } from '@/components/service/logistics-timeline';
import { ServiceProgressEntry } from '@/components/ServiceProgressEntry';
import { ServiceProgressHistory } from '@/components/ServiceProgressHistory';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  FileText,
  Send,
  Sparkles,
  Truck,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

// 7个服务节点定义
const SERVICE_NODES = [
  { id: 1, name: '下单支付', icon: Package, gradient: 'from-blue-500 to-cyan-400' },
  { id: 2, name: '需求确认', icon: ClipboardCheck, gradient: 'from-indigo-500 to-blue-400' },
  { id: 3, name: '制作中', icon: Truck, gradient: 'from-violet-500 to-indigo-400' },
  { id: 4, name: '初稿交付', icon: Send, gradient: 'from-orange-500 to-amber-400' },
  { id: 5, name: '修改调整', icon: AlertCircle, gradient: 'from-amber-500 to-yellow-400' },
  { id: 6, name: '终稿交付', icon: FileText, gradient: 'from-emerald-500 to-green-400' },
  { id: 7, name: '确认收货', icon: CheckCircle2, gradient: 'from-green-500 to-emerald-400' },
];

const NODE_LABELS: Record<number, string> = {
  1: '订单接收',
  2: '需求梳理',
  3: '制作中',
  4: '初稿完成，等待客户审核',
  5: '审核通过，终稿输出',
  6: '终稿已交付',
  7: '确认完成',
};

interface LogInfo {
  id: string;
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

interface Order {
  id: string;
  order_no: string;
  seller_id: string;
  buyer_nickname: string;
  service_type: string;
  service_content: string;
  current_node: number;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  amount?: number;
  price?: number;
  category?: string;
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [logs, setLogs] = useState<LogInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.error) {
        setOrder(null);
      } else {
        setOrder(data.order);
        setLogs(data.logs || []);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleAdvance = async () => {
    if (!order) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        await fetchOrder();
        setProgressRefreshKey((k) => k + 1);
      }
    } catch {
      alert('操作失败');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">订单不存在</p>
          <button onClick={() => router.push('/orders')} className="text-blue-400 hover:text-blue-300">
            返回订单列表
          </button>
        </div>
      </div>
    );
  }

  const currentNode = SERVICE_NODES.find(n => n.id === order.current_node);
  const CurrentIcon = currentNode?.icon || Package;
  const progress = transformLogsToProgress(logs, order.current_node);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/orders')}
              className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white">{order.order_no}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  {order.service_type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                当前进度：第{order.current_node}步/共7步
              </p>
            </div>
            <div className="text-right">
              {(order.amount || order.price) && (
                <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-mono">
                  ¥{((order.amount || order.price || 0) / 100).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Current Status Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentNode?.gradient} flex items-center justify-center shadow-lg node-pulse`}>
                <CurrentIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">当前状态</p>
                <p className="text-xl font-bold text-white">{currentNode?.name || '未知'}</p>
                <p className="text-sm text-slate-400">
                  {NODE_LABELS[order.current_node] || ''}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <div>
                <p className="text-xs text-slate-500 mb-1">买家</p>
                <p className="text-sm text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3" /> {order.buyer_nickname}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">预计交付</p>
                <p className="text-sm text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {order.estimated_delivery || '未设置'}
                </p>
              </div>
            </div>

            {/* Advance button */}
            {order.current_node < 7 && order.current_node !== 4 && (
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 transition-all"
                >
                  {advancing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {advancing ? '推进中...' : '推进到下一步'}
                </button>
              </div>
            )}
            {order.current_node === 4 && (
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-sm text-orange-400 text-center">
                  等待买家审核初稿，审核通过后才能继续推进
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">进展时间线</h2>
          </div>
          <LogisticsTimeline progress={progress} currentNode={order.current_node} />
        </div>

        {/* Seller Progress Entry - 填写新进展 */}
        <div className="mb-6">
          <ServiceProgressEntry
            orderId={orderId}
            currentNodeIndex={Math.max(0, order.current_node - 1)}
            onEntryAdded={() => {
              setProgressRefreshKey((k) => k + 1);
              fetchOrder();
            }}
          />
        </div>

        {/* Progress History - 查看历史记录 */}
        <div className="mb-6">
          <ServiceProgressHistory
            orderId={orderId}
            refreshKey={progressRefreshKey}
          />
        </div>

        {/* Service Content */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-white">服务内容</h2>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <p className="text-sm text-slate-300 leading-relaxed">{order.service_content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
