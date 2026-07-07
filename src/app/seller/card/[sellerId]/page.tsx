/**
 * 卖家信誉名片页面
 * 路由：/seller/card/[sellerId]
 * 功能：展示卖家信誉主页（头像、ID、入驻天数、订单数、审核通过率、成就徽章）
 *       生成信誉长图、复制卖家宣言、二维码分享
 * API：GET /api/seller/[id]/reputation
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface ReputationData {
  user: {
    id: string;
    nickname: string;
    avatar_url: string | null;
    membership_level: string;
    seller_id?: string;
    days_since_join: number;
  };
  stats: {
    completed_orders: number;
    total_orders: number;
    approval_rate: number;
    avg_revisions: number;
  };
  badges: Array<{
    key: string;
    name: string;
    icon: string;
    description: string;
    granted_at: string;
  }>;
  recent_activity: Array<{
    order_no: string;
    service_type: string;
    status: string;
    updated_at: string;
  }>;
}

const LEVEL_LABELS: Record<string, string> = {
  free: '测试版',
  pro: '普通版',
  flagship: '完整版',
};

export default function SellerCardPage() {
  const params = useParams<{ sellerId: string }>();
  const [data, setData] = useState<ReputationData | null>(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/seller/${params.sellerId}/reputation`);
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || '获取数据失败');
          return;
        }
        setData(await res.json());
      } catch {
        setError('网络错误，请稍后重试');
      }
    };
    if (params.sellerId) fetchData();
  }, [params.sellerId]);

  const handleCopyDeclaration = useCallback(async () => {
    if (!data) return;
    const declaration = `我是${data.user.nickname}（奕诺ID: ${data.user.seller_id || params.sellerId}），已在奕诺平台入驻${data.user.days_since_join}天，累计完成${data.stats.completed_orders}单，审核通过率${data.stats.approval_rate}%，平均修改${data.stats.avg_revisions}次。每一次交付，都有据可查。 —— 奕诺·服务进度存证管家`;
    try {
      await navigator.clipboard.writeText(declaration);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
    }
  }, [data, params.sellerId]);

  const handleGenerateImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `奕诺信誉名片_${data?.user.nickname || 'seller'}.png`;
      link.href = dataUrl;
      link.click();
      setImageSuccess(true);
      setTimeout(() => setImageSuccess(false), 2000);
    } catch {
      // fallback
    }
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">无法加载信誉名片</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="animate-pulse text-indigo-600 text-lg">加载中...</div>
      </div>
    );
  }

  const reputationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/seller/card/${params.sellerId}`
    : `/seller/card/${params.sellerId}`;

  return (
    <div className="min-h-screen bg-page-gradient py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 信誉名片主体 */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 顶部品牌横幅 */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/40">
                {data.user.nickname?.charAt(0) || '卖'}
              </div>
              <div>
                <h1 className="text-xl font-bold">{data.user.nickname}</h1>
                <div className="flex items-center gap-3 text-indigo-100 text-sm mt-1">
                  <span>卖家ID: {data.user.seller_id || '—'}</span>
                  <span className="bg-white/20 rounded px-2 py-0.5 text-xs">{LEVEL_LABELS[data.user.membership_level] || data.user.membership_level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            {[
              { label: '入驻天数', value: data.user.days_since_join, suffix: '天' },
              { label: '累计订单', value: data.stats.completed_orders, suffix: '单' },
              { label: '审核通过率', value: data.stats.approval_rate, suffix: '%' },
              { label: '平均修改', value: data.stats.avg_revisions, suffix: '次' },
            ].map((item) => (
              <div key={item.label} className="px-3 py-4 text-center">
                <div className="text-2xl font-bold text-indigo-600 tabular-nums">
                  {item.value}<span className="text-sm font-normal text-slate-400">{item.suffix}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          {/* 成就徽章 - hidden per design update */}

          {/* 近期动态 */}
          {data.recent_activity.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">近期交付动态</h3>
              <div className="space-y-2">
                {data.recent_activity.slice(0, 5).map((act) => (
                  <div key={act.order_no} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{act.service_type}</span>
                    <span className="text-xs text-slate-400">{new Date(act.updated_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部品牌 + 二维码 */}
          <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
            <div>
              <div className="font-bold text-indigo-700 text-lg">奕諾</div>
              <div className="text-xs text-slate-500">服务进度存证管家</div>
            </div>
            <QRCodeSVG value={reputationUrl} size={64} />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyDeclaration}
            className="flex-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg py-3 text-sm font-medium hover:bg-indigo-50 transition-colors"
          >
            {copySuccess ? '✓ 已复制' : '📋 复制信誉宣言'}
          </button>
          <button
            onClick={handleGenerateImage}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {imageSuccess ? '✓ 已保存' : '🖼 生成信誉长图'}
          </button>
        </div>
      </div>
    </div>
  );
}
