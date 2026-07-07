'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Image,
  FileText,
  Film,
  Music,
  Download,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const NODE_LABELS = [
  '订单接收',
  '需求梳理',
  '制作中',
  '初稿完成等待审核',
  '审核通过终稿输出',
  '终稿已交付',
  '确认完成',
];

interface ProgressEntry {
  id: string;
  node_index: number;
  content: string;
  attachments: string[] | null;
  created_at: string;
}

interface ServiceProgressHistoryProps {
  orderId: string;
  refreshKey?: number;
}

export function ServiceProgressHistory({
  orderId,
  refreshKey = 0,
}: ServiceProgressHistoryProps) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/service-progress/history?orderId=${orderId}`
      );
      const result = await response.json();
      if (result.success) {
        setEntries(result.entries || []);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [orderId, refreshKey]);

  const displayedEntries = showAll ? entries : entries.slice(0, 5);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
      return <Image size={14} />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <Film size={14} />;
    if (['mp3', 'wav'].includes(ext)) return <Music size={14} />;
    return <FileText size={14} />;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#141c2e]/80 backdrop-blur-xl border border-[#2a3a5f] rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          加载进展记录...
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-[#141c2e]/80 backdrop-blur-xl border border-[#2a3a5f] rounded-xl p-6 text-center">
        <MessageSquare size={32} className="mx-auto text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">暂无进展记录</p>
        <p className="text-xs text-slate-500 mt-1">
          卖家可以在每个节点记录详细进展和上传附件
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#141c2e]/80 backdrop-blur-xl border border-[#2a3a5f] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a3a5f]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-white">进展记录</span>
          <span className="text-xs text-slate-500 bg-[#1a2540] px-2 py-0.5 rounded-full">
            {entries.length}条
          </span>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-[#2a3a5f]/30">
        {displayedEntries.map((entry) => (
          <div key={entry.id} className="px-4 py-3 hover:bg-[#1a2540]/30 transition-colors">
            {/* Node badge + time */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {NODE_LABELS[entry.node_index] || `节点${entry.node_index + 1}`}
              </span>
              <span className="text-xs text-slate-500">
                {formatTime(entry.created_at)}
              </span>
            </div>

            {/* Content */}
            {entry.content && (
              <p className="text-sm text-slate-300 mb-2 whitespace-pre-wrap">
                {entry.content}
              </p>
            )}

            {/* Attachments */}
            {entry.attachments && entry.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.attachments.map((url, idx) => {
                  const filename = url.split('/').pop() || `file-${idx}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

                  if (isImage) {
                    return (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={filename}
                          className="w-20 h-20 object-cover rounded-lg border border-[#2a3a5f] cursor-pointer hover:border-blue-500/50 transition-colors"
                          onClick={() => window.open(url, '_blank')}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(url, filename);
                          }}
                          className="absolute bottom-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={12} className="text-white" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDownload(url, filename)}
                      className="flex items-center gap-1.5 bg-[#0d1322] border border-[#2a3a5f] rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors"
                    >
                      {getFileIcon(url)}
                      <span className="truncate max-w-[120px]">{filename}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More */}
      {entries.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full px-4 py-2.5 border-t border-[#2a3a5f]/50 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-blue-400 hover:bg-[#1a2540]/30 transition-colors"
        >
          {showAll ? '收起' : `查看全部 ${entries.length} 条记录`}
          <ChevronDown
            size={14}
            className={`transition-transform ${showAll ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
