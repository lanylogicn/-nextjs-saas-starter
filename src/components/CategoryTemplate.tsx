/**
 * 品类化交付模板组件 — checklist / criteria / full 三种模式
 * 深色科技风格
 */
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, FileCheck, Shield } from 'lucide-react';
import { type CategoryTemplate as TCategoryTemplate, type ChecklistItem, getCategoryTemplate, inferCategory } from '@/lib/category-templates';

interface CategoryTemplateProps {
  serviceType: string;
  category?: string | null;
  mode: 'checklist' | 'criteria' | 'full';
  orderId?: string;
  initialChecked?: string[];
  onChecklistChange?: (checkedIds: string[]) => void;
  readOnly?: boolean;
}

export function CategoryTemplate({
  serviceType,
  category,
  mode,
  initialChecked = [],
  onChecklistChange,
  readOnly = false,
}: CategoryTemplateProps) {
  const [template, setTemplate] = useState<TCategoryTemplate | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(initialChecked));

  useEffect(() => {
    const key = category || inferCategory(serviceType);
    const tmpl = getCategoryTemplate(key);
    if (tmpl) setTemplate(tmpl);
  }, [serviceType, category]);

  useEffect(() => {
    setCheckedItems(new Set(initialChecked));
  }, [initialChecked]);

  const handleToggle = (itemId: string) => {
    if (readOnly) return;
    const next = new Set(checkedItems);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setCheckedItems(next);
    onChecklistChange?.(Array.from(next));
  };

  if (!template) return null;

  const totalItems = template.checklist.length;
  const completedItems = checkedItems.size;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const requiredItems = template.checklist.filter(i => i.required);
  const requiredCompleted = requiredItems.filter(i => checkedItems.has(i.id)).length;

  // criteria 模式 — 展示验收标准（从 checklist 的 required 项生成）
  if (mode === 'criteria') {
    return (
      <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{template.name} - 验收标准</h3>
            <p className="text-xs text-slate-500">{template.description}</p>
          </div>
        </div>
        <div className="space-y-2">
          {template.checklist.filter(i => i.required).map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-300">{item.label}</span>
                {item.description && <span className="text-slate-500 ml-1">— {item.description}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // checklist 模式
  if (mode === 'checklist') {
    return (
      <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a3a5f]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{template.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-white">{template.name} - 交付清单</h3>
                <p className="text-xs text-slate-500">{template.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {progress}%
              </div>
              <div className="text-[10px] text-slate-500">完成进度</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>已完成 {completedItems}/{totalItems} 项</span>
            <span className={requiredCompleted === requiredItems.length ? 'text-emerald-400' : 'text-amber-400'}>
              必选项 {requiredCompleted}/{requiredItems.length}
            </span>
          </div>
        </div>
        <div className="px-5 py-3 space-y-1.5">
          {template.checklist.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              checked={checkedItems.has(item.id)}
              onToggle={() => handleToggle(item.id)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    );
  }

  // full 模式
  return (
    <div className="rounded-xl border border-[#2a3a5f] bg-[#0f1629]/80 backdrop-blur-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2a3a5f]/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-white">{template.name}</h3>
            <p className="text-xs text-slate-500">{template.description}</p>
          </div>
        </div>
      </div>
      {/* 交付清单 */}
      <div className="px-5 py-3 border-b border-[#2a3a5f]/30">
        <h4 className="text-xs font-medium text-slate-400 mb-2">交付清单</h4>
        <div className="space-y-1.5">
          {template.checklist.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              checked={checkedItems.has(item.id)}
              onToggle={() => handleToggle(item.id)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
      {/* 验收标准 */}
      <div className="px-5 py-3">
        <h4 className="text-xs font-medium text-slate-400 mb-2">验收标准（必选项）</h4>
        <div className="space-y-1.5">
          {template.checklist.filter(i => i.required).map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-xs">
              <Shield className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
              <span className="text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({
  item,
  checked,
  onToggle,
  readOnly,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
  readOnly: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={readOnly}
      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
        checked
          ? 'bg-emerald-500/5 border border-emerald-500/20'
          : 'hover:bg-white/[0.02] border border-transparent'
      } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${checked ? 'text-emerald-400' : 'text-slate-300'}`}>
          {item.label}
        </div>
        {item.description && (
          <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
        )}
      </div>
      {item.required && (
        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[9px] text-amber-400 shrink-0">
          必选
        </span>
      )}
    </button>
  );
}
