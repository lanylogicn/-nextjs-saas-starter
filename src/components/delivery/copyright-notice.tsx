/**
 * 版权声明模块
 * 交付物附带版权声明，包含原创性声明、版权归属、使用范围、授权方式
 */
'use client';

import { useState } from 'react';

export interface CopyrightDeclaration {
  // 原创性声明
  originalityStatement: string;
  // 版权归属
  copyrightOwner: string;
  // 使用范围
  usageScope: string;
  // 授权方式
  licenseType: 'all_rights_reserved' | 'cc_by' | 'cc_by_nc' | 'cc_by_sa' | 'public_domain' | 'custom';
  // 自定义授权条款（当 licenseType 为 custom 时）
  customLicense?: string;
  // 交付物名称
  workTitle: string;
  // 交付日期
  deliveryDate: string;
  // 卖家名称
  sellerName: string;
  // 买家名称
  buyerName?: string;
}

interface CopyrightNoticeProps {
  data: CopyrightDeclaration;
  notarizationNo?: string;
}

export function CopyrightNotice({ data, notarizationNo }: CopyrightNoticeProps) {
  const getLicenseInfo = (type: CopyrightDeclaration['licenseType'], custom?: string) => {
    switch (type) {
      case 'all_rights_reserved':
        return {
          name: '保留所有权利',
          icon: '©',
          description: '未经版权所有者书面许可，不得以任何形式复制、传播或修改本作品。',
        };
      case 'cc_by':
        return {
          name: 'CC BY 4.0',
          icon: '🅭',
          description: '允许在任何媒介上以任何形式复制、发行、修改和再创作，前提是注明原作者。',
        };
      case 'cc_by_nc':
        return {
          name: 'CC BY-NC 4.0',
          icon: '🅭🅝',
          description: '允许非商业性使用，需注明原作者，不得用于商业目的。',
        };
      case 'cc_by_sa':
        return {
          name: 'CC BY-SA 4.0',
          icon: '🅭🅯',
          description: '允许修改和再创作，需注明原作者，且衍生作品需采用相同许可协议。',
        };
      case 'public_domain':
        return {
          name: '公共领域',
          icon: '🄯',
          description: '本作品放弃所有版权，可自由使用、修改和分发，无需注明出处。',
        };
      case 'custom':
        return {
          name: '自定义授权',
          icon: '📋',
          description: custom || '请查看自定义授权条款。',
        };
      default:
        return {
          name: '保留所有权利',
          icon: '©',
          description: '未经版权所有者书面许可，不得以任何形式使用本作品。',
        };
    }
  };

  const licenseInfo = getLicenseInfo(data.licenseType, data.customLicense);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold">
            {licenseInfo.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">版权声明</h3>
            <p className="text-xs text-slate-500">Copyright Declaration</p>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-5 py-4 space-y-4">
        {/* 作品信息 */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">作品名称：</span>
              <span className="text-slate-800 font-medium">{data.workTitle}</span>
            </div>
            <div>
              <span className="text-slate-500">交付日期：</span>
              <span className="text-slate-800">{data.deliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-500">创作者：</span>
              <span className="text-slate-800">{data.sellerName}</span>
            </div>
            {data.buyerName && (
              <div>
                <span className="text-slate-500">委托方：</span>
                <span className="text-slate-800">{data.buyerName}</span>
              </div>
            )}
          </div>
        </div>

        {/* 原创性声明 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">原创性声明</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {data.originalityStatement}
          </p>
        </div>

        {/* 版权归属 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">版权归属</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {data.copyrightOwner}
          </p>
        </div>

        {/* 使用范围 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">使用范围</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {data.usageScope}
          </p>
        </div>

        {/* 授权方式 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">授权方式</h4>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{licenseInfo.icon}</span>
              <span className="text-sm font-semibold text-indigo-700">{licenseInfo.name}</span>
            </div>
            <p className="text-xs text-indigo-600">{licenseInfo.description}</p>
          </div>
        </div>

        {/* 公证信息 */}
        {notarizationNo && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>本声明已通过奕诺平台公证存证</span>
              <span className="font-mono text-indigo-600">{notarizationNo}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 版权声明编辑组件（用于卖家创建声明）
 */
interface CopyrightFormProps {
  orderId: string;
  sellerName: string;
  buyerName?: string;
  workTitle: string;
  onSubmit?: (data: CopyrightDeclaration) => void;
}

export function CopyrightForm({ orderId, sellerName, buyerName, workTitle, onSubmit }: CopyrightFormProps) {
  const [formData, setFormData] = useState<CopyrightDeclaration>({
    originalityStatement: `本人声明，本作品"${workTitle}"为本人独立创作的原创作品，未抄袭、剽窃他人作品，不存在任何知识产权纠纷。如存在侵权行为，由本人承担全部法律责任。`,
    copyrightOwner: `本作品的著作权归创作者"${sellerName}"所有${buyerName ? `，委托方"${buyerName}"享有约定范围内的使用权` : ''}。`,
    usageScope: `本作品仅限于${buyerName ? `委托方"${buyerName}"` : '委托方'}在约定范围内使用，未经著作权人书面许可，不得向第三方传播、转售或用于其他商业目的。`,
    licenseType: 'all_rights_reserved',
    customLicense: '',
    workTitle,
    deliveryDate: new Date().toLocaleDateString('zh-CN'),
    sellerName,
    buyerName,
  });

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold">
            ©
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">版权声明</h3>
            <p className="text-xs text-slate-500">为交付物添加版权声明</p>
          </div>
        </div>
      </div>

      {/* 表单 */}
      <div className="px-5 py-4 space-y-4">
        {/* 原创性声明 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">原创性声明</label>
          <textarea
            value={formData.originalityStatement}
            onChange={(e) => setFormData({ ...formData, originalityStatement: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
          />
        </div>

        {/* 版权归属 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">版权归属</label>
          <textarea
            value={formData.copyrightOwner}
            onChange={(e) => setFormData({ ...formData, copyrightOwner: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={2}
          />
        </div>

        {/* 使用范围 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">使用范围</label>
          <textarea
            value={formData.usageScope}
            onChange={(e) => setFormData({ ...formData, usageScope: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={2}
          />
        </div>

        {/* 授权方式 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">授权方式</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'all_rights_reserved', label: '保留所有权利', icon: '©' },
              { value: 'cc_by', label: 'CC BY 4.0', icon: '🅭' },
              { value: 'cc_by_nc', label: 'CC BY-NC', icon: '🅭🅝' },
              { value: 'cc_by_sa', label: 'CC BY-SA', icon: '🅭🅯' },
              { value: 'public_domain', label: '公共领域', icon: '🄯' },
              { value: 'custom', label: '自定义', icon: '📋' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, licenseType: option.value as CopyrightDeclaration['licenseType'] })}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                  formData.licenseType === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义授权条款 */}
        {formData.licenseType === 'custom' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">自定义授权条款</label>
            <textarea
              value={formData.customLicense}
              onChange={(e) => setFormData({ ...formData, customLicense: e.target.value })}
              placeholder="请输入自定义授权条款..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 px-4 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
        >
          确认版权声明
        </button>
      </div>
    </div>
  );
}
