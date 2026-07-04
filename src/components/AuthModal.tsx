'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, X, Phone, Lock, User, Shield, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function PasswordInput({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder || '密码'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function AuthModal() {
  const { user, login, register, refresh } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'admin'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({ emailOrPhone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ phone: '', email: '', password: '', nickname: '', verificationCode: '' });
  const [registerAvatar, setRegisterAvatar] = useState<string | null>(null);
  const [registerAvatarPreview, setRegisterAvatarPreview] = useState<string | null>(null);
  const [forgotForm, setForgotForm] = useState({ phone: '', verificationCode: '', newPassword: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [cooldown, setCooldown] = useState(0);

  // Listen for open-auth events from Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setView(detail?.view || 'login');
      setError('');
      setRegisterAvatar(null);
      setRegisterAvatarPreview(null);
      setOpen(true);
    };
    window.addEventListener('open-auth', handler);
    return () => window.removeEventListener('open-auth', handler);
  }, []);

  // Close when logged in
  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendCode = async (phone: string) => {
    if (!phone || !/^1\d{10}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }
    if (cooldown > 0) return;
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCooldown(60);
        setError('');
      } else {
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误');
    }
  };

  const handleLogin = async () => {
    if (!loginForm.emailOrPhone || !loginForm.password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(loginForm.emailOrPhone, loginForm.password);
    setLoading(false);
    if (!result.success) setError(result.error || '登录失败');
  };

  const handleRegister = async () => {
    if (!registerForm.phone || !registerForm.verificationCode || !registerForm.password || !registerForm.nickname) {
      setError('请填写完整信息');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register({
      phone: registerForm.phone,
      email: registerForm.email || undefined,
      password: registerForm.password,
      nickname: registerForm.nickname,
      verificationCode: registerForm.verificationCode,
      avatar_url: registerAvatar || undefined,
    });
    setLoading(false);
    if (!result.success) setError(result.error || '注册失败');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('仅支持 JPG/PNG/GIF/WebP 格式');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过 2MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRegisterAvatar(dataUrl);
      setRegisterAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setRegisterAvatar(null);
    setRegisterAvatarPreview(null);
  };

  const handleForgot = async () => {
    if (!forgotForm.phone || !forgotForm.verificationCode) {
      setError('请填写手机号和验证码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm),
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        setOpen(false);
      } else {
        setError(data.error || '操作失败');
      }
    } catch {
      setError('网络错误');
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (!adminForm.username || !adminForm.password) {
      setError('请输入管理员账号和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        setOpen(false);
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">
            {view === 'login' ? '登录奕諾' : view === 'register' ? '注册账号' : view === 'forgot' ? '找回密码' : '管理员登录'}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            {view === 'login' ? '欢迎回来，继续管理您的服务' : view === 'register' ? '创建账号，开始使用奕諾' : view === 'forgot' ? '通过手机验证码重置密码' : '管理员专属入口'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}

          {view === 'login' && (
            <>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="手机号/邮箱"
                  value={loginForm.emailOrPhone}
                  onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <PasswordInput
                  value={loginForm.password}
                  onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                  className="[&_input]:pl-10"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => { setView('forgot'); setError(''); }}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  忘记密码？
                </button>
                <button
                  onClick={() => { setView('admin'); setError(''); }}
                  className="text-stone-400 hover:text-stone-600 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  管理员
                </button>
              </div>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
              <p className="text-center text-sm text-stone-500">
                还没有账号？
                <button onClick={() => { setView('register'); setError(''); }} className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                  立即注册
                </button>
              </p>
            </>
          )}

          {view === 'register' && (
            <>
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-500">
                    {registerAvatarPreview ? (
                      <img src={registerAvatarPreview} alt="头像预览" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-indigo-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                  {registerAvatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-stone-400">上传头像（可选）</span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="昵称"
                  value={registerForm.nickname}
                  onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    placeholder="手机号"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSendCode(registerForm.phone)}
                  disabled={cooldown > 0}
                  className="shrink-0 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                >
                  {cooldown > 0 ? `${cooldown}s` : '获取验证码'}
                </Button>
              </div>
              <Input
                placeholder="验证码（测试模式：123456）"
                value={registerForm.verificationCode}
                onChange={(e) => setRegisterForm({ ...registerForm, verificationCode: e.target.value })}
                maxLength={6}
              />
              <PasswordInput
                value={registerForm.password}
                onChange={(v) => setRegisterForm({ ...registerForm, password: v })}
                placeholder="密码（至少6位）"
              />
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? '注册中...' : '注册'}
              </Button>
              <p className="text-center text-sm text-stone-500">
                已有账号？
                <button onClick={() => { setView('login'); setError(''); }} className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                  去登录
                </button>
              </p>
            </>
          )}

          {view === 'forgot' && (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    placeholder="手机号"
                    value={forgotForm.phone}
                    onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSendCode(forgotForm.phone)}
                  disabled={cooldown > 0}
                  className="shrink-0 text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                >
                  {cooldown > 0 ? `${cooldown}s` : '获取验证码'}
                </Button>
              </div>
              <Input
                placeholder="验证码（测试模式：123456）"
                value={forgotForm.verificationCode}
                onChange={(e) => setForgotForm({ ...forgotForm, verificationCode: e.target.value })}
                maxLength={6}
              />
              <PasswordInput
                value={forgotForm.newPassword}
                onChange={(v) => setForgotForm({ ...forgotForm, newPassword: v })}
                placeholder="新密码（可选，留空则不修改）"
              />
              <Button
                onClick={handleForgot}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? '验证中...' : '验证并登录'}
              </Button>
              <p className="text-center text-sm text-stone-500">
                <button onClick={() => { setView('login'); setError(''); }} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  返回登录
                </button>
              </p>
            </>
          )}

          {view === 'admin' && (
            <>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="管理员账号"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <PasswordInput
                  value={adminForm.password}
                  onChange={(v) => setAdminForm({ ...adminForm, password: v })}
                  className="[&_input]:pl-10"
                />
              </div>
              <Button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? '登录中...' : '管理员登录'}
              </Button>
              <p className="text-center text-sm text-stone-500">
                <button onClick={() => { setView('login'); setError(''); }} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  返回用户登录
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
