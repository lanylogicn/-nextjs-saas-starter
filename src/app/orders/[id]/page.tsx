'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, Calendar, Clock, FileText, Image, Send, MessageCircle, CheckCircle, XCircle, Edit } from 'lucide-react';
import { LogisticsTimeline } from '@/components/service/logistics-timeline';

const NODE_NAMES = ['', '下单支付', '需求确认', '制作中', '初稿交付', '修改调整', '终稿交付', '确认收货'];

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
};

const MOCK_PROGRESS: ProgressItem[] = [
  {
    id: '1',
    node_index: 3,
    title: '正在填充内容',
    description: '已完成框架搭建，正在填充各章节内容。目前已完成：1. 行业概述 2. 技术发展 3. 应用场景。预计明天完成剩余部分。',
    image_urls: ['/placeholder1.jpg', '/placeholder2.jpg'],
    operator_type: 'seller',
    is_virtual: false,
    created_at: '2024-01-05T14:30:00Z',
  },
  {
    id: '2',
    node_index: 3,
    sub_node_index: 2,
    title: '完成框架搭建',
    description: 'PPT框架已搭建完成，共6个章节，20页内容。',
    operator_type: 'system',
    is_virtual: true,
    created_at: '2024-01-04T16:00:00Z',
  },
  {
    id: '3',
    node_index: 3,
    sub_node_index: 1,
    title: '开始制作',
    description: '卖家已确认需求，开始制作PPT。',
    operator_type: 'system',
    is_virtual: true,
    created_at: '2024-01-03T10:00:00Z',
  },
  {
    id: '4',
    node_index: 2,
    title: '需求已确认',
    description: '卖家已与买家确认需求细节，包括：主题风格、配色方案、内容结构等。',
    operator_type: 'seller',
    is_virtual: false,
    created_at: '2024-01-02T15:00:00Z',
  },
  {
    id: '5',
    node_index: 1,
    title: '订单已创建',
    description: '买家已下单并支付，订单进入处理流程。',
    operator_type: 'system',
    is_virtual: true,
    created_at: '2024-01-01T10:00:00Z',
  },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setOrder(MOCK_ORDER);
      setProgress(MOCK_PROGRESS);
      setLoading(false);
    }, 500);
  }, [orderId]);

  const handleAddProgress = async () => {
    if (!newTitle.trim()) return;
    
    const newProgress: ProgressItem = {
      id: Date.now().toString(),
      node_index: order?.current_node || 1,
      title: newTitle,
      description: newDescription,
      operator_type: 'seller',
      is_virtual: false,
      created_at: new Date().toISOString(),
    };
    
    setProgress([newProgress, ...progress]);
    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // 模拟发送消息
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400">订单不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-stone-900">订单详情</h1>
            <p className="text-sm text-stone-500">{order.order_no}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：订单信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-5 sticky top-20">
              <h2 className="font-semibold text-stone-900 mb-4">订单信息</h2>
              
              {/* 订单编号 */}
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-600">{order.order_no}</span>
              </div>

              {/* 品类 */}
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-600">
                  {order.service_type === 'ppt' ? 'PPT演示文稿' : 
                   order.service_type === 'essay' ? '学术论文' :
                   order.service_type === 'copywriting' ? '文案内容' :
                   order.service_type === 'design' ? '设计服务' :
                   order.service_type === 'code' ? '代码开发' :
                   order.service_type === 'resume' ? '简历制作' : order.service_type}
                </span>
              </div>

              {/* 买家 */}
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-600">买家：{order.buyer_nickname}</span>
              </div>

              {/* 当前节点 */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-stone-400" />
                <span className="text-sm text-stone-600">
                  当前：节点{order.current_node} - {NODE_NAMES[order.current_node]}
                </span>
              </div>

              {/* 预计交付 */}
              {order.estimated_delivery && (
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-sm text-stone-600">
                    预计交付：{new Date(order.estimated_delivery).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}

              {/* 服务内容 */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-1">服务内容</p>
                <p className="text-sm text-stone-700">{order.service_content}</p>
              </div>

              {/* 进度概览 */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-2">进度概览</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(node => (
                    <div
                      key={node}
                      className={`flex-1 h-2 rounded-full ${
                        node < order.current_node
                          ? 'bg-indigo-500'
                          : node === order.current_node
                          ? 'bg-indigo-400'
                          : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-1">第{order.current_node}步 / 共7步</p>
              </div>
            </div>
          </div>

          {/* 右侧：时间线 */}
          <div className="lg:col-span-2">
            {/* 物流时间线 */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-900">物流跟踪</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  + 添加进展
                </button>
              </div>

              {/* 添加进展表单 */}
              {showAddForm && (
                <div className="mb-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="进展标题（如：完成框架搭建）"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="详细描述..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddProgress}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      提交
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              <LogisticsTimeline progress={progress} currentNode={order.current_node} />
            </div>

            {/* 留言沟通 */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-stone-400" />
                留言沟通
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="输入留言内容..."
                  className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
