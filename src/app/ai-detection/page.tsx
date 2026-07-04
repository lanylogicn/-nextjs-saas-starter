/**
 * @file AI检测报告功能详情页
 * @description 展示AI检测报告功能的详细说明、检测维度、使用示例
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, FileText, Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIDetectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">AI检测报告</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-6">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">P0新功能 · 免费开放</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            智能AI原创性检测
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            基于多维度文本分析，为交付物提供AI生成内容检测，确保原创性可验证
          </p>
        </div>
      </section>

      {/* 检测维度 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">五大检测维度</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '词汇多样性',
                desc: '分析用词丰富度，检测是否存在重复、机械化的表达模式',
                icon: <FileText className="w-6 h-6" />,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: '句式复杂度',
                desc: '评估句子结构变化，识别AI常见的简单句式特征',
                icon: <Zap className="w-6 h-6" />,
                color: 'from-violet-500 to-purple-500',
              },
              {
                title: '个性化表达',
                desc: '检测文本中的个性化用语和独特表达习惯',
                icon: <Shield className="w-6 h-6" />,
                color: 'from-emerald-500 to-teal-500',
              },
              {
                title: '结构完整性',
                desc: '分析文章结构逻辑，判断是否符合人类写作习惯',
                icon: <Brain className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
              },
              {
                title: '格式规范',
                desc: '检查排版格式、标点使用等细节规范程度',
                icon: <CheckCircle2 className="w-6 h-6" />,
                color: 'from-rose-500 to-pink-500',
              },
            ].map((item) => (
              <div key={item.title} className="group p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 检测结果示例 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">检测结果示例</h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {/* 状态 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">检测通过</p>
                <p className="text-sm text-slate-500">该文本大概率为人工原创</p>
              </div>
            </div>

            {/* 核心指标 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">18%</p>
                <p className="text-xs text-slate-500 mt-1">AIGC疑似度</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">30%</p>
                <p className="text-xs text-slate-500 mt-1">模板套用</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-violet-600">85分</p>
                <p className="text-xs text-slate-500 mt-1">质量评分</p>
              </div>
            </div>

            {/* 维度评分 */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">维度评分详情</h4>
              {[
                { name: '词汇多样性', score: 92, desc: '用词丰富，表达多样' },
                { name: '句式复杂度', score: 78, desc: '句式变化较为自然' },
                { name: '个性化表达', score: 88, desc: '表达个性化强' },
                { name: '结构完整性', score: 85, desc: '结构清晰完整' },
                { name: '格式规范', score: 90, desc: '格式规范良好' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-24 shrink-0">{item.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-12 text-right">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 使用说明 */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">如何使用</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: '完成订单交付', desc: '在订单进度推进到"确认完成"后，系统自动生成检测' },
              { step: 2, title: '查看检测报告', desc: '在交付报告页面查看AI检测结果，包含详细维度评分' },
              { step: 3, title: '分享给买家', desc: '检测报告随交付报告一并展示，增强买家信任' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">开始使用AI检测</h3>
          <p className="text-slate-600 mb-8">注册即可免费使用AI检测报告功能，为每一次交付增添信任保障</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              立即注册
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
