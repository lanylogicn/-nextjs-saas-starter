/**
 * 版权声明组件 — 提交/查看双模式
 * 深色科技风格
 */
'use client';

import { useState, useEffect } from 'react';
import { Scale, Copy, Check, FileText } from 'lucide-react';
import { type CopyrightDeclarationData, generateCopyrightText, getMaterialSourceLabel, getFontLicenseLabel, getOwnershipLabel } from '@/lib/copyright-generator';

interface CopyrightDeclarationProps {
  orderId: string;
  mode: 'submit' | 'view';
  existingData?: CopyrightDeclarationData | null;
}

export function CopyrightDeclaration({ orderId, mode, existingData }: CopyrightDeclarationProps) {
  const [data, setData] = useState<CopyrightDeclarationData | null>(existingData || null);
  const [form, setForm] = useState<CopyrightDeclarationData>({
    materialSource: 'original',
    fontLicense: 'licensed',
    copyrightOwnership: 'full_transfer',
    additionalNotes: '',
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingData) setForm(existingData);
  }, [existingData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyright_declaration: form }),
      });
      if (res.ok) {
        setData(form);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    const text = generateCopyrightText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // 查看模式
  if (mode === 'view' || data) {
    const displayData = data || existingData;
    if (!displayData) return null;

    const copyrightText = generateCopyrightText(displayData);

    return (
      <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">版权声明</h3>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#2a3a5f] text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制声明'}
          </button>
        </div>

        {/* 声明摘要 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-[#2a3a5f]/50">
            <span className="text-xs text-slate-400">素材来源</span>
            <span className="text-xs text-white font-medium">{getMaterialSourceLabel(displayData.materialSource)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-[#2a3a5f]/50">
            <span className="text-xs text-slate-400">字体授权</span>
            <span className="text-xs text-white font-medium">{getFontLicenseLabel(displayData.fontLicense)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-[#2a3a5f]/50">
            <span className="text-xs text-slate-400">版权归属</span>
            <span className="text-xs text-white font-medium">{getOwnershipLabel(displayData.copyrightOwnership)}</span>
          </div>
        </div>

        {/* 完整声明文本 */}
        <details className="group">
          <summary className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors">
            查看完整版权声明
          </summary>
          <pre className="mt-3 p-3 rounded-lg bg-[#0a0e1a] border border-[#2a3a5f] text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
            {copyrightText}
          </pre>
        </details>

        {displayData.additionalNotes && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-[10px] text-amber-400 mb-1">补充说明</p>
            <p className="text-xs text-slate-300">{displayData.additionalNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // 提交模式
  return (
    <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">版权声明</h3>
          <p className="text-xs text-slate-500">填写交付物版权信息</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 素材来源 */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">素材来源</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'original', label: '原创', desc: '完全独立创作' },
              { value: 'ai_assisted', label: 'AI辅助', desc: '使用AI工具辅助' },
              { value: 'stock', label: '素材库', desc: '使用授权素材' },
              { value: 'mixed', label: '混合使用', desc: '多种来源组合' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, materialSource: opt.value }))}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  form.materialSource === opt.value
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-[#2a3a5f] hover:border-slate-500/50'
                }`}
              >
                <p className={`text-xs font-medium ${form.materialSource === opt.value ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 字体授权 */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">字体授权</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'licensed', label: '已授权' },
              { value: 'free', label: '免费字体' },
              { value: 'uncertain', label: '不确定' },
              { value: 'not_applicable', label: '不涉及' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, fontLicense: opt.value }))}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  form.fontLicense === opt.value
                    ? 'border-cyan-500/50 bg-cyan-500/5 text-cyan-400'
                    : 'border-[#2a3a5f] text-slate-400 hover:border-slate-500/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 版权归属 */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">版权归属</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'full_transfer', label: '完全转让' },
              { value: 'licensed_use', label: '授权使用' },
              { value: 'seller_retain', label: '卖家保留' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, copyrightOwnership: opt.value }))}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  form.copyrightOwnership === opt.value
                    ? 'border-cyan-500/50 bg-cyan-500/5 text-cyan-400'
                    : 'border-[#2a3a5f] text-slate-400 hover:border-slate-500/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 补充说明 */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">补充说明（选填）</label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) => setForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
            rows={2}
            placeholder="如有特殊版权约定，请在此说明..."
            className="w-full px-3 py-2 rounded-lg border border-[#2a3a5f] bg-[#0a0e1a] text-white text-xs focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? '保存中...' : '提交版权声明'}
        </button>
      </div>
    </div>
  );
}
