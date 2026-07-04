'use client';

import { Clock, Package, CheckCircle2, Circle, Truck, FileCheck, Edit, PartyPopper } from 'lucide-react';

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

interface LogisticsTimelineProps {
  progress: ProgressItem[];
  currentNode: number;
  showAddButton?: boolean;
  onAddProgress?: (nodeIndex: number) => void;
}

const NODE_ICONS = [
  null,
  Package,      // 1: 下单支付
  FileCheck,    // 2: 需求确认
  Edit,         // 3: 制作中
  Truck,        // 4: 初稿交付
  Edit,         // 5: 修改调整
  FileCheck,    // 6: 终稿交付
  PartyPopper,  // 7: 确认收货
];

const NODE_NAMES = [
  '',
  '下单支付',
  '需求确认',
  '制作中',
  '初稿交付',
  '修改调整',
  '终稿交付',
  '确认收货',
];

export function LogisticsTimeline({ progress, currentNode, showAddButton, onAddProgress }: LogisticsTimelineProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatFullTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (progress.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暂无进展记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {progress.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === progress.length - 1;
        const Icon = NODE_ICONS[item.node_index] || Circle;
        const nodeName = NODE_NAMES[item.node_index];

        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* 连接线 */}
            {!isLast && (
              <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-stone-200" />
            )}

            {/* 图标 */}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isFirst
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                : item.is_virtual
                ? 'bg-stone-100 text-stone-400'
                : 'bg-white border-2 border-indigo-200 text-indigo-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* 内容 */}
            <div className={`flex-1 min-w-0 ${isFirst ? '' : 'opacity-80'}`}>
              {/* 时间 */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs ${isFirst ? 'text-indigo-600 font-medium' : 'text-stone-400'}`}>
                  {formatTime(item.created_at)}
                </span>
                <span className="text-xs text-stone-300">|</span>
                <span className="text-xs text-stone-400">
                  {formatFullTime(item.created_at)}
                </span>
              </div>

              {/* 标题 */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${isFirst ? 'text-stone-900' : 'text-stone-700'}`}>
                  {item.title}
                </h4>
                {item.is_virtual && (
                  <span className="text-xs px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded">
                    系统
                  </span>
                )}
                {!item.is_virtual && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.operator_type === 'seller'
                      ? 'bg-blue-100 text-blue-700'
                      : item.operator_type === 'buyer'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {item.operator_type === 'seller' ? '卖家' : item.operator_type === 'buyer' ? '买家' : '系统'}
                  </span>
                )}
              </div>

              {/* 节点标签 */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full mb-2">
                <span>节点{item.node_index}</span>
                <span className="text-indigo-400">·</span>
                <span>{nodeName}</span>
              </div>

              {/* 描述 */}
              {item.description && (
                <p className="text-sm text-stone-600 mb-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* 图片 */}
              {item.image_urls && item.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.image_urls.map((url, imgIndex) => (
                    <div key={imgIndex} className="w-20 h-20 rounded-lg overflow-hidden border border-stone-200">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* 添加进展按钮（仅第一条显示） */}
              {isFirst && showAddButton && (
                <button
                  onClick={() => onAddProgress?.(item.node_index)}
                  className="mt-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  + 添加进展
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
