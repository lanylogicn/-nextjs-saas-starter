/**
 * 品类化交付清单组件
 * 展示标准交付清单，支持勾选已完成项
 */
'use client';

import { useState, useEffect } from 'react';
import { type CategoryTemplate, type ChecklistItem, getCategoryTemplate, inferCategory } from '@/lib/category-templates';

interface CategoryChecklistProps {
  serviceType: string;
  orderId: string;
  initialChecked?: string[];
  onChecklistChange?: (checkedIds: string[]) => void;
  readOnly?: boolean;
}

export function CategoryChecklist({
  serviceType,
  orderId,
  initialChecked = [],
  onChecklistChange,
  readOnly = false,
}: CategoryChecklistProps) {
  const [template, setTemplate] = useState<CategoryTemplate | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(initialChecked));

  useEffect(() => {
    const categoryKey = inferCategory(serviceType);
    const tmpl = getCategoryTemplate(categoryKey);
    if (tmpl) {
      setTemplate(tmpl);
    }
  }, [serviceType]);

  useEffect(() => {
    setCheckedItems(new Set(initialChecked));
  }, [initialChecked]);

  const handleToggle = (itemId: string) => {
    if (readOnly) return;
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
    onChecklistChange?.(Array.from(newChecked));
  };

  if (!template) {
    return null;
  }

  const totalItems = template.checklist.length;
  const completedItems = checkedItems.size;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const requiredItems = template.checklist.filter(i => i.required);
  const requiredCompleted = requiredItems.filter(i => checkedItems.has(i.id)).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{template.name} - 交付清单</h3>
              <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
            <div className="text-xs text-slate-500">完成进度</div>
          </div>
        </div>
        {/* 进度条 */}
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>已完成 {completedItems}/{totalItems} 项</span>
          <span className={requiredCompleted === requiredItems.length ? 'text-emerald-600' : 'text-amber-600'}>
            必选项 {requiredCompleted}/{requiredItems.length}
          </span>
        </div>
      </div>

      {/* 清单列表 */}
      <div className="px-5 py-4 space-y-2">
        {template.checklist.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            checked={checkedItems.has(item.id)}
            onToggle={() => handleToggle(item.id)}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* 底部说明 */}
      {!readOnly && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            💡 勾选已完成项目，帮助买家了解交付进度。必选项全部完成后即可提交交付。
          </p>
        </div>
      )}
    </div>
  );
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
  readOnly: boolean;
}

function ChecklistItemRow({ item, checked, onToggle, readOnly }: ChecklistItemRowProps) {
  return (
    <div
      className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
        readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'
      } ${checked ? 'bg-emerald-50/50' : ''}`}
      onClick={onToggle}
    >
      {/* 勾选框 */}
      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
        checked
          ? 'bg-emerald-500 text-white'
          : 'border-2 border-slate-300'
      }`}>
        {checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {item.label}
          </span>
          {item.required && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">必选</span>
          )}
        </div>
        {item.description && (
          <p className={`text-xs mt-0.5 ${checked ? 'text-slate-300' : 'text-slate-500'}`}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 只读版交付清单（用于交付报告展示）
 */
interface CategoryChecklistDisplayProps {
  serviceType: string;
  checkedItems?: string[];
}

export function CategoryChecklistDisplay({ serviceType, checkedItems = [] }: CategoryChecklistDisplayProps) {
  const [template, setTemplate] = useState<CategoryTemplate | null>(null);

  useEffect(() => {
    const categoryKey = inferCategory(serviceType);
    const tmpl = getCategoryTemplate(categoryKey);
    if (tmpl) {
      setTemplate(tmpl);
    }
  }, [serviceType]);

  if (!template) {
    return null;
  }

  const checkedSet = new Set(checkedItems);
  const totalItems = template.checklist.length;
  const completedItems = checkedItems.filter(id => checkedSet.has(id)).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{template.name} - 交付清单</h3>
              <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
            <div className="text-xs text-slate-500">完成度</div>
          </div>
        </div>
        {/* 进度条 */}
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 清单列表 */}
      <div className="px-5 py-4 space-y-1.5">
        {template.checklist.map((item) => {
          const isChecked = checkedSet.has(item.id);
          return (
            <div key={item.id} className="flex items-center gap-2.5 py-1.5">
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                isChecked ? 'bg-emerald-500 text-white' : 'border border-slate-300'
              }`}>
                {isChecked && (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${isChecked ? 'text-slate-400' : 'text-slate-700'}`}>
                {item.label}
              </span>
              {item.required && !isChecked && (
                <span className="text-xs text-amber-600">*</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
