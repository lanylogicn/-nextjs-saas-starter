/**
 * @file 管理员后台
 * @description
 * 奕诺后台管理系统，包含11个功能模块：
 * 1. 仪表盘 — 用户/订单/活跃度统计
 * 2. 用户管理 — 查看/冻结/解冻/升级/降级/设置到期时间
 * 3. 订单管理 — 查看/强制推进/回退/备注/删除
 * 4. 系统配置 — 最大单数/开关/联系方式等
 * 5. 买家高级功能 — 为买家开通/关闭高级功能
 * 6. 卖家高级功能 — 管理7个功能开关 + 为卖家授权
 * 7. 联系我们 — 配置联系信息
 * 8. 问卷管理 — CRUD题目/查看回复/统计/导出
 * 9. 公告管理 — 发布/编辑/删除/推送公告
 * 10. 操作日志 — 查看所有管理员操作记录
 * 11. 代码文档 — 在线浏览项目文档/文件注释/下载文档
 *
 * 认证：管理员独立登录（POST /api/admin/login），httpOnly cookie 存储 admin_token
 * 默认账号：admin / St86330068
 *
 * 路由：/admin
 * API：/api/admin/*
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings,
  Phone, ClipboardList, Megaphone, ScrollText, LogOut, Shield,
  Eye, EyeOff, Menu, X, ChevronRight, Wrench, ToggleLeft, ToggleRight, BookOpen, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

// ─── Constants & Types ───────────────────────────────────────

const NODE_LABELS: Record<number, string> = {
  1: '订单接收', 2: '需求梳理', 3: '制作中', 4: '初稿完成，等待审核',
  5: '审核通过，终稿输出', 6: '终稿已交付', 7: '确认完成',
};

interface AdminUser {
  id: string; phone: string; email: string; nickname: string;
  membership_level: string; membership_expires_at: string; is_frozen: boolean; created_at: string;
}
interface AdminOrder {
  id: string; order_no: string; buyer_nickname: string; service_type: string;
  service_content: string; current_node: number; created_at: string;
  users: { nickname: string; email: string; phone: string } | null;
}
interface OpLog { id: string; admin_id: string; action: string; detail: string; created_at: string; }
interface Announcement { id: string; title: string; content: string; created_at: string; }
interface ConfigItem { id: string; config_key: string; config_value: string; }
type AdminModule = 'dashboard' | 'users' | 'orders' | 'config' | 'contact' | 'survey' | 'announcements' | 'logs' | 'buyer-addons' | 'seller-features' | 'docs';

const NAV_ITEMS: { key: AdminModule; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { key: 'users', label: '用户管理', icon: Users },
  { key: 'orders', label: '订单管理', icon: FileText },
  { key: 'config', label: '系统配置', icon: Settings },
  { key: 'buyer-addons', label: '买家高级功能', icon: Shield },
  { key: 'seller-features', label: '卖家高级功能', icon: Wrench },
  { key: 'contact', label: '联系我们', icon: Phone },
  { key: 'survey', label: '问卷管理', icon: ClipboardList },
  { key: 'announcements', label: '公告管理', icon: Megaphone },
  { key: 'logs', label: '操作日志', icon: ScrollText },
  { key: 'docs', label: '代码文档', icon: BookOpen },
];

// ─── MarkdownContent (简易 Markdown 渲染) ─────────────────────

function MarkdownContent({ content }: { content: string }) {
  // 简易 Markdown → HTML 转换，支持标题/代码块/表格/列表/粗体/行内代码
  const html = React.useMemo(() => {
    let result = content;
    // 转义 HTML 特殊字符（先保护代码块内容）
    const codeBlocks: string[] = [];
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
      codeBlocks.push(`<pre class="bg-slate-800 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed my-3"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
      return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });
    // 行内代码
    result = result.replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    // 标题
    result = result.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-stone-800 mt-5 mb-2">$1</h3>');
    result = result.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-stone-800 mt-6 mb-3 border-b border-stone-200 pb-2">$1</h2>');
    result = result.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-indigo-800 mt-6 mb-3">$1</h1>');
    // 粗体
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-stone-800">$1</strong>');
    // 水平线
    result = result.replace(/^---$/gm, '<hr class="border-stone-200 my-4" />');
    // 无序列表
    result = result.replace(/^- (.+)$/gm, '<li class="text-sm text-stone-600 ml-4 list-disc">$1</li>');
    // 表格（简易处理）
    result = result.replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter((c: string) => c.trim());
      if (cells.every((c: string) => c.trim().match(/^[-:]+$/))) return ''; // 分隔行
      const isHeader = false;
      const tag = isHeader ? 'th' : 'td';
      return `<tr class="border-b border-stone-100">${cells.map((c: string) => `<${tag} class="px-3 py-2 text-sm text-stone-600">${c.trim()}</${tag}>`).join('')}</tr>`;
    });
    // 段落（连续非空行）
    result = result.replace(/\n\n/g, '<br/><br/>');
    // 换行
    result = result.replace(/\n/g, '<br/>');
    // 恢复代码块
    codeBlocks.forEach((block, idx) => {
      result = result.replace(`%%CODEBLOCK_${idx}%%`, block);
    });
    return result;
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── PasswordInput ───────────────────────────────────────────

function PasswordInput({ id, placeholder, value, onChange, className }: {
  id?: string; placeholder?: string; value: string; onChange: (v: string) => void; className?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-1">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pr-10 ${className || ''}`}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? '隐藏密码' : '显示密码'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function AdminPage() {
  // Auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ phone: '', verificationCode: '' });
  const [loginError, setLoginError] = useState('');
  const [codeCooldown, setCodeCooldown] = useState(0);

  // Navigation
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dashStats, setDashStats] = useState({ pendingOrders: 0, weeklyNewUsers: 0, avgProcessDays: 0, activeSellers: 0 });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [opLogs, setOpLogs] = useState<OpLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [contactConfig, setContactConfig] = useState({ phone: '', email: '', work_hours: '' });
  const [surveyQuestions, setSurveyQuestions] = useState<Array<{ id: string; question_text: string; question_type: string; options: string[] | null; is_required: boolean; sort_order: number; is_active: boolean }>>([]);
  const [surveyResponses, setSurveyResponses] = useState<Array<{ id: string; user_id: string | null; answers: Record<string, string | string[]>; submitted_at: string }>>([]);
  const [surveyStats, setSurveyStats] = useState<Record<string, Record<string, number>> | null>(null);

  // Dialogs
  const [forceOrderId, setForceOrderId] = useState('');
  const [forceAction, setForceAction] = useState('force_advance');
  const [forceNote, setForceNote] = useState('');
  const [forceDialogOpen, setForceDialogOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPushTo, setAnnPushTo] = useState('none');
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Record<string, string>>({});
  const [editingQuestion, setEditingQuestion] = useState<{ id?: string; question_text: string; question_type: string; options: string[]; is_required: boolean; sort_order: number } | null>(null);
  const [buyerAddonPerms, setBuyerAddonPerms] = useState<Array<{ id: string; user_id: string; addon_type: string; expires_at: string | null; created_at: string; users?: { nickname: string | null; phone: string | null } | null }>>([]);
  const [buyerAddonUsers, setBuyerAddonUsers] = useState<Array<{ id: string; nickname: string | null; phone: string | null }>>([]);
  const [grantAddonForm, setGrantAddonForm] = useState({ user_id: '', addon_type: 'urgent_review', expires_at: '' });
  // 卖家高级功能
  const [sellerFeatures, setSellerFeatures] = useState<Array<{ id: string; feature_key: string; feature_name: string; description: string | null; min_level: string; is_enabled: boolean; sort_order: number }>>([]);
  const [sellerFeatureGrants, setSellerFeatureGrants] = useState<Array<{ id: string; user_id: string; feature_key: string; expires_at: string | null; created_at: string; users?: { nickname: string | null; phone: string | null } | null }>>([]);
  const [editFeature, setEditFeature] = useState<{ id?: string; feature_key: string; feature_name: string; description: string; min_level: string; is_enabled: boolean; sort_order: number } | null>(null);
  const [grantFeatureForm, setGrantFeatureForm] = useState({ user_id: '', feature_key: '', expires_at: '' });
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [foundSeller, setFoundSeller] = useState<{ id: string; nickname: string; phone?: string; email?: string; membership_level: string; seller_id: string; frozen: boolean } | null>(null);
  const [searchingSeller, setSearchingSeller] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    totalUsers: number; todayNewUsers: number; weekNewUsers: number;
    totalOrders: number; todayOrders: number; pendingOrders: number;
    avgProcessingHours: number; activeSellers: number; testUsers: number;
  }>({ totalUsers: 0, todayNewUsers: 0, weekNewUsers: 0, totalOrders: 0, todayOrders: 0, pendingOrders: 0, avgProcessingHours: 0, activeSellers: 0, testUsers: 0 });
  // 代码文档
  const [docsData, setDocsData] = useState<{
    overview?: { title: string; content: string };
    directory?: { title: string; content: string };
    modules?: { title: string; content: string };
    apiDocs?: { title: string; content: string };
    guide?: { title: string; content: string };
    tutorial?: { title: string; content: string };
    detailedGuide?: { title: string; content: string };
    quickRef?: { title: string; content: string };
    files?: { title: string; sections: Array<{ name: string; items: Array<{ path: string; desc: string; deps?: string; method?: string }> }> };
  } | null>(null);
  const [docsTab, setDocsTab] = useState<'overview' | 'directory' | 'modules' | 'api' | 'guide' | 'tutorial' | 'detailedGuide' | 'quickRef' | 'files'>('overview');
  const [docsFileSection, setDocsFileSection] = useState(0);


  // ─── Auth ────────────────────────────────────────────────

  // ─── Data Loaders ──────────────────────────────────────────

  const loadBuyerAddons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/buyer-addons');
      if (res.ok) {
        const data = await res.json();
        setBuyerAddonPerms(data.permissions || []);
        setBuyerAddonUsers(data.users || []);
      }
    } catch { /* ignore */ }
  }, []);

  const loadSellerFeatures = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seller-features');
      if (res.ok) setSellerFeatures(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadSellerFeatureGrants = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seller-features/grants');
      if (res.ok) setSellerFeatureGrants(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/docs');
      if (res.ok) {
        const data = await res.json();
        setDocsData(data.docs);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === 'admin') setLoggedIn(true);
        }
      } catch { /* not logged in */ }
      setAuthLoading(false);
    };
    check();
  }, []);

  useEffect(() => {
    if (codeCooldown <= 0) return;
    const t = setTimeout(() => setCodeCooldown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [codeCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) setLoggedIn(true);
      else setLoginError(data.error || '登录失败');
    } catch { setLoginError('网络错误'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedIn(false);
    setAuthView('login');
  };

  const handleAdminForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotForm),
      });
      const data = await res.json();
      if (data.success) { setLoggedIn(true); setForgotForm({ phone: '', verificationCode: '' }); }
      else setLoginError(data.error || '验证失败');
    } catch { setLoginError('网络错误'); }
  };

  const sendAdminCode = async () => {
    if (!forgotForm.phone) { setLoginError('请输入手机号'); return; }
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotForm.phone }),
      });
      const data = await res.json();
      if (data.success) setCodeCooldown(data.cooldown || 60);
      else { if (data.cooldown) setCodeCooldown(data.cooldown); setLoginError(data.error || '发送失败'); }
    } catch { setLoginError('网络错误'); }
  };

  // ─── Data Fetching ───────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
  }, []);
  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/admin/orders');
    if (res.ok) { const d = await res.json(); setOrders(d.orders || []); }
  }, []);
  const fetchLogs = useCallback(async () => {
    const res = await fetch('/api/admin/operation-logs');
    if (res.ok) { const d = await res.json(); setOpLogs(d.logs || []); }
  }, []);
  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch('/api/admin/announcements');
    if (res.ok) { const d = await res.json(); setAnnouncements(d.announcements || []); }
  }, []);
  const fetchConfigs = useCallback(async () => {
    const res = await fetch('/api/admin/config');
    if (res.ok) {
      const d = await res.json();
      setConfigs(d.configs || []);
      const m: Record<string, string> = {};
      (d.configs || []).forEach((c: ConfigItem) => { m[c.config_key] = c.config_value; });
      setEditingConfig(m);
    }
  }, []);
  const fetchDashboard = useCallback(async () => {
    const res = await fetch('/api/admin/dashboard');
    if (res.ok) { const d = await res.json(); setDashboardStats(d); }
  }, []);
  const fetchContactConfig = useCallback(async () => {
    const res = await fetch('/api/contact');
    if (res.ok) { const d = await res.json(); setContactConfig(d); }
  }, []);
  const fetchSurveyData = useCallback(async () => {
    const [qRes, rRes] = await Promise.all([
      fetch('/api/survey'),
      fetch('/api/admin/survey/responses'),
    ]);
    if (qRes.ok) { const d = await qRes.json(); setSurveyQuestions(d.questions || d || []); }
    if (rRes.ok) { const d = await rRes.json(); setSurveyResponses(d.responses || []); }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    fetchUsers(); fetchOrders(); fetchLogs(); fetchAnnouncements();
    fetchConfigs(); fetchDashboard(); fetchContactConfig(); fetchSurveyData(); loadBuyerAddons(); loadSellerFeatures(); loadSellerFeatureGrants();
  }, [loggedIn, fetchUsers, fetchOrders, fetchLogs, fetchAnnouncements, fetchConfigs, fetchDashboard, fetchContactConfig, fetchSurveyData, loadBuyerAddons]);

  // 代码文档按需加载
  useEffect(() => {
    if (loggedIn && activeModule === 'docs' && !docsData) loadDocs();
  }, [loggedIn, activeModule, docsData, loadDocs]);

  // ─── Actions ─────────────────────────────────────────────

  const handleToggleFreeze = async (userId: string, currentFrozen: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_frozen: !currentFrozen }),
    });
    fetchUsers();
  };
  const handleChangeMembership = async (userId: string, level: string, expiresAt?: string) => {
    const body: Record<string, unknown> = { membership_level: level };
    if (expiresAt !== undefined) body.membership_expires_at = expiresAt || null;
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    fetchUsers();
  };
  const handleForceProgress = async () => {
    await fetch(`/api/admin/orders/${forceOrderId}/force-progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: forceAction, note: forceNote || undefined }),
    });
    setForceDialogOpen(false); setForceOrderId(''); setForceNote('');
    fetchOrders(); fetchLogs();
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('确认删除此订单？')) return;
    await fetch(`/api/admin/orders/${orderId}/delete`, { method: 'POST' });
    fetchOrders(); fetchLogs();
  };
  const handleAddNote = async (orderId: string) => {
    const note = prompt('请输入管理员备注：');
    if (!note) return;
    await fetch(`/api/admin/orders/${orderId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: note }),
    });
    fetchLogs();
  };
  const handleCreateAnnouncement = async () => {
    await fetch('/api/admin/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: annTitle, content: annContent, push_to: annPushTo }),
    });
    setAnnDialogOpen(false); setAnnTitle(''); setAnnContent(''); setAnnPushTo('none');
    fetchAnnouncements(); fetchLogs();
  };
  const handleSaveConfig = async () => {
    const updates = Object.entries(editingConfig)
      .filter(([key]) => key !== 'admin_password_hash')
      .map(([key, value]) => ({ key, value }));
    await fetch('/api/admin/config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: updates }),
    });
    fetchConfigs(); fetchLogs(); alert('配置已保存');
  };
  const handleSaveContact = async () => {
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactConfig),
      });
      if (res.ok) alert('联系信息已保存');
    } catch { alert('保存失败'); }
  };
  const handleSaveQuestion = async (q: { id?: string; question_text: string; question_type: string; options: string[]; is_required: boolean; sort_order: number }) => {
    try {
      const url = q.id ? `/api/admin/survey/questions/${q.id}` : '/api/admin/survey/questions';
      const method = q.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) });
      if (res.ok) { const data = await res.json(); setSurveyQuestions(data.questions || surveyQuestions); setEditingQuestion(null); }
    } catch { alert('保存失败'); }
  };
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('确定删除此问题？')) return;
    try {
      const res = await fetch(`/api/admin/survey/questions/${id}`, { method: 'DELETE' });
      if (res.ok) setSurveyQuestions(surveyQuestions.filter((q) => q.id !== id));
    } catch { alert('删除失败'); }
  };
  const handleAddQuestion = () => {
    setEditingQuestion({ question_text: '', question_type: 'single_choice', options: [''], is_required: true, sort_order: surveyQuestions.length + 1 });
  };
  const handleToggleQuestion = async (q: { id: string; is_active: boolean; [key: string]: unknown }) => {
    try {
      const res = await fetch(`/api/admin/survey/questions/${q.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...q, is_active: !q.is_active }),
      });
      if (res.ok) { const data = await res.json(); setSurveyQuestions(data.questions || surveyQuestions); }
    } catch { alert('操作失败'); }
  };
  const loadSurveyStats = async () => {
    try {
      const res = await fetch('/api/admin/survey/responses');
      if (res.ok) {
        const data = await res.json();
        const responses: Array<{ answers: Record<string, string | string[]> }> = data.responses || [];
        const s: Record<string, Record<string, number>> = {};
        responses.forEach(r => {
          Object.entries(r.answers).forEach(([question, answer]) => {
            if (!s[question]) s[question] = {};
            const arr = Array.isArray(answer) ? answer : [answer];
            arr.forEach(a => { const key = String(a); s[question][key] = (s[question][key] || 0) + 1; });
          });
        });
        setSurveyStats(s);
      }
    } catch { alert('加载统计失败'); }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleExportSurvey = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const respData = surveyResponses.map((r: any) => {
      const row: Record<string, string> = { '提交ID': r.id, '用户ID': r.user_id || '匿名', '提交时间': r.submitted_at };
      Object.entries(r.answers as Record<string, string | string[]>).forEach(([k, v]) => { row[k] = Array.isArray(v) ? v.join(', ') : v; });
      return row;
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(respData), '问卷回复');
    XLSX.writeFile(wb, `奕諾问卷_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── Buyer Addon Management ────────────────────────────────

  const handleGrantAddon = async () => {
    if (!grantAddonForm.user_id || !grantAddonForm.addon_type) {
      alert('请选择用户和功能类型');
      return;
    }
    try {
      const res = await fetch('/api/admin/buyer-addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grantAddonForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('权限已开通');
        setGrantAddonForm({ user_id: '', addon_type: 'urgent_review', expires_at: '' });
        loadBuyerAddons();
      } else {
        alert(data.error || '开通失败');
      }
    } catch { alert('操作失败'); }
  };

  const handleRevokeAddon = async (id: string) => {
    if (!confirm('确定关闭此权限？')) return;
    try {
      const res = await fetch(`/api/admin/buyer-addons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('权限已关闭');
        loadBuyerAddons();
      } else {
        alert(data.error || '关闭失败');
      }
    } catch { alert('操作失败'); }
  };

  const ADDON_TYPE_LABELS: Record<string, string> = {
    urgent_review: '优先审核',
    delivery_cert: '专业交付报告',
    share_card: '进度卡片生成',
  };

  const LEVEL_LABELS: Record<string, string> = { pro: '普通版', flagship: '完整版' };

  const handleUpdateFeature = async (featureKey: string, field: string, value: string | boolean) => {
    try {
      const res = await fetch('/api/admin/seller-features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_key: featureKey, [field]: value }),
      });
      const data = await res.json();
      if (data.success) { loadSellerFeatures(); } else { alert(data.error || '更新失败'); }
    } catch { alert('操作失败'); }
  };

  const handleSearchSeller = async () => {
    if (!sellerSearchQuery.trim()) { alert('请输入卖家ID'); return; }
    setSearchingSeller(true);
    try {
      const res = await fetch(`/api/admin/users/search?seller_id=${encodeURIComponent(sellerSearchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.user) {
        setFoundSeller(data.user);
        setGrantFeatureForm(prev => ({ ...prev, user_id: data.user.id }));
      } else {
        setFoundSeller(null);
        setGrantFeatureForm(prev => ({ ...prev, user_id: '' }));
        alert(data.error || '未找到该卖家');
      }
    } catch { alert('搜索失败'); }
    finally { setSearchingSeller(false); }
  };

  const handleGrantSellerFeature = async () => {
    if (!grantFeatureForm.user_id || !grantFeatureForm.feature_key) { alert('请先搜索并选择卖家，再选择功能'); return; }
    try {
      const res = await fetch('/api/admin/seller-features/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grantFeatureForm),
      });
      const data = await res.json();
      if (data.success) { setGrantFeatureForm({ user_id: '', feature_key: '', expires_at: '' }); setFoundSeller(null); setSellerSearchQuery(''); loadSellerFeatureGrants(); alert('功能已开通'); }
      else { alert(data.error || '开通失败'); }
    } catch { alert('操作失败'); }
  };

  const handleRevokeSellerFeature = async (grantId: string) => {
    if (!confirm('确定关闭此功能？')) return;
    try {
      const res = await fetch(`/api/admin/seller-features/grants?id=${grantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { loadSellerFeatureGrants(); alert('功能已关闭'); }
      else { alert(data.error || '关闭失败'); }
    } catch { alert('操作失败'); }
  };

  // ─── Login Page ──────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-stone-100">
        <div className="animate-pulse text-stone-400">加载中...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-stone-100">
        <Card className="w-full max-w-sm shadow-lg border-0">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-6 py-5 rounded-t-xl">
            <h1 className="text-xl font-bold text-white">
              {authView === 'login' ? '管理员登录' : '管理员密码找回'}
            </h1>
            <p className="text-indigo-100 text-sm mt-1">奕諾 · 后台管理系统</p>
          </div>
          <CardContent className="pt-6">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{loginError}</div>
            )}
            {authView === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>账号</Label>
                  <Input placeholder="管理员账号" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>密码</Label>
                  <PasswordInput placeholder="密码" value={loginForm.password} onChange={(v) => setLoginForm({ ...loginForm, password: v })} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">登录</Button>
                <p className="text-center text-sm text-stone-500">
                  <button type="button" onClick={() => { setAuthView('forgot'); setLoginError(''); setCodeCooldown(0); }} className="text-indigo-600 hover:underline">
                    忘记密码？
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleAdminForgot} className="space-y-4">
                <div>
                  <Label>管理员绑定手机号</Label>
                  <Input placeholder="管理员绑定的手机号" value={forgotForm.phone} onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>验证码</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="6位验证码" value={forgotForm.verificationCode} onChange={(e) => setForgotForm({ ...forgotForm, verificationCode: e.target.value })} maxLength={6} className="flex-1" />
                    <Button type="button" variant="outline" disabled={codeCooldown > 0 || !forgotForm.phone} onClick={sendAdminCode} className="shrink-0 min-w-[100px] text-indigo-700 border-indigo-300 hover:bg-indigo-50">
                      {codeCooldown > 0 ? `${codeCooldown}s` : '获取验证码'}
                    </Button>
                  </div>
                  <p className="text-xs text-indigo-600 mt-1">测试模式验证码：123456</p>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">验证并登录</Button>
                <p className="text-center text-sm text-stone-500">
                  <button type="button" onClick={() => { setAuthView('login'); setLoginError(''); }} className="text-indigo-600 hover:underline">
                    返回账号密码登录
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Admin Dashboard ─────────────────────────────────────

  const renderContent = () => {
    switch (activeModule) {
      // ── Dashboard ───────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">仪表盘</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">注册用户</p>
                  <p className="text-3xl font-bold text-indigo-700">{users.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">活跃订单</p>
                  <p className="text-3xl font-bold text-indigo-700">{orders.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">待处理订单</p>
                  <p className="text-3xl font-bold text-orange-600">{dashboardStats.pendingOrders}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">本周新增用户</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardStats.weekNewUsers}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">平均处理时长</p>
                  <p className="text-3xl font-bold text-emerald-700">{dashboardStats.avgProcessingHours}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-stone-500 mb-1">卖家活跃度(7日)</p>
                  <p className="text-3xl font-bold text-violet-600">{dashboardStats.activeSellers}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // ── Users ───────────────────────────────────────
      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">用户管理</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>昵称</TableHead>
                        <TableHead>手机/邮箱</TableHead>
                        <TableHead>服务计划</TableHead>
                        <TableHead>到期时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.nickname || '-'}</TableCell>
                          <TableCell className="text-sm">{u.phone || u.email || '-'}</TableCell>
                          <TableCell>
                            <Select value={u.membership_level} onValueChange={(v) => handleChangeMembership(u.id, v)}>
                              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">测试版</SelectItem>
                                <SelectItem value="pro">普通版</SelectItem>
                                <SelectItem value="flagship">完整版</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {u.membership_level !== 'free' ? (
                              <input
                                type="date"
                                className="w-28 h-8 text-xs border rounded px-1"
                                value={u.membership_expires_at ? new Date(u.membership_expires_at).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChangeMembership(u.id, u.membership_level, e.target.value || undefined)}
                              />
                            ) : (
                              <span className="text-xs text-stone-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={u.is_frozen ? 'bg-red-100 text-red-700 border-0' : 'bg-emerald-100 text-emerald-700 border-0'}>
                              {u.is_frozen ? '已冻结' : '正常'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-stone-500">{new Date(u.created_at).toLocaleDateString('zh-CN')}</TableCell>
                          <TableCell>
                            <Button size="sm" variant={u.is_frozen ? 'default' : 'destructive'} onClick={() => handleToggleFreeze(u.id, u.is_frozen)} className="text-xs h-7">
                              {u.is_frozen ? '解冻' : '冻结'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-stone-400 py-8">暂无用户</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ── Orders ──────────────────────────────────────
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">订单管理</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订单号</TableHead>
                        <TableHead>卖家</TableHead>
                        <TableHead>买家</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>进度</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs tabular-nums">{o.order_no}</TableCell>
                          <TableCell className="text-sm">{o.users?.nickname || '-'}</TableCell>
                          <TableCell className="text-sm">{o.buyer_nickname}</TableCell>
                          <TableCell className="text-sm">{o.service_type}</TableCell>
                          <TableCell>
                            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                              {o.current_node}/7 {NODE_LABELS[o.current_node]?.substring(0, 4)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setForceOrderId(o.id); setForceDialogOpen(true); }}>介入</Button>
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleAddNote(o.id)}>备注</Button>
                              <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDeleteOrder(o.id)}>删除</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-stone-400 py-8">暂无订单</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ── Config ──────────────────────────────────────
      case 'config':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">系统配置</h2>
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg text-indigo-800">参数设置</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {configs.filter((c) => !['admin_password_hash','pro_price','flagship_price','simulate_payment','urgent_review_price','delivery_cert_price','share_card_price'].includes(c.config_key)).map((c) => (
                  <div key={c.config_key} className="flex items-center gap-4">
                    <Label className="w-40 text-sm text-stone-600 shrink-0">
                      {c.config_key === 'admin_username' ? '管理员账号' :
                       c.config_key === 'admin_password' ? '管理员密码' :
                       c.config_key === 'admin_phone' ? '管理员绑定手机号' :
                       c.config_key === 'free_max_orders' ? '测试版最大单数' :
                       c.config_key === 'pro_max_orders' ? '普通版最大单数' :
                       c.config_key === 'flagship_max_orders' ? '完整版最大单数' :
                       c.config_key}
                    </Label>
                    <Input value={editingConfig[c.config_key] || ''} onChange={(e) => setEditingConfig({ ...editingConfig, [c.config_key]: e.target.value })} className="max-w-xs" />
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <Label className="w-40 text-sm text-stone-600 shrink-0">管理员新密码</Label>
                  <PasswordInput placeholder="输入新密码" value={editingConfig['admin_password'] || ''} onChange={(v) => setEditingConfig({ ...editingConfig, admin_password: v })} className="max-w-xs" />
                </div>
                <Button onClick={handleSaveConfig} className="bg-indigo-600 hover:bg-indigo-700 text-white">保存配置</Button>
              </CardContent>
            </Card>
          </div>
        );

      // ── Contact ─────────────────────────────────────
      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">联系我们管理</h2>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-800">联系方式配置</CardTitle>
                <CardDescription>修改前端"联系我们"弹窗显示的联系方式信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>客服电话</Label>
                  <Input value={contactConfig.phone || ''} onChange={(e) => setContactConfig({ ...contactConfig, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>客服邮箱</Label>
                  <Input value={contactConfig.email || ''} onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>工作时间</Label>
                  <Input value={contactConfig.work_hours || ''} onChange={(e) => setContactConfig({ ...contactConfig, work_hours: e.target.value })} className="mt-1" />
                </div>
                <Button onClick={handleSaveContact} className="bg-indigo-600 hover:bg-indigo-700 text-white">保存配置</Button>
              </CardContent>
            </Card>
          </div>
        );

      // ── Survey ──────────────────────────────────────
      case 'survey':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">问卷管理</h2>
            {/* Question editing */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-indigo-800">问卷题目管理</CardTitle>
                  <CardDescription>编辑用户建议调查问卷的题目</CardDescription>
                </div>
                <Button onClick={handleAddQuestion} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">新增题目</Button>
              </CardHeader>
              <CardContent>
                {/* Inline editing question */}
                {editingQuestion && (
                  <div className="border-2 border-indigo-300 rounded-lg p-4 mb-4 space-y-3 bg-indigo-50/50">
                    <p className="font-medium text-sm text-indigo-800">新题目编辑</p>
                    <Input value={editingQuestion.question_text} onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })} placeholder="题目内容" />
                    <div className="flex gap-3 items-center">
                      <Select value={editingQuestion.question_type} onValueChange={(v) => setEditingQuestion({ ...editingQuestion, question_type: v })}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_choice">单选</SelectItem>
                          <SelectItem value="multiple_choice">多选</SelectItem>
                          <SelectItem value="text">文本</SelectItem>
                        </SelectContent>
                      </Select>
                      {(editingQuestion.question_type === 'single_choice' || editingQuestion.question_type === 'multiple_choice') && (
                        <Input value={editingQuestion.options.join(',')} onChange={(e) => setEditingQuestion({ ...editingQuestion, options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="选项，用逗号分隔" className="flex-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={editingQuestion.is_required} onChange={(e) => setEditingQuestion({ ...editingQuestion, is_required: e.target.checked })} /> 必填</label>
                      <span className="text-stone-400 text-sm">排序:</span>
                      <Input type="number" value={editingQuestion.sort_order} onChange={(e) => setEditingQuestion({ ...editingQuestion, sort_order: parseInt(e.target.value) || 0 })} className="w-16 h-7 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveQuestion(editingQuestion)} className="bg-indigo-600 hover:bg-indigo-700 text-white">保存</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>取消</Button>
                    </div>
                  </div>
                )}
                {/* Existing questions */}
                <div className="space-y-3">
                  {surveyQuestions.map((q, i) => (
                    <div key={q.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">题目 {i + 1}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleQuestion(q)}>{q.is_active ? '禁用' : '启用'}</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(q.id)}>删除</Button>
                        </div>
                      </div>
                      <Input value={q.question_text} onChange={(e) => {
                        const updated = [...surveyQuestions]; updated[i] = { ...updated[i], question_text: e.target.value }; setSurveyQuestions(updated);
                      }} placeholder="题目内容" />
                      <div className="flex gap-3 items-center">
                        <Select value={q.question_type} onValueChange={(v) => {
                          const updated = [...surveyQuestions]; updated[i] = { ...updated[i], question_type: v }; setSurveyQuestions(updated);
                        }}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_choice">单选</SelectItem>
                            <SelectItem value="multiple_choice">多选</SelectItem>
                            <SelectItem value="text">文本</SelectItem>
                          </SelectContent>
                        </Select>
                        {(q.question_type === 'single_choice' || q.question_type === 'multiple_choice') && (
                          <Input value={Array.isArray(q.options) ? q.options.join(',') : ''} onChange={(e) => {
                            const updated = [...surveyQuestions]; updated[i] = { ...updated[i], options: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }; setSurveyQuestions(updated);
                          }} placeholder="选项，用逗号分隔" className="flex-1" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked={q.is_required} onChange={(e) => {
                            const updated = [...surveyQuestions]; updated[i] = { ...updated[i], is_required: e.target.checked }; setSurveyQuestions(updated);
                          }} />
                          必填
                        </label>
                        <span className="text-stone-400">排序:</span>
                        <Input type="number" value={q.sort_order} onChange={(e) => {
                          const updated = [...surveyQuestions]; updated[i] = { ...updated[i], sort_order: parseInt(e.target.value) || 0 }; setSurveyQuestions(updated);
                        }} className="w-16 h-7 text-sm" />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleSaveQuestion({ ...q, options: q.options || [] })}>保存修改</Button>
                    </div>
                  ))}
                  {surveyQuestions.length === 0 && <p className="text-center text-stone-400 py-8">暂无题目，点击上方"新增题目"添加</p>}
                </div>
              </CardContent>
            </Card>
            {/* Responses */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-indigo-800">问卷回复</CardTitle>
                  <CardDescription>查看用户提交的问卷反馈</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadSurveyStats}>查看统计</Button>
                  <Button variant="outline" size="sm" onClick={handleExportSurvey}>导出Excel</Button>
                </div>
              </CardHeader>
              <CardContent>
                {surveyStats && (
                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg space-y-2">
                    <h4 className="font-medium text-indigo-800">满意度统计</h4>
                    {Object.entries(surveyStats).map(([question, answers]: [string, Record<string, number>]) => (
                      <div key={question} className="text-sm">
                        <span className="font-medium">{question}：</span>
                        {Object.entries(answers).map(([key, val]) => (
                          <span key={key} className="ml-2 text-stone-600">{key}({val}票)</span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>用户</TableHead><TableHead>提交时间</TableHead><TableHead>回答内容</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {surveyResponses.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap">{r.nickname || '匿名'}</TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(r.submitted_at).toLocaleString('zh-CN')}</TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1 max-w-md">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {Object.entries(r.answers).map(([q, a]: [string, any]) => (
                                <div key={q}><span className="font-medium">{q}：</span>{Array.isArray(a) ? a.join('、') : a}</div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {surveyResponses.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-stone-400 py-8">暂无回复</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ── Announcements ───────────────────────────────
      case 'announcements':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-800">公告管理</h2>
              <Button onClick={() => setAnnDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">发布公告</Button>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                {announcements.length === 0 ? (
                  <p className="text-stone-500 text-sm text-center py-8">暂无公告</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a) => (
                      <div key={a.id} className="border border-stone-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-stone-800">{a.title}</span>
                          <span className="text-xs text-stone-400">{new Date(a.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <p className="text-sm text-stone-600">{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      // ── Logs ────────────────────────────────────────
      case 'logs':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">操作日志</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>时间</TableHead><TableHead>操作</TableHead><TableHead>详情</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {opLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs tabular-nums text-stone-500">{new Date(log.created_at).toLocaleString('zh-CN')}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{log.action}</Badge></TableCell>
                          <TableCell className="text-sm text-stone-600 max-w-xs truncate">{log.detail}</TableCell>
                        </TableRow>
                      ))}
                      {opLogs.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-stone-400 py-8">暂无日志</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ── Buyer Addon Permissions ──────────────────────────
      case 'buyer-addons':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">买家高级功能管理</h2>
            <p className="text-sm text-stone-500">手动为买家开通/关闭高级功能权限</p>

            {/* Grant form */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-indigo-800">开通权限</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label className="text-sm text-stone-600">选择用户</Label>
                    <select
                      className="w-full mt-1 border border-stone-200 rounded-md px-3 py-2 text-sm"
                      value={grantAddonForm.user_id}
                      onChange={(e) => setGrantAddonForm({ ...grantAddonForm, user_id: e.target.value })}
                    >
                      <option value="">-- 选择用户 --</option>
                      {buyerAddonUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.nickname || u.phone || u.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">功能类型</Label>
                    <select
                      className="w-full mt-1 border border-stone-200 rounded-md px-3 py-2 text-sm"
                      value={grantAddonForm.addon_type}
                      onChange={(e) => setGrantAddonForm({ ...grantAddonForm, addon_type: e.target.value })}
                    >
                      <option value="urgent_review">优先审核</option>
                      <option value="delivery_cert">专业交付报告</option>
                      <option value="share_card">进度卡片生成</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">到期时间（可选）</Label>
                    <Input
                      type="datetime-local"
                      className="mt-1"
                      value={grantAddonForm.expires_at}
                      onChange={(e) => setGrantAddonForm({ ...grantAddonForm, expires_at: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleGrantAddon} className="bg-indigo-600 hover:bg-indigo-700 text-white">开通</Button>
                </div>
              </CardContent>
            </Card>

            {/* Permissions list */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-indigo-800">已开通权限</CardTitle>
                  <Button variant="outline" size="sm" onClick={loadBuyerAddons}>刷新</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>功能</TableHead>
                        <TableHead>开通时间</TableHead>
                        <TableHead>到期时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyerAddonPerms.map((p) => {
                        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="text-sm">{p.users?.nickname || p.users?.phone || p.user_id}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{ADDON_TYPE_LABELS[p.addon_type] || p.addon_type}</Badge></TableCell>
                            <TableCell className="text-xs text-stone-500">{new Date(p.created_at).toLocaleString('zh-CN')}</TableCell>
                            <TableCell className="text-xs text-stone-500">{p.expires_at ? new Date(p.expires_at).toLocaleString('zh-CN') : '永久'}</TableCell>
                            <TableCell>
                              <Badge className={isExpired ? 'bg-stone-200 text-stone-500' : 'bg-emerald-100 text-emerald-700'}>
                                {isExpired ? '已过期' : '生效中'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevokeAddon(p.id)}>关闭</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {buyerAddonPerms.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-stone-400 py-8">暂无权限记录</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'seller-features':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-indigo-800">卖家高级功能管理</h2>

            {/* Feature configuration */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-indigo-800">功能配置</CardTitle>
                <CardDescription className="text-xs">设置功能所需的最低等级与全局开关</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>功能名称</TableHead>
                        <TableHead>说明</TableHead>
                        <TableHead>最低等级</TableHead>
                        <TableHead>全局开关</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellerFeatures.map((f) => (
                        <TableRow key={f.feature_key}>
                          <TableCell className="font-medium text-sm">{f.feature_name}</TableCell>
                          <TableCell className="text-xs text-stone-500">{f.description}</TableCell>
                          <TableCell>
                            <select
                              className="border border-stone-200 rounded px-2 py-1 text-xs"
                              value={f.min_level}
                              onChange={async (e) => {
                                const res = await fetch('/api/admin/seller-features', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ feature_key: f.feature_key, min_level: e.target.value })
                                });
                                if (res.ok) loadSellerFeatures();
                              }}
                            >
                              <option value="pro">普通版</option>
                              <option value="flagship">完整版</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={f.is_enabled ? 'default' : 'outline'}
                              size="sm"
                              className={f.is_enabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                              onClick={async () => {
                                const res = await fetch('/api/admin/seller-features', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ feature_key: f.feature_key, is_enabled: !f.is_enabled })
                                });
                                if (res.ok) loadSellerFeatures();
                              }}
                            >
                              {f.is_enabled ? '已开启' : '已关闭'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sellerFeatures.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-stone-400 py-8">暂无功能配置</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Grant feature to seller */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-indigo-800">为卖家开通功能</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Step 1: Search seller by ID */}
                <div className="mb-4">
                  <Label className="text-sm text-stone-600 font-medium">步骤1：输入卖家ID查找</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="输入6位卖家ID，如 863457"
                      value={sellerSearchQuery}
                      onChange={(e) => { setSellerSearchQuery(e.target.value); if (foundSeller) { setFoundSeller(null); setGrantFeatureForm(prev => ({ ...prev, user_id: '' })); } }}
                      className="flex-1 font-mono"
                      maxLength={6}
                    />
                    <Button onClick={handleSearchSeller} disabled={searchingSeller} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                      {searchingSeller ? '搜索中...' : '搜索'}
                    </Button>
                  </div>
                  {foundSeller && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                        {(foundSeller.nickname || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800">{foundSeller.nickname || '未设置昵称'}</div>
                        <div className="text-xs text-stone-500">
                          ID: {foundSeller.seller_id} · {foundSeller.phone || foundSeller.email || '无联系方式'} · {foundSeller.membership_level}
                          {foundSeller.frozen && <span className="ml-1 text-red-500">(已冻结)</span>}
                        </div>
                      </div>
                      <Check size={18} className="text-emerald-600 shrink-0" />
                    </div>
                  )}
                </div>
                {/* Step 2: Select feature */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label className="text-sm text-stone-600 font-medium">步骤2：选择功能</Label>
                    <select
                      className="w-full mt-1 border border-stone-200 rounded-md px-3 py-2 text-sm"
                      value={grantFeatureForm.feature_key}
                      onChange={(e) => setGrantFeatureForm({ ...grantFeatureForm, feature_key: e.target.value })}
                    >
                      <option value="">-- 请选择功能 --</option>
                      {sellerFeatures.map((f) => (
                        <option key={f.feature_key} value={f.feature_key}>{f.feature_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">到期时间（可选）</Label>
                    <Input
                      type="datetime-local"
                      className="mt-1"
                      value={grantFeatureForm.expires_at}
                      onChange={(e) => setGrantFeatureForm({ ...grantFeatureForm, expires_at: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleGrantSellerFeature} disabled={!foundSeller} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    开通功能
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grants list */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-indigo-800">已开通权限</CardTitle>
                  <Button variant="outline" size="sm" onClick={loadSellerFeatures}>刷新</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>功能</TableHead>
                        <TableHead>开通时间</TableHead>
                        <TableHead>到期时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellerFeatureGrants.map((g) => {
                        const feature = sellerFeatures.find((f) => f.feature_key === g.feature_key);
                        const isExpired = g.expires_at && new Date(g.expires_at) < new Date();
                        return (
                          <TableRow key={g.id}>
                            <TableCell className="text-sm">{g.users?.nickname || g.users?.phone || g.user_id}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{feature?.feature_name || g.feature_key}</Badge></TableCell>
                            <TableCell className="text-xs text-stone-500">{new Date(g.created_at).toLocaleString('zh-CN')}</TableCell>
                            <TableCell className="text-xs text-stone-500">{g.expires_at ? new Date(g.expires_at).toLocaleString('zh-CN') : '永久'}</TableCell>
                            <TableCell>
                              <Badge className={isExpired ? 'bg-stone-200 text-stone-500' : 'bg-emerald-100 text-emerald-700'}>
                                {isExpired ? '已过期' : '生效中'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevokeSellerFeature(g.id)}>关闭</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {sellerFeatureGrants.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-stone-400 py-8">暂无权限记录</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ── Code Documentation ──────────────────────────────
      case 'docs':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-800">代码文档</h2>
                <p className="text-sm text-stone-500">项目完整文档，在线浏览和下载</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => { const a = document.createElement('a'); a.href = '/api/admin/docs/download?type=full'; a.download = 'yinuo-full-docs.md'; a.click(); }}
                >
                  下载完整文档
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => { const a = document.createElement('a'); a.href = '/api/admin/docs/download?type=api'; a.download = 'yinuo-api-docs.md'; a.click(); }}
                >
                  下载 API 文档
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => { const a = document.createElement('a'); a.href = '/api/admin/docs/download?type=guide'; a.download = 'yinuo-modification-guide.md'; a.click(); }}
                >
                  下载修改指南
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => { const a = document.createElement('a'); a.href = '/api/admin/docs/download?type=tutorial'; a.download = 'yinuo-tutorial.md'; a.click(); }}
                >
                  下载代码教学
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => { const a = document.createElement('a'); a.href = '/api/admin/docs/download?type=quickref'; a.download = 'yinuo-quick-ref.md'; a.click(); }}
                >
                  下载速查表
                </Button>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
              {([
                { key: 'overview' as const, label: '项目概述' },
                { key: 'quickRef' as const, label: '速查表' },
                { key: 'tutorial' as const, label: '代码教学' },
                { key: 'directory' as const, label: '目录结构' },
                { key: 'modules' as const, label: '模块说明' },
                { key: 'api' as const, label: 'API 文档' },
                { key: 'guide' as const, label: '修改指南' },
                { key: 'detailedGuide' as const, label: '详细修改说明' },
                { key: 'files' as const, label: '文件注释' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setDocsTab(tab.key); if (tab.key === 'files') setDocsFileSection(0); }}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    docsTab === tab.key
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {docsTab !== 'files' ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {docsData ? (
                    <div className="prose prose-stone prose-sm max-w-none">
                      <MarkdownContent content={
                        docsTab === 'overview' ? (docsData.overview?.content || '') :
                        docsTab === 'quickRef' ? (docsData.quickRef?.content || '') :
                        docsTab === 'tutorial' ? (docsData.tutorial?.content || '') :
                        docsTab === 'directory' ? (docsData.directory?.content || '') :
                        docsTab === 'modules' ? (docsData.modules?.content || '') :
                        docsTab === 'api' ? (docsData.apiDocs?.content || '') :
                        docsTab === 'detailedGuide' ? (docsData.detailedGuide?.content || '') :
                        (docsData.guide?.content || '')
                      } />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-stone-400">
                      <div className="animate-spin w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full mr-2" />
                      加载中...
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* 文件注释索引 */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* 分类列表 */}
                <Card className="border-0 shadow-sm lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-indigo-800">文件分类</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {docsData?.files?.sections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDocsFileSection(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          docsFileSection === idx
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {section.name}
                        <span className="ml-1 text-xs text-stone-400">({section.items.length})</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
                {/* 文件列表 */}
                <Card className="border-0 shadow-sm lg:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-indigo-800">
                      {docsData?.files?.sections[docsFileSection]?.name || '文件列表'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>文件路径</TableHead>
                          <TableHead>说明</TableHead>
                          <TableHead className="hidden md:table-cell">依赖</TableHead>
                          {docsData?.files?.sections[docsFileSection]?.items.some((item) => item.method) && (
                            <TableHead className="w-20">方法</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {docsData?.files?.sections[docsFileSection]?.items.map((file, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs text-stone-400">{idx + 1}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">{file.path}</code>
                            </TableCell>
                            <TableCell className="text-sm text-stone-600">{file.desc}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-stone-400">{file.deps || '-'}</TableCell>
                            {file.method && (
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{file.method}</Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-indigo-50/20 to-stone-50">
      {/* ─── Sidebar ──────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-stone-900 text-stone-300 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-stone-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">奕</div>
          <div>
            <p className="text-white font-bold text-sm">奕諾</p>
            <p className="text-stone-500 text-xs">后台管理系统</p>
          </div>
          <button className="ml-auto lg:hidden text-stone-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveModule(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      {/* ─── Main Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-stone-200 flex items-center px-4 lg:px-6 shrink-0">
          <button className="lg:hidden mr-3 text-stone-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-stone-800">
            {NAV_ITEMS.find((n) => n.key === activeModule)?.label || '管理后台'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">管</div>
            <span className="text-sm text-stone-600 hidden sm:inline">管理员</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* ─── Dialogs ──────────────────────────────────── */}
      <Dialog open={forceDialogOpen} onOpenChange={setForceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-indigo-800">管理员介入</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>操作类型</Label>
              <Select value={forceAction} onValueChange={setForceAction}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="force_advance">强制推进</SelectItem>
                  <SelectItem value="force_rollback">强制回退</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>备注（选填）</Label>
              <Textarea value={forceNote} onChange={(e) => setForceNote(e.target.value)} placeholder="介入原因" className="mt-1" rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setForceDialogOpen(false)} className="flex-1">取消</Button>
              <Button onClick={handleForceProgress} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">确认</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={annDialogOpen} onOpenChange={setAnnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-indigo-800">发布公告</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>标题</Label><Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>内容</Label><Textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} className="mt-1" rows={4} /></div>
            <div>
              <Label>推送方式</Label>
              <Select value={annPushTo} onValueChange={setAnnPushTo}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不推送</SelectItem>
                  <SelectItem value="all">推送全部用户</SelectItem>
                  <SelectItem value="specific">推送指定用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setAnnDialogOpen(false)} className="flex-1">取消</Button>
              <Button onClick={handleCreateAnnouncement} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">发布</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
