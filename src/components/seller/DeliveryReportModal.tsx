/**
 * @component DeliveryReportModal（专业交付报告弹窗）
 * @description
 * 卖家查看订单的专业交付报告，包含：
 * - 项目基本信息（编号/买家/服务类型/状态）
 * - 全流程时间轴（7个节点的操作时间和操作者）
 * - 客户审核记录（通过/驳回 + 驳回原因）
 * - 修改记录详情
 * - 交付小结（如"本项目耗时3天，审核通过率100%"）
 * - 公证编号 + 查验二维码
 * - 保存为图片功能（html-to-image）
 *
 * @props {string} orderId - 服务单ID
 * @props {boolean} open - 是否显示弹窗
 * @props {() => void} onClose - 关闭回调
 *
 * API：GET /api/orders/[id]（订单详情），GET /api/seller/[id]/report（交付报告数据）
 * 依赖：qrcode.react, html-to-image
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface DeliveryReportProps {
  orderId: string;
  sellerId: string;
  onClose: () => void;
}

interface ReportData {
  order: {
    id: string;
    order_no: string;
    buyer_nickname: string;
    service_type: string;
    service_content: string;
    created_at: string;
    updated_at: string;
    estimated_delivery: string | null;
  };
  seller_id: string;
  report: {
    notarization_no: string;
    verify_token: string;
    summary: string;
    generated_at: string;
  };
  timeline: Array<{
    node: number;
    action: string;
    operator_type: string;
    rejection_reason: string | null;
    created_at: string;
  }>;
}

const NODE_LABELS: Record<number, string> = {
  1: '订单接收', 2: '需求梳理', 3: '制作中',
  4: '初稿完成，等待审核', 5: '审核通过，终稿输出', 6: '终稿已交付', 7: '确认完成',
};

const ACTION_LABELS: Record<string, string> = {
  advance: '推进', approve: '审核通过', reject: '驳回', complete: '完成',
};

export default function DeliveryReportModal({ orderId, sellerId, onClose }: DeliveryReportProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/seller/${sellerId}/report`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '获取报告失败');
        }
        const json = await res.json();
        const report = json.reports?.find((r: ReportData) => r.order.id === orderId);
        if (!report) throw new Error('未找到该订单的交付报告');
        setData(report);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [orderId, sellerId]);

  const handleDownload = useCallback(async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `交付报告-${data?.order.order_no || 'report'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Generate report image failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [data]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-stone-800">专业交付报告</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">&times;</button>
        </div>

        {loading && (
          <div className="p-8 text-center text-stone-500">加载中...</div>
        )}

        {error && (
          <div className="p-8 text-center">
            <div className="text-stone-600">{error}</div>
          </div>
        )}

        {data && (
          <div className="p-4">
            <div ref={reportRef} className="bg-white p-6 space-y-4">
              {/* Header */}
              <div className="text-center border-b border-indigo-200 pb-4">
                <div className="text-indigo-700 font-bold text-lg">奕诺专业交付报告</div>
                <div className="text-stone-400 text-xs mt-1">YINUO PROFESSIONAL DELIVERY REPORT</div>
              </div>

              {/* Notarization Number */}
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <div className="text-xs text-stone-500">公证编号</div>
                <div className="font-mono font-bold text-indigo-700">{data.report.notarization_no}</div>
              </div>

              {/* Project Info */}
              <div>
                <div className="text-sm font-bold text-stone-700 mb-2">项目基本信息</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-stone-500">订单编号</span><span className="font-mono">{data.order.order_no}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">卖家ID</span><span className="font-mono text-indigo-600">{data.seller_id}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">服务类型</span><span>{data.order.service_type}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">买家</span><span>{data.order.buyer_nickname}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">创建时间</span><span>{new Date(data.order.created_at).toLocaleDateString('zh-CN')}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">完成时间</span><span>{new Date(data.order.updated_at).toLocaleDateString('zh-CN')}</span></div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="text-sm font-bold text-stone-700 mb-2">全流程时间轴</div>
                <div className="space-y-2">
                  {data.timeline.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.action === 'reject' ? 'bg-red-500' : log.action === 'approve' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-stone-700">节点{log.node} - {NODE_LABELS[log.node] || '未知'}</span>
                          <span className="text-stone-400 text-xs">{new Date(log.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <div className="text-stone-500 text-xs">{ACTION_LABELS[log.action] || log.action}</div>
                        {log.rejection_reason && (
                          <div className="text-red-500 text-xs mt-0.5">驳回原因: {log.rejection_reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {data.report.summary && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-emerald-800 mb-1">交付小结</div>
                  <div className="text-sm text-emerald-700">{data.report.summary}</div>
                </div>
              )}

              {/* QR Code + Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div>
                  <div className="text-xs text-stone-400">奕诺 · 服务进度存证管家</div>
                  <div className="text-xs text-stone-400">报告生成时间: {new Date(data.report.generated_at).toLocaleString('zh-CN')}</div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-1 rounded border border-stone-200 inline-block">
                    <QRCodeSVG value={`${domain}/verify/${data.report.verify_token}`} size={64} />
                  </div>
                  <div className="text-xs text-stone-400 mt-1">扫码查验真伪</div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-4">
              <button
                onClick={handleDownload}
                disabled={generating}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {generating ? '生成中...' : '下载交付报告图片'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
