/**
 * @file 版权声明模块功能页
 * @description 展示版权声明功能的详细说明和示例
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Scale, Lock, CheckCircle2 } from 'lucide-react';

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">版权声明模块</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-6">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">P0新功能 · 免费开放</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            专业版权声明
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            为每一份交付物附带正式版权声明，明确版权归属与使用范围，保护创作者权益
          </p>
        </div>
      </section>

      {/* 声明内容 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">声明包含内容</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: '原创性声明',
                desc: '明确声明交付物为原创或合法授权，不存在抄袭、侵权等问题',
                icon: <FileText className="w-6 h-6" />,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: '版权归属',
                desc: '清晰界定交付物的版权归属方，避免后续纠纷',
                icon: <Scale className="w-6 h-6" />,
                color: 'from-violet-500 to-purple-500',
              },
              {
                title: '使用范围',
                desc: '明确交付物的使用场景、期限、地域等限制条件',
                icon: <Lock className="w-6 h-6" />,
                color: 'from-emerald-500 to-teal-500',
              },
              {
                title: '授权方式',
                desc: '支持多种授权协议：保留所有权利、CC协议、公共领域等',
                icon: <Shield className="w-6 h-6" />,
                color: 'from-orange-500 to-amber-500',
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

      {/* 授权方式 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">支持的授权方式</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: '保留所有权利', desc: '最严格的版权保护，未经许可不得使用', strict: true },
              { name: 'CC BY', desc: '署名即可自由使用', strict: false },
              { name: 'CC BY-NC', desc: '署名且非商业用途', strict: false },
              { name: 'CC BY-SA', desc: '署名且相同方式共享', strict: false },
              { name: '公共领域', desc: '放弃所有权利，自由使用', strict: false },
              { name: '自定义', desc: '根据实际情况自定义条款', strict: false },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  {item.strict ? (
                    <Lock className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <h4 className="font-semibold text-slate-800">{item.name}</h4>
                </div>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 示例 */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-10">版权声明示例</h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h4 className="text-lg font-bold text-slate-800">版权声明</h4>
              <p className="text-sm text-slate-500 mt-1">公证编号：YN-20240101-001</p>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h5 className="font-semibold text-slate-800 mb-1">一、原创性声明</h5>
                <p>本交付物为创作者独立完成，不存在抄袭、盗用他人作品等侵权行为。如有引用，均已注明出处并获得合法授权。</p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-1">二、版权归属</h5>
                <p>本交付物的版权归<strong>委托方</strong>所有。自交付完成之日起，委托方享有完整的著作权及相关权益。</p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-1">三、使用范围</h5>
                <p>委托方可在<strong>全球范围内</strong>、<strong>永久</strong>使用本交付物，包括但不限于复制、发行、展示、改编等。</p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-800 mb-1">四、授权方式</h5>
                <p>本交付物采用<strong>保留所有权利</strong>的授权方式，未经版权方书面许可，第三方不得使用。</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>声明日期：2024年1月1日</span>
              <span>奕诺·存证平台</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">开始使用版权声明</h3>
          <p className="text-slate-600 mb-8">注册后即可在交付报告中添加版权声明，保护您的创作权益</p>
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
