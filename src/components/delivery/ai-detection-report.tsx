/**
 * AI 检测报告组件
 * 展示 AI 检测结果：AIGC疑似度、模板套用检测、质量评分
 */
'use client';

import { useState } from 'react';

export interface AIDetectionData {
  status: 'passed' | 'pending' | 'failed';
  aigcScore: number;
  templateScore: number;
  qualityScore: number;
  dimensions: {
    name: string;
    score: number;
    description: string;
  }[];
  summary: string;
  detectedAt: string;
  wordCount: number;
}

interface AIDetectionReportProps {
  data: AIDetectionData;
  onReDetect?: () => void;
}

export function AIDetectionReport({ data, onReDetect }: AIDetectionReportProps) {
  const getStatusConfig = (status: AIDetectionData['status']) => {
    switch (status) {
      case 'passed':
        return {
          label: '检测通过',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: '✓',
        };
      case 'failed':
        return {
          label: '检测未通过',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '✕',
        };
      case 'pending':
      default:
        return {
          label: '待人工复核',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: '⚠',
        };
    }
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">AI 原创性检测</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                检测时间：{new Date(data.detectedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
            <span className={`text-lg ${statusConfig.color}`}>{statusConfig.icon}</span>
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-slate-100">
        <ScoreCard
          label="AIGC 疑似度"
          score={data.aigcScore}
          inverted
          description="越低越好"
        />
        <ScoreCard
          label="模板套用"
          score={data.templateScore}
          inverted
          description="越低越好"
        />
        <ScoreCard
          label="质量评分"
          score={data.qualityScore}
          description="越高越好"
        />
      </div>

      {/* 检测维度 */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">检测维度</h4>
        <div className="space-y-3">
          {data.dimensions.map((dim) => (
            <div key={dim.name} className="flex items-center gap-3">
              <div className="w-20 text-xs text-slate-600 flex-shrink-0">{dim.name}</div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dim.score >= 80 ? 'bg-emerald-500' :
                    dim.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <div className="w-10 text-xs text-slate-600 text-right">{dim.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 检测摘要 */}
      <div className="px-5 py-4 bg-slate-50">
        <p className="text-sm text-slate-700">{data.summary}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>检测字数：{data.wordCount} 字</span>
          {onReDetect && (
            <button
              onClick={onReDetect}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              重新检测
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  inverted?: boolean;
  description?: string;
}

function ScoreCard({ label, score, inverted = false, description }: ScoreCardProps) {
  const getColor = (s: number, inv: boolean) => {
    const effectiveScore = inv ? 100 - s : s;
    if (effectiveScore >= 70) return 'text-emerald-600';
    if (effectiveScore >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBgColor = (s: number, inv: boolean) => {
    const effectiveScore = inv ? 100 - s : s;
    if (effectiveScore >= 70) return 'from-emerald-500 to-emerald-600';
    if (effectiveScore >= 40) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-100"
          />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'} />
              <stop offset="100%" stopColor={score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'} />
            </linearGradient>
          </defs>
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${getColor(score, inverted)}`}>
          {score}
        </div>
      </div>
      <div className="text-xs font-medium text-slate-700">{label}</div>
      {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
    </div>
  );
}

/**
 * AI 检测触发组件（用于卖家发起检测）
 */
interface AIDetectionTriggerProps {
  orderId: string;
  text: string;
  onResult?: (result: AIDetectionData) => void;
}

export function AIDetectionTrigger({ orderId, text, onResult }: AIDetectionTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIDetectionData | null>(null);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    if (!text || text.length < 50) {
      setError('文本内容过短，至少需要50字');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '检测失败');
        return;
      }

      const detectionResult: AIDetectionData = {
        status: data.status,
        aigcScore: data.aigcScore,
        templateScore: data.templateScore,
        qualityScore: data.qualityScore,
        dimensions: data.dimensions,
        summary: data.summary,
        detectedAt: data.detectedAt,
        wordCount: data.wordCount,
      };

      setResult(detectionResult);
      onResult?.(detectionResult);
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <AIDetectionReport data={result} onReDetect={handleDetect} />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg">
          🤖
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">AI 原创性检测</h3>
          <p className="text-xs text-slate-500">检测交付物原创性和质量</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleDetect}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
            </svg>
            检测中...
          </span>
        ) : (
          '开始 AI 检测'
        )}
      </button>
    </div>
  );
}
