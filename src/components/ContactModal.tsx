/**
 * @component ContactModal（联系客服弹窗）
 * @description
 * 弹窗展示平台联系方式（电话/邮箱/工作时间），
 * 数据从 /api/contact 获取（由管理员在后台配置）。
 *
 * @props {boolean} isOpen - 是否显示弹窗
 * @props {() => void} onClose - 关闭回调
 *
 * API：GET /api/contact
 */
'use client';

import { useEffect, useState } from 'react';
import { X, Phone, Mail, Clock } from 'lucide-react';

interface ContactInfo {
  phone: string;
  email: string;
  work_hours: string;
}

export default function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/contact')
        .then(res => res.json())
        .then(data => setContact(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-indigo-900">联系我们</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-1">客服电话</p>
              <p className="text-lg font-semibold text-indigo-900">{contact?.phone || '400-888-9999'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-1">客服邮箱</p>
              <p className="text-lg font-semibold text-indigo-900">{contact?.email || 'support@yinuo.com'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-1">工作时间</p>
              <p className="text-lg font-semibold text-indigo-900">{contact?.work_hours || '周一至周五 9:00-18:00'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
