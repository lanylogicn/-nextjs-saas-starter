/**
 * @file 交付报告公证查验页
 * @description
 * 买家/第三方通过公证查验链接验证交付报告真伪。
 * 展示：公证编号、订单基本信息、交付小结、查验二维码。
 * token 为 delivery_reports 表中的 verify_token 字段。
 *
 * 路由：/verify/[token]（动态路由）
 * API：GET /api/verify/[token]
 * 依赖：qrcode.react
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface VerifyData {
  valid: boolean;
  report: {
    notarization_no: string;
    summary: string;
    generated_at: string;
  };
  order: {
    order_no: string;
    service_type: string;
    buyer_nickname: string;
    seller_nickname: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerify = async () => {
      try {
        const res = await fetch(`/api/verify/${token}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '查验失败');
        }
        const json = await res.json();
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '查验失败');
      } finally {
        setLoading(false);
      }
    };
    fetchVerify();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center">
        <div className="text-stone-500">查验中...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-stone-700 text-lg">{error || '查验失败'}</div>
          <div className="text-stone-400 text-sm mt-2">该公证编号无效或不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white">
      <div className="bg-indigo-600 text-white py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-lg font-bold">奕诺交付报告公证查验</div>
          <div className="text-indigo-100 text-sm mt-1">服务进度存证管家</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Valid Badge */}
        <div className="bg-white rounded-lg shadow-md p-6 card-gradient-subtle">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-xl">✓</span>
            </div>
            <span className="text-emerald-700 font-bold text-lg">公证查验通过</span>
          </div>

          {/* Notarization Info */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-stone-500 mb-1">公证编号</div>
            <div className="text-lg font-mono font-bold text-indigo-700">{data.report.notarization_no}</div>
          </div>

          {/* Order Info */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">订单编号</span>
              <span className="text-stone-800 font-mono text-sm">{data.order.order_no}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">服务类型</span>
              <span className="text-stone-800 text-sm">{data.order.service_type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">买家</span>
              <span className="text-stone-800 text-sm">{data.order.buyer_nickname}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">卖家</span>
              <span className="text-stone-800 text-sm">{data.order.seller_nickname}（ID: {data.order.seller_id}）</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">创建时间</span>
              <span className="text-stone-800 text-sm">{new Date(data.order.created_at).toLocaleString('zh-CN')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-stone-500 text-sm">完成时间</span>
              <span className="text-stone-800 text-sm">{new Date(data.order.updated_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>

          {/* Summary */}
          {data.report.summary && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm font-medium text-emerald-800 mb-1">交付小结</div>
              <div className="text-sm text-emerald-700">{data.report.summary}</div>
            </div>
          )}

          {/* QR Code for verification */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100">
            <div>
              <div className="text-xs text-stone-400">报告生成时间</div>
              <div className="text-xs text-stone-500">{new Date(data.report.generated_at).toLocaleString('zh-CN')}</div>
            </div>
            <div className="text-center">
              <div className="bg-white p-1 rounded border border-stone-200 inline-block">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${token}`}
                  size={72}
                />
              </div>
              <div className="text-xs text-stone-400 mt-1">扫码查验真伪</div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-stone-400">
          奕诺 · 服务进度存证管家 — 让每一次交付都有据可查
        </div>
      </div>
    </div>
  );
}
