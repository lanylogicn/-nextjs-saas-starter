'use client';

import { Clock, Package, CheckCircle2, Circle, Truck, FileCheck, Edit, PartyPopper, Zap } from 'lucide-react';

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

const NODE_COLORS = [
  '',
  'from-cyan-400 to-blue-500',    // 1: 青色到蓝色
  'from-blue-400 to-indigo-500',  // 2: 蓝色到靛蓝
  'from-indigo-400 to-purple-500',// 3: 靛蓝到紫色
  'from-purple-400 to-pink-500',  // 4: 紫色到粉色
  'from-pink-400 to-rose-500',    // 5: 粉色到玫瑰
  'from-rose-400 to-orange-500',  // 6: 玫瑰到橙色
  'from-emerald-400 to-teal-500', // 7: 翡翠到青色
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
      <div className="text-center py-12">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-slate-800 flex items-center justify-center">
            <Clock className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <p className="text-slate-400 text-sm">暂无进展记录</p>
        <p className="text-slate-500 text-xs mt-1">等待卖家更新进展</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/30 to-transparent" />
      
      {progress.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === progress.length - 1;
        const Icon = NODE_ICONS[item.node_index] || Circle;
        const nodeName = NODE_NAMES[item.node_index];
        const colorClass = NODE_COLORS[item.node_index] || 'from-slate-400 to-slate-500';

        return (
          <div key={item.id} className="relative flex gap-5 pb-8 last:pb-0 group">
            {/* 发光连接线 */}
            {!isLast && (
              <>
                <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-slate-600/50 to-slate-700/20" />
                {isFirst && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-cyan-400/50 to-transparent animate-flow-down" />
                )}
              </>
            )}

            {/* 节点图标 - 科技感设计 */}
            <div className="relative z-10 flex-shrink-0">
              {/* 外圈光晕 */}
              {isFirst && (
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${colorClass} opacity-30 blur-md animate-pulse-glow`} />
              )}
              
              {/* 主图标容器 */}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isFirst
                  ? `bg-gradient-to-br ${colorClass} shadow-lg shadow-cyan-500/20`
                  : item.is_virtual
                  ? 'bg-slate-800/50 border border-slate-700/50'
                  : 'bg-slate-800 border border-slate-600/50'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isFirst
                    ? 'text-white'
                    : item.is_virtual
                    ? 'text-slate-500'
                    : 'text-slate-300'
                }`} />
                
                {/* 活跃节点脉冲效果 */}
                {isFirst && (
                  <div className="absolute inset-0 rounded-full animate-ping-slow">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorClass} opacity-20`} />
                  </div>
                )}
              </div>

              {/* 虚拟节点标记 */}
              {item.is_virtual && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <Zap className="w-2 h-2 text-cyan-400" />
                </div>
              )}
            </div>

            {/* 内容卡片 */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isFirst ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}>
              {/* 时间戳 */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-mono ${isFirst ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {formatTime(item.created_at)}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono text-slate-500">
                  {formatFullTime(item.created_at)}
                </span>
              </div>

              {/* 主内容卡片 - 毛玻璃效果 */}
              <div className={`relative rounded-xl p-4 transition-all duration-300 ${
                isFirst
                  ? 'bg-slate-800/80 backdrop-blur-sm border border-cyan-500/20 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/40 hover:shadow-cyan-500/10'
                  : item.is_virtual
                  ? 'bg-slate-800/40 backdrop-blur-sm border border-slate-700/30'
                  : 'bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50'
              }`}>
                {/* 卡片顶部渐变线 */}
                {isFirst && (
                  <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent ${colorClass} to-transparent opacity-50`} />
                )}

                {/* 标题行 */}
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-medium ${isFirst ? 'text-white' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  
                  {/* 操作人标签 */}
                  {!item.is_virtual && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.operator_type === 'seller'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : item.operator_type === 'buyer'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {item.operator_type === 'seller' ? '卖家' : item.operator_type === 'buyer' ? '买家' : '系统'}
                    </span>
                  )}
                  
                  {item.is_virtual && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30">
                      系统自动
                    </span>
                  )}
                </div>

                {/* 节点标签 */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs mb-3 ${
                  isFirst
                    ? `bg-gradient-to-r ${colorClass} bg-opacity-10 text-white border border-white/10`
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                }`}>
                  <span className="font-mono">N{item.node_index}</span>
                  <span className="opacity-50">|</span>
                  <span>{nodeName}</span>
                </div>

                {/* 描述 */}
                {item.description && (
                  <p className={`text-sm leading-relaxed mb-3 ${isFirst ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                )}

                {/* 图片展示 */}
                {item.image_urls && item.image_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.image_urls.map((url, imgIndex) => (
                      <div key={imgIndex} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-600/50 group/img hover:border-cyan-500/50 transition-colors">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加进展按钮 */}
                {isFirst && showAddButton && (
                  <button
                    onClick={() => onAddProgress?.(item.node_index)}
                    className="mt-2 px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    + 添加进展
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
