/**
 * 专业交付报告页面
 * 路由：/delivery/report/[orderId]
 * 功能：显示完整交付报告（全流程时间轴、审核记录、交付小结、公证编号、查验二维码）
 * P0 升级：集成品类化交付清单、AI 原创性检测、版权声明
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { CategoryChecklistDisplay } from '@/components/delivery/category-checklist';
import { AIDetectionReport, type AIDetectionData } from '@/components/delivery/ai-detection-report';
import { CopyrightNotice, type CopyrightDeclaration } from '@/components/delivery/copyright-notice';

interface ReportData {
  order: {
    id: string;
    order_no: string;
    service_type: string;
    current_node: number;
    created_at: string;
    estimated_delivery: string | null;
    seller_nickname: string;
    seller_id?: string;
    buyer_nickname?: string;
  };
  progress_logs: Array<{
    id: string;
    from_node: number;
    to_node: number;
    action: string;
    note: string | null;
    created_at: string;
    reviewer_type: string | null;
  }>;
  report: {
    notarization_no: string;
    verify_token: string;
    summary: string;
    generated_at: string;
    // P0 升级字段
    ai_detection_status?: string;
    ai_detection_result?: AIDetectionData;
    checklist_completed?: string[];
    copyright_declaration?: CopyrightDeclaration;
  };
}

const NODE_LABELS = ['订单接收', '需求梳理', '制作中', '初稿完成等待审核', '审核通过终稿输出', '终稿已交付', '确认完成'];

export default function DeliveryReportPage() {
  const params = useParams<{ orderId: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [imageSuccess, setImageSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 先获取订单信息以确定sellerId
        const orderRes = await fetch(`/api/orders/${params.orderId}`);
        if (!orderRes.ok) {
          setError('订单不存在或无权查看');
          return;
        }
        const orderData = await orderRes.json();

        // 然后获取交付报告
        const reportRes = await fetch(`/api/seller/${orderData.order?.seller_id || orderData.seller_id}/report?orderId=${params.orderId}`);
        if (!reportRes.ok) {
          const d = await reportRes.json();
          setError(d.error || '获取报告失败');
          return;
        }
        setData(await reportRes.json());
      } catch {
        setError('网络错误，请稍后重试');
      }
    };
    if (params.orderId) fetchData();
  }, [params.orderId]);

  const handleSaveImage = useCallback(async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `交付报告_${data?.report.notarization_no || 'report'}.png`;
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
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">无法加载交付报告</h2>
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

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${data.report.verify_token}`
    : `/verify/${data.report.verify_token}`;

  // 计算统计数据
  const totalDays = data.progress_logs.length > 0
    ? Math.ceil((new Date(data.progress_logs[data.progress_logs.length - 1].created_at).getTime() - new Date(data.progress_logs[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const reviewLogs = data.progress_logs.filter((l: { action: string }) => l.action === 'approve' || l.action === 'reject');
  const rejectCount = data.progress_logs.filter((l: { action: string }) => l.action === 'reject').length;

  // P0 功能数据
  const hasAIDetection = data.report.ai_detection_result;
  const hasChecklist = data.report.checklist_completed && data.report.checklist_completed.length > 0;
  const hasCopyright = data.report.copyright_declaration;

  return (
    <div className="min-h-screen bg-page-gradient py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 报告主体 */}
        <div ref={reportRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 报告头 */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">专业交付报告</h1>
                <p className="text-indigo-200 text-sm mt-1">公证编号：{data.report.notarization_no}</p>
              </div>
              <QRCodeSVG value={verifyUrl} size={64} bgColor="transparent" fgColor="white" />
            </div>
          </div>

          {/* 项目信息 */}
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">项目信息</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">服务单号：</span><span className="text-slate-800 font-medium">{data.order.order_no}</span></div>
              <div><span className="text-slate-400">服务类型：</span><span className="text-slate-800">{data.order.service_type}</span></div>
              <div><span className="text-slate-400">卖家：</span><span className="text-slate-800">{data.order.seller_nickname}</span></div>
              {data.order.buyer_nickname && <div><span className="text-slate-400">买家：</span><span className="text-slate-800">{data.order.buyer_nickname}</span></div>}
              {data.order.seller_id && <div><span className="text-slate-400">卖家ID：</span><span className="text-slate-800">{data.order.seller_id}</span></div>}
              <div><span className="text-slate-400">创建时间：</span><span className="text-slate-800">{new Date(data.order.created_at).toLocaleDateString()}</span></div>
              <div><span className="text-slate-400">总耗时：</span><span className="text-slate-800">{totalDays}天</span></div>
            </div>
          </div>

          {/* 全流程时间轴 */}
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">全流程时间轴</h3>
            <div className="space-y-3">
              {data.progress_logs.map((log: { id: string; to_node: number; action: string; note: string | null; created_at: string }, idx: number) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      log.action === 'reject' ? 'bg-red-100 text-red-600' :
                      log.to_node >= 7 ? 'bg-emerald-100 text-emerald-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {log.action === 'reject' ? '✕' : log.to_node}
                    </div>
                    {idx < data.progress_logs.length - 1 && <div className="w-0.5 h-6 bg-slate-200" />}
                  </div>
                  <div className="pb-2">
                    <div className="text-sm font-medium text-slate-700">
                      {NODE_LABELS[log.to_node - 1] || `节点${log.to_node}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                      {log.note && <span className="ml-2 text-slate-500">备注：{log.note}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 审核记录 */}
          {reviewLogs.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">审核记录</h3>
              <div className="space-y-2">
                {reviewLogs.map((log: { id: string; action: string; note: string | null; created_at: string; reviewer_type: string | null }) => (
                  <div key={log.id} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                    log.action === 'approve' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <span>{log.action === 'approve' ? '✓ 通过' : '✕ 驳回'}</span>
                    <span className="text-xs opacity-70">{new Date(log.created_at).toLocaleString()}</span>
                    {log.note && <span className="text-xs opacity-70">「{log.note}」</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 交付小结 */}
          <div className="px-6 py-4 bg-indigo-50/50">
            <h3 className="text-sm font-semibold text-indigo-700 mb-2">交付小结</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {data.report.summary || `本项目耗时${totalDays}天，审核${reviewLogs.length}次，驳回${rejectCount}次，交付效率${rejectCount === 0 ? '高于' : '接近'}行业平均水平。`}
            </p>
          </div>

          {/* 底部公证信息 */}
          <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
            <div>
              <div className="text-xs text-slate-400">报告生成时间</div>
              <div className="text-sm text-slate-600">{new Date(data.report.generated_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">公证编号</div>
              <div className="text-sm font-mono text-indigo-700">{data.report.notarization_no}</div>
            </div>
          </div>
        </div>

        {/* P0 升级功能区域 */}
        <div className="space-y-4">
          {/* 品类化交付清单 */}
          {hasChecklist && (
            <CategoryChecklistDisplay
              serviceType={data.order.service_type}
              checkedItems={data.report.checklist_completed}
            />
          )}

          {/* AI 原创性检测 */}
          {hasAIDetection && (
            <AIDetectionReport data={data.report.ai_detection_result!} />
          )}

          {/* 版权声明 */}
          {hasCopyright && (
            <CopyrightNotice
              data={data.report.copyright_declaration!}
              notarizationNo={data.report.notarization_no}
            />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveImage}
            className="flex-1 bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {imageSuccess ? '✓ 已保存' : '🖼 保存为图片'}
          </button>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg py-3 text-sm font-medium hover:bg-indigo-50 transition-colors text-center"
          >
            🔍 查验此报告
          </a>
        </div>
      </div>
    </div>
  );
}
