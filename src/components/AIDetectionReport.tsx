/**
 * AI 检测报告组件 — 提交/查看双模式
 * 深色科技风格
 */
'use client';

import { useState, useEffect } from 'react';
import { Shield, Upload, FileText, CheckCircle, AlertTriangle, XCircle, Download, Loader2 } from 'lucide-react';

interface AIDetectionReportProps {
  orderId: string;
  mode: 'submit' | 'view';
  existingData?: {
    status: string | null;
    score: number | null;
    reportUrl: string | null;
  };
}

export function AIDetectionReport({ orderId, mode, existingData }: AIDetectionReportProps) {
  const [data, setData] = useState(existingData || { status: null as string | null, score: null as number | null, reportUrl: null as string | null });
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'upload' | 'human' | 'skip' | null>(null);
  const [score, setScore] = useState(50);
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'view' && !existingData) {
      fetch(`/api/ai-detection?orderId=${orderId}`)
        .then(r => r.json())
        .then(res => {
          if (res.success && res.data) {
            setData(res.data);
          }
        })
        .catch(() => {});
    }
  }, [mode, orderId, existingData]);

  const handleSave = async (status: string, scoreVal?: number, reportUrlVal?: string) => {
    setSaving(true);
    try {
      await fetch('/api/ai-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          orderId,
          status,
          score: scoreVal ?? null,
          reportUrl: reportUrlVal ?? null,
        }),
      });
      setData({ status, score: scoreVal ?? null, reportUrl: reportUrlVal ?? null });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      formData.append('type', 'ai_detection');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.url) {
        setFileUrl(result.url);
      }
    } finally {
      setLoading(false);
    }
  };

  // 查看模式
  if (mode === 'view') {
    const statusConfig = data.status === 'detected' || data.status === 'passed'
      ? { label: '已检测', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle }
      : data.status === 'human_original'
      ? { label: '人工原创', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Shield }
      : data.status === 'not_detected'
      ? { label: '未检测', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: AlertTriangle }
      : { label: '待检测', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: AlertTriangle };

    const StatusIcon = statusConfig.icon;

    return (
      <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI 原创性检测</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
            <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
            <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>

        {/* 分数条 */}
        {data.score !== null && data.score !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">AI 疑似度</span>
              <span className={`font-mono font-bold ${data.score <= 30 ? 'text-emerald-400' : data.score <= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {data.score}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.score <= 30 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                  data.score <= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        )}

        {/* 报告下载 */}
        {data.reportUrl && (
          <a
            href={data.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            下载检测报告
          </a>
        )}
      </div>
    );
  }

  // 已提交状态
  if (data.status && data.status !== 'pending') {
    return <AIDetectionReport orderId={orderId} mode="view" existingData={data} />;
  }

  // 提交模式
  return (
    <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI 原创性检测</h3>
          <p className="text-xs text-slate-500">选择检测方式</p>
        </div>
      </div>

      {!selectedMode ? (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedMode('upload')}
            className="p-3 rounded-lg border border-[#2a3a5f] bg-[#0a0e1a]/50 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-center"
          >
            <Upload className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">上传报告</p>
            <p className="text-[10px] text-slate-500 mt-1">上传第三方检测报告</p>
          </button>
          <button
            onClick={() => setSelectedMode('human')}
            className="p-3 rounded-lg border border-[#2a3a5f] bg-[#0a0e1a]/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-center"
          >
            <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">人工原创</p>
            <p className="text-[10px] text-slate-500 mt-1">声明为人工原创</p>
          </button>
          <button
            onClick={() => { handleSave('not_detected'); }}
            className="p-3 rounded-lg border border-[#2a3a5f] bg-[#0a0e1a]/50 hover:border-slate-500/30 hover:bg-slate-500/5 transition-all text-center"
          >
            <AlertTriangle className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-white font-medium">暂不检测</p>
            <p className="text-[10px] text-slate-500 mt-1">后续再补充</p>
          </button>
        </div>
      ) : selectedMode === 'upload' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">上传检测报告 (PDF/图片)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file rounded-lg file:border-0 file:text-xs file:font-medium file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer border border-[#2a3a5f] bg-[#0a0e1a]"
            />
            {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mt-2" />}
            {fileUrl && <p className="text-xs text-emerald-400 mt-1">文件已上传</p>}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">检测分数 (0-100, 越低越原创)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-[#2a3a5f] bg-[#0a0e1a] text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-[#2a3a5f] text-slate-400 text-xs hover:bg-white/5"
            >
              返回
            </button>
            <button
              onClick={() => handleSave('detected', score, fileUrl)}
              disabled={saving}
              className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '保存中...' : '提交'}
            </button>
          </div>
        </div>
      ) : selectedMode === 'human' ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-slate-300 leading-relaxed">
              本人声明：本订单所有交付物均为本人独立完成的人工原创作品，未使用任何 AI 生成工具辅助创作。
              如有虚假，愿承担相应责任。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-[#2a3a5f] text-slate-400 text-xs hover:bg-white/5"
            >
              返回
            </button>
            <button
              onClick={() => handleSave('human_original')}
              disabled={saving}
              className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '保存中...' : '确认声明'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
