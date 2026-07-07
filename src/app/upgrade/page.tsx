/**
 * @file 服务计划中心
 * @description
 * 展示三种服务计划对比（测试版/普通版/完整版），
 * 已登录用户可上传头像、查看当前计划、升级（联系客服弹窗）。
 * 无在线支付，升级通过联系客服完成。
 *
 * 路由：/upgrade
 * API：GET /api/auth/me，POST /api/auth/avatar，POST /api/upgrade
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface UserInfo {
  userId: string;
  role: string;
  nickname?: string;
  membership_level?: string;
  avatar_url?: string | null;
}

const PLANS = [
  {
    key: 'free',
    name: '测试版',
    features: [
      { text: '最多创建5个服务单', included: true },
      { text: '基础进度条', included: true },
      { text: '买家查询与审核', included: true },
      { text: '导出审核记录', included: false },
      { text: 'AI检测报告', included: false },
    ],
    color: 'bg-stone-100',
    badge: '',
  },
  {
    key: 'pro',
    name: '普通版',
    features: [
      { text: '无限服务单', included: true },
      { text: '基础进度条', included: true },
      { text: '买家查询与审核', included: true },
      { text: '导出审核记录', included: true },
      { text: 'AI检测报告', included: true },
    ],
    color: 'bg-indigo-50',
    badge: '推荐',
  },
  {
    key: 'flagship',
    name: '完整版',
    features: [
      { text: '无限服务单', included: true },
      { text: '基础进度条', included: true },
      { text: '买家查询与审核', included: true },
      { text: '导出审核记录', included: true },
      { text: 'AI检测报告', included: true },
    ],
    color: 'bg-indigo-100',
    badge: '全部功能',
  },
];

export default function UpgradePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [payPlan, setPayPlan] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setUser(prev => prev ? { ...prev, avatar_url: data.avatarUrl } : prev);
      } else {
        alert(data.error || '上传失败');
      }
    } catch {
      alert('上传失败，请重试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const handleUpgrade = (planKey: string) => {
    if (!user) {
      window.location.href = '/';
      return;
    }
    if (user.membership_level === planKey) return;
    if (planKey === 'free') return;
    setPayPlan(planKey);
    setShowPay(true);
  };

  const currentLevel = user?.membership_level || 'free';

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* 个人信息 + 头像上传 */}
        {user && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 card-gradient-subtle">
            <div className="relative group">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="头像" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700">
                  {(user.nickname || '用')[0]}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-stone-800">{user.nickname || '用户'}</p>
              <p className="text-sm text-stone-500">
                服务计划：{PLANS.find((p) => p.key === (user.membership_level || 'free'))?.name || '测试版'}
              </p>
              <p className="text-xs text-stone-400 mt-1">悬停头像可更换照片</p>
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-indigo-900">选择适合你的方案</h2>
          <p className="text-stone-500 mt-2">升级解锁更多功能，让服务交付更专业</p>
          {user && (
            <Badge className="mt-3 bg-indigo-100 text-indigo-800 border-0">
              当前：{PLANS.find((p) => p.key === currentLevel)?.name || '测试版'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.key}
              className={`border-0 shadow-lg relative overflow-hidden card-gradient-subtle ${
                currentLevel === plan.key ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-indigo-800">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className={feat.included ? 'text-emerald-600' : 'text-stone-300'}>
                        {feat.included ? '✓' : '✗'}
                      </span>
                      <span className={feat.included ? 'text-stone-700' : 'text-stone-400 line-through'}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {plan.key === 'free' ? (
                  <Button variant="outline" className="w-full" disabled>
                    基础方案
                  </Button>
                ) : currentLevel === plan.key ? (
                  <Button variant="outline" className="w-full" disabled>
                    当前方案
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleUpgrade(plan.key)}
                  >
                    升级服务计划
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          * 如需升级普通版或完整版，请联系客服获取开通方式
        </p>
      </main>

      {/* Contact Customer Service Dialog */}
      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">升级服务计划</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-base text-stone-700 leading-relaxed">
              如需升级<strong>{PLANS.find((p) => p.key === payPlan)?.name}</strong>，请联系客服获取开通方式。
            </p>
            <p className="text-sm text-stone-500 mt-2">
              管理员将在后台为您手动开通权限。
            </p>
          </div>
          <Button onClick={() => setShowPay(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            我知道了
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
