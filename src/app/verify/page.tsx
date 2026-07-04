/**
 * 公证查验页面
 * 路由：/verify
 * 功能：输入公证编号查验交付报告真伪，显示报告详情
 * API：GET /api/verify/[token]（token从公证编号查询获得）
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VerifyResult {
  found: boolean;
  report?: {
    notarization_no: string;
    summary: string;
    generated_at: string;
  };
  order?: {
    order_no: string;
    service_type: string;
    seller_nickname: string;
    seller_id: string;
    created_at: string;
    current_node: number;
  };
}

const NODE_LABELS = ['订单接收', '需求梳理', '制作中', '初稿完成等待审核', '审核通过终稿输出', '终稿已交付', '确认完成'];

export default function VerifyPage() {
  const [notaryNo, setNotaryNo] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!notaryNo.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 先通过公证编号查询verify_token
      const searchRes = await fetch(`/api/verify/search?notaryNo=${encodeURIComponent(notaryNo.trim())}`);
      if (!searchRes.ok) {
        setError('查验失败，请检查公证编号是否正确');
        setLoading(false);
        return;
      }
      const searchData = await searchRes.json();

      if (!searchData.verify_token) {
        setResult({ found: false });
        setLoading(false);
        return;
      }

      // 用token查询报告详情
      const res = await fetch(`/api/verify/${searchData.verify_token}`);
      if (!res.ok) {
        setResult({ found: false });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResult({ found: true, ...data });
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">公证查验</h1>
          <p className="text-slate-500">输入公证编号，验证交付报告的真伪</p>
        </div>

        {/* 搜索框 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">公证编号</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={notaryNo}
              onChange={(e) => setNotaryNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="请输入公证编号，如 YN-20250101-XXXXXX"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-mono"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !notaryNo.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '查验中...' : '查验'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* 查验结果 */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {result.found ? (
              <>
                {/* 验证通过 */}
                <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-emerald-800">该报告已通过公证查验</h2>
                      <p className="text-sm text-emerald-600">此交付报告真实有效</p>
                    </div>
                  </div>
                </div>

                {/* 报告详情 */}
                {result.report && (
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 mb-3">报告信息</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-400">公证编号：</span><span className="font-mono text-slate-800">{result.report.notarization_no}</span></div>
                      <div><span className="text-slate-400">生成时间：</span><span className="text-slate-800">{new Date(result.report.generated_at).toLocaleDateString()}</span></div>
                    </div>
                    {result.report.summary && (
                      <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                        {result.report.summary}
                      </div>
                    )}
                  </div>
                )}

                {result.order && (
                  <div className="px-6 py-4">
                    <h3 className="text-sm font-semibold text-slate-500 mb-3">订单信息</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-400">服务单号：</span><span className="text-slate-800">{result.order.order_no}</span></div>
                      <div><span className="text-slate-400">服务类型：</span><span className="text-slate-800">{result.order.service_type}</span></div>
                      <div><span className="text-slate-400">卖家：</span><span className="text-slate-800">{result.order.seller_nickname}（ID: {result.order.seller_id}）</span></div>
                      <div><span className="text-slate-400">当前状态：</span><span className="text-slate-800">{NODE_LABELS[result.order.current_node - 1] || '未知'}</span></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 未找到 */
              <div className="px-6 py-10 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❌</span>
                </div>
                <h2 className="text-lg font-bold text-red-700 mb-2">未找到该报告</h2>
                <p className="text-slate-500 text-sm">请检查公证编号是否正确。如确认编号无误，请联系客服。</p>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="mt-6 bg-white rounded-xl p-4 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">什么是公证查验？</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            每份专业交付报告都附带唯一公证编号和查验二维码。通过公证查验，您可以验证报告的真实性，
            确认报告内容未被篡改。扫描报告上的二维码或手动输入公证编号即可进行查验。
          </p>
        </div>

        {/* 底部链接 */}
        <div className="mt-6 text-center">
          <Link href="/guide" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">查看使用指南</Link>
        </div>
      </div>
    </div>
  );
}
