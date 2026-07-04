/**
 * @file 品类化交付模板功能页
 * @description 展示6大品类的标准交付清单模板
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, FileText, Palette, Code, PenTool, GraduationCap, Users } from 'lucide-react';
import { CATEGORY_TEMPLATES, type CategoryKey } from '@/lib/category-templates';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ppt: <FileText className="w-6 h-6" />,
  paper: <GraduationCap className="w-6 h-6" />,
  copywriting: <PenTool className="w-6 h-6" />,
  design: <Palette className="w-6 h-6" />,
  code: <Code className="w-6 h-6" />,
  resume: <Users className="w-6 h-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  ppt: 'from-orange-500 to-amber-500',
  paper: 'from-blue-500 to-cyan-500',
  copywriting: 'from-violet-500 to-purple-500',
  design: 'from-pink-500 to-rose-500',
  code: 'from-emerald-500 to-teal-500',
  resume: 'from-indigo-500 to-blue-500',
};

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const selectedTemplate = selectedCategory
    ? CATEGORY_TEMPLATES.find(t => t.key === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">品类化交付模板</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-6">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">P0新功能 · 免费开放</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            标准化交付清单
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            覆盖6大常见品类，每个品类10+标准交付检查项，确保交付质量不遗漏
          </p>
        </div>
      </section>

      {/* 品类选择 */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-slate-800 text-center mb-8">选择品类查看模板</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORY_TEMPLATES.map((template) => (
              <button
                key={template.key}
                onClick={() => setSelectedCategory(template.key)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedCategory === template.key
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[template.key]} flex items-center justify-center text-white mb-3`}>
                  {CATEGORY_ICONS[template.key]}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{template.name}</p>
                <p className="text-xs text-slate-500 mt-1">{template.checklist.length}项</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 模板详情 */}
      {selectedTemplate && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[selectedTemplate.key]} flex items-center justify-center text-white`}>
                {CATEGORY_ICONS[selectedTemplate.key]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedTemplate.name}交付清单</h3>
                <p className="text-sm text-slate-500">{selectedTemplate.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedTemplate.checklist.map((item: { id: string; label: string; description?: string; required: boolean }, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    item.required
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  {item.required ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  {!item.required && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">可选</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-700">
                <strong>使用说明：</strong>卖家在交付时可根据此清单逐项确认，确保所有必要交付物完整提交。勾选已完成项目后，系统会自动计算完成进度。
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 未选择提示 */}
      {!selectedTemplate && (
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">点击上方品类卡片查看详细交付清单</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">开始使用交付模板</h3>
          <p className="text-slate-600 mb-8">注册后即可在交付报告中使用品类化交付模板，规范化每一次交付</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            立即注册
          </Link>
        </div>
      </section>
    </div>
  );
}
