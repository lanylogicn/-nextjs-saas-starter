/**
 * @file 卖家信誉主页
 * @description
 * 每个卖家的公开信誉展示页，聚合展示：
 * - 卖家昵称、入驻天数、会员等级
 * - 累计订单数、审核通过率、平均修改次数
 * - 成就徽章（极速交付/一次过稿/金牌口碑）
 * - 近期交付动态
 * - 信誉主页二维码
 * - 「复制信誉宣言」按钮（粘贴到闲鱼等平台）
 * - 「生成信誉长图」按钮（html-to-image 生成带Logo+QR的图片）
 *
 * 路由：/seller/[id]（动态路由，id为卖家用户ID）
 * API：GET /api/seller/[id]/reputation
 * 依赖：qrcode.react, html-to-image
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
    seller_id?: string;
    avatar_url: string | null;
    membership_level: string;
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

export default function SellerReputationPage() {
  const params = useParams();
  const sellerId = params.id as string;
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const domain = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PROJECT_DOMAIN || window.location.host)
    : '';
  const reputationUrl = `${domain}/seller/${sellerId}`;

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const res = await fetch(`/api/seller/${sellerId}/reputation`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '获取数据失败');
        }
        const json = await res.json();
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchReputation();
  }, [sellerId]);

  const declaration = data
    ? `🔥 ${data.user.nickname} 的奕诺信誉宣言\n` +
      `📋 入驻 ${data.user.days_since_join} 天 | 完成订单 ${data.stats.completed_orders} 单\n` +
      `✅ 审核通过率 ${data.stats.approval_rate}% | 平均修改 ${data.stats.avg_revisions} 次\n` +
      (data.badges.length > 0 ? `🏅 成就：${data.badges.map(b => b.name).join('、')}\n` : '') +
      `📌 奕诺·服务进度存证管家 — 让每一次交付都有据可查\n` +
      `🔗 ${reputationUrl}`
    : '';

  const handleCopyDeclaration = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(declaration);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = declaration;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [declaration]);

  const handleGenerateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#FFFBEB',
      });
      const link = document.createElement('a');
      link.download = `奕诺信誉-${data?.user.nickname || 'seller'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Generate image failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center">
        <div className="text-stone-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-stone-700 text-lg">{error}</div>
          <div className="text-stone-400 text-sm mt-2">该卖家可能未开通信誉名片功能</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-lg font-bold">奕诺信誉主页</div>
          <div className="text-indigo-100 text-sm mt-1">服务进度存证管家</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Reputation Card (for image generation) */}
        <div ref={cardRef} className="bg-white rounded-lg shadow-md p-6 space-y-5 card-gradient-subtle">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl overflow-hidden border-2 border-indigo-300">
              {data.user.avatar_url ? (
                <img src={data.user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{data.user.nickname[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold text-stone-800">{data.user.nickname}</div>
              <div className="text-sm text-stone-500">
                {data.user.seller_id && <span className="font-mono text-indigo-600 mr-2">ID: {data.user.seller_id}</span>}
                {LEVEL_LABELS[data.user.membership_level] || data.user.membership_level} · 入驻 {data.user.days_since_join} 天
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{data.stats.completed_orders}</div>
              <div className="text-xs text-stone-400">已完成订单</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-indigo-700">{data.stats.approval_rate}%</div>
              <div className="text-xs text-stone-500">审核通过率</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-indigo-700">{data.stats.avg_revisions}</div>
              <div className="text-xs text-stone-500">平均修改次数</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-indigo-700">{data.stats.total_orders}</div>
              <div className="text-xs text-stone-500">总订单数</div>
            </div>
          </div>

          {/* Badges */}
          {data.badges.length > 0 && (
            <div>
              <div className="text-sm font-bold text-stone-700 mb-2">成就徽章</div>
              <div className="flex flex-wrap gap-2">
                {data.badges.map((badge) => (
                  <div
                    key={badge.key}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-orange-50 border border-indigo-200 rounded-full px-3 py-1.5"
                    title={badge.description}
                  >
                    <span className="text-base">{badge.icon}</span>
                    <span className="text-sm font-medium text-indigo-800">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {data.recent_activity.length > 0 && (
            <div>
              <div className="text-sm font-bold text-stone-700 mb-2">近期交付动态</div>
              <div className="space-y-2">
                {data.recent_activity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${act.status === '已完成' ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                      <span className="text-stone-600">{act.service_type}</span>
                      <span className="text-stone-400 text-xs">{act.order_no}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${act.status === '已完成' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code + Footer (for long image) */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div>
              <div className="text-xs text-stone-400">奕诺 · 服务进度存证管家</div>
              <div className="text-xs text-stone-400">让每一次交付都有据可查</div>
            </div>
            <div className="bg-white p-1 rounded border border-stone-200">
              <QRCodeSVG value={reputationUrl} size={64} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyDeclaration}
            className="flex-1 py-3 bg-white border border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            {copied ? '已复制!' : '复制信誉宣言'}
          </button>
          <button
            onClick={handleGenerateImage}
            disabled={generating}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {generating ? '生成中...' : '生成信誉长图'}
          </button>
        </div>
      </div>
    </div>
  );
}
