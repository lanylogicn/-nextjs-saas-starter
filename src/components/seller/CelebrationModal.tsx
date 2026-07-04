/**
 * @component CelebrationModal（交付喜报弹窗）
 * @description
 * 订单完成时展示的交付喜报，支持3种风格：
 * - 经典靛蓝（indigo）：专业沉稳
 * - 璀璨星光（purple）：创意闪耀
 * - 清新田园（emerald）：自然清新
 *
 * 展示内容：卖家昵称、服务类型、核心数据（一次过稿/提前交付等）、信誉主页QR码。
 * 底部附带分享文案，一键复制。
 * 支持保存为图片（html-to-image）。
 *
 * @props {string} orderId - 服务单ID
 * @props {boolean} open - 是否显示弹窗
 * @props {() => void} onClose - 关闭回调
 *
 * API：GET /api/orders/[id]/celebration
 * 依赖：qrcode.react, html-to-image
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface CelebrationModalProps {
  orderId: string;
  onClose: () => void;
}

interface CelebrationData {
  order: {
    order_no: string;
    service_type: string;
    duration_days: number;
  };
  seller: {
    nickname: string;
    avatar_url: string | null;
    id: string;
  };
  celebration: {
    tags: string[];
    is_one_pass: boolean;
    is_fast_delivery: boolean;
    badges: Array<{ key: string; name: string; icon: string }>;
  };
  share_text: string;
}

const STYLES = [
  { name: '经典琥珀', bg: 'from-indigo-50 to-orange-50', accent: 'amber', border: 'border-indigo-200', title: 'text-indigo-800', sub: 'text-indigo-600' },
  { name: '璀璨星光', bg: 'from-indigo-50 to-purple-50', accent: 'indigo', border: 'border-indigo-200', title: 'text-indigo-800', sub: 'text-indigo-600' },
  { name: '清新田园', bg: 'from-emerald-50 to-teal-50', accent: 'emerald', border: 'border-emerald-200', title: 'text-emerald-800', sub: 'text-emerald-600' },
];

export default function CelebrationModal({ orderId, onClose }: CelebrationModalProps) {
  const [data, setData] = useState<CelebrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStyle, setCurrentStyle] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const style = STYLES[currentStyle];

  useEffect(() => {
    const fetchCelebration = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/celebration`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '获取喜报数据失败');
        }
        const json = await res.json();
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchCelebration();
  }, [orderId]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `交付喜报-${data?.order.order_no || 'celebration'}-${style.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Generate celebration image failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [data, style.name]);

  const handleCopyShareText = useCallback(async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.share_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = data.share_text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-stone-800">交付喜报</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">&times;</button>
        </div>

        {loading && <div className="p-8 text-center text-stone-500">加载中...</div>}
        {error && <div className="p-8 text-center text-stone-600">{error}</div>}

        {data && (
          <div className="p-4 space-y-4">
            {/* Style Switcher */}
            <div className="flex gap-2">
              {STYLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStyle(i)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    i === currentStyle
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Celebration Card */}
            <div ref={cardRef} className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl p-6 space-y-4`}>
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className={`text-xl font-bold ${style.title}`}>交付成功！</div>
                <div className={`text-sm ${style.sub}`}>恭喜完成本次服务</div>
              </div>

              {/* Tags */}
              {data.celebration.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {data.celebration.tags.map((tag, i) => (
                    <span key={i} className={`px-3 py-1 bg-white/80 rounded-full text-sm font-medium ${style.title}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Core Data */}
              <div className={`bg-white/60 rounded-lg p-4 space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">服务类型</span>
                  <span className="font-medium text-stone-800">{data.order.service_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">耗时</span>
                  <span className="font-medium text-stone-800">{data.order.duration_days} 天</span>
                </div>
              </div>

              {/* Seller + QR */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold border border-stone-200">
                    {data.seller.nickname[0]}
                  </div>
                  <span className="text-sm font-medium text-stone-700">{data.seller.nickname}</span>
                </div>
                <div className="bg-white p-1 rounded border border-stone-200">
                  <QRCodeSVG value={`${domain}/seller/${data.seller.id}`} size={56} />
                </div>
              </div>

              <div className="text-center text-xs text-stone-400">
                奕诺 · 服务进度存证管家
              </div>
            </div>

            {/* Share Text */}
            <div className="bg-stone-50 rounded-lg p-3">
              <div className="text-xs text-stone-500 mb-1">分享文案（可复制发布到小红书/闲鱼）</div>
              <div className="text-sm text-stone-700 whitespace-pre-wrap">{data.share_text}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyShareText}
                className="flex-1 py-2.5 border border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                {copied ? '已复制!' : '复制分享文案'}
              </button>
              <button
                onClick={handleDownload}
                disabled={generating}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {generating ? '生成中...' : '保存喜报图片'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
