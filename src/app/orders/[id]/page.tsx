/**
 * 服务单详情页 - Linear/Vercel 科技风格
 * 物流式时间线 + 卖家/买家操作区
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LogisticsTimeline } from '@/components/service/logistics-timeline';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  Clock,
  FileText,
  Image,
  Send,
  MessageCircle,
  CheckCircle,
  XCircle,
  Edit,
  Upload,
  ChevronRight,
  Sparkles,
  Zap,
  Truck,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
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
}

// 模拟数据
const MOCK_ORDER: Order = {
  id: '1',
  order_no: 'SV20240101001',
  seller_id: 'seller1',
  buyer_nickname: '买家小明',
  service_type: 'ppt',
  service_content: '制作一份关于人工智能发展趋势的PPT，约20页，需要包含数据图表和案例分析。',
  current_node: 3,
  estimated_delivery: '2024-01-15',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-05T14:30:00Z',
  amount: 50000,
};

const MOCK_PROGRESS: ProgressItem[] = [
  {
    id: 'p1',
    node_index: 3,
    sub_node_index: 2,
    title: '完成框架设计',
    description: '已完成PPT整体框架设计，包含封面、目录、5个主要章节、总结页。每个章节都规划了内容要点和视觉风格。',
    image_urls: ['/placeholder-framework.png'],
    operator_type: 'seller',
    is_virtual: false,
    created_at: '2024-01-05T14:30:00Z',
  },
  {
    id: 'p2',
    node_index: 3,
    sub_node_index: 1,
    title: '开始内容制作',
    description: '根据确认的需求文档，开始进行PPT内容制作。',
    operator_type: 'seller',
    is_virtual: true,
    created_at: '2024-01-04T10:00:00Z',
  },
  {
    id: 'p3',
    node_index: 2,
    title: '需求已确认',
    description: '已详细阅读并确认所有需求，将按以下要点制作：1. 专业商务风格 2. 包含数据图表 3. 20页左右',
    operator_type: 'seller',
    is_virtual: false,
    created_at: '2024-01-03T09:00:00Z',
  },
  {
    id: 'p4',
    node_index: 1,
    title: '订单已创建',
    description: '买家已下单并完成支付，订单正式生效。',
    operator_type: 'system',
    is_virtual: false,
    created_at: '2024-01-01T10:00:00Z',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProgress, setNewProgress] = useState({ title: '', description: '' });
  const [selectedNode, setSelectedNode] = useState(3);

  useEffect(() => {
    // 使用模拟数据
    setOrder(MOCK_ORDER);
    setProgress(MOCK_PROGRESS);
    setLoading(false);
  }, [orderId]);

  const handleAddProgress = async () => {
    if (!newProgress.title.trim()) return;
    // TODO: 调用API添加进展
    const newItem: ProgressItem = {
      id: `new-${Date.now()}`,
      node_index: selectedNode,
      title: newProgress.title,
      description: newProgress.description,
      operator_type: 'seller',
      is_virtual: false,
      created_at: new Date().toISOString(),
    };
    setProgress([newItem, ...progress]);
    setNewProgress({ title: '', description: '' });
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
              {order.amount && (
                <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-mono">
                  ¥{(order.amount / 100).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Current Status Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6 relative overflow-hidden">
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentNode?.gradient} flex items-center justify-center shadow-lg node-pulse`}>
                <CurrentIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">当前状态</p>
                <p className="text-xl font-bold text-white">{currentNode?.name}</p>
                <p className="text-sm text-slate-400">{currentNode?.name === '制作中' ? '卖家正在制作中' : ''}</p>
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

        {/* Seller Action Panel */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">添加进展</h2>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-400">当前节点：</span>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {SERVICE_NODES.map(node => (
                <option key={node.id} value={node.id}>{node.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="进展标题（如：完成框架设计）"
            value={newProgress.title}
            onChange={(e) => setNewProgress({ ...newProgress, title: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 mb-3"
          />
          <textarea
            placeholder="详细描述进展情况..."
            value={newProgress.description}
            onChange={(e) => setNewProgress({ ...newProgress, description: e.target.value })}
            rows={3}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 mb-3 resize-none"
          />
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-blue-500/30 transition-all">
              <Upload className="w-4 h-4" />
              上传图片
            </button>
            <button
              onClick={handleAddProgress}
              disabled={!newProgress.title.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
              发布进展
            </button>
          </div>
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
