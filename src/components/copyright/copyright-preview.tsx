'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CopyrightData {
  workTitle: string;
  authorName: string;
  authorId: string;
  workType: string;
  creationDate: string;
  publishDate: string;
  description: string;
  licenseType: string;
  additionalTerms: string;
}

interface CopyrightPreviewProps {
  data: CopyrightData;
  onBack: () => void;
  onReset: () => void;
}

function getLicenseLabel(type: string): string {
  const map: Record<string, string> = {
    'all-rights': '保留所有权利',
    'cc-by': 'CC BY 4.0（署名）',
    'cc-by-nc': 'CC BY-NC 4.0（署名-非商业性使用）',
    'cc-by-sa': 'CC BY-SA 4.0（署名-相同方式共享）',
    'public-domain': '公共领域（CC0）',
  };
  return map[type] || '保留所有权利';
}

function getLicenseDescription(type: string): string {
  const map: Record<string, string> = {
    'all-rights': '未经权利人书面授权，任何单位或个人不得以任何形式复制、传播、改编、汇编、翻译或以其他方式使用本作品的全部或部分内容。',
    'cc-by': '他人可以在注明原作者署名的前提下，以任何形式使用、复制、传播、改编本作品，包括商业性使用。',
    'cc-by-nc': '他人可以在注明原作者署名的前提下，以非商业性目的使用、复制、传播、改编本作品。商业性使用需另行获得授权。',
    'cc-by-sa': '他人可以在注明原作者署名的前提下使用、改编本作品，但改编后的作品必须以相同许可协议发布。',
    'public-domain': '权利人放弃对本作品的一切著作权，他人可以自由使用、复制、修改、发行，无需获得许可。',
  };
  return map[type] || '';
}

export function CopyrightPreview({ data, onBack, onReset }: CopyrightPreviewProps) {
  const [certId, setCertId] = useState('');
  const [now, setNow] = useState('');

  useEffect(() => {
    setCertId(`YN-CR-${Date.now().toString(36).toUpperCase()}`);
    setNow(new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        返回编辑
      </button>

      <Card className="animate-fade-up">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-lg">版权声明文件</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {certId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Block */}
          <div className="rounded-lg border-2 border-amber/30 bg-accent/30 p-8 text-center">
            <div className="font-serif text-3xl font-bold text-foreground tracking-widest">
              版 权 声 明
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              COPYRIGHT DECLARATION
            </div>
          </div>

          {/* Section 1: Work Info */}
          <section className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-2">
              一、作品信息
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow label="作品名称" value={data.workTitle} />
              <InfoRow label="作品类型" value={data.workType} />
              <InfoRow label="作者/权利人" value={data.authorName} />
              <InfoRow label="证件号码" value={data.authorId || '未提供'} />
              <InfoRow label="创作完成日期" value={data.creationDate || '未注明'} />
              <InfoRow label="首次发表日期" value={data.publishDate || '未注明'} />
            </div>
            {data.description && (
              <div className="mt-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">作品描述</div>
                <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
              </div>
            )}
          </section>

          <Separator />

          {/* Section 2: Rights Declaration */}
          <section className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-2">
              二、权利声明
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              本人/本机构 <strong>{data.authorName}</strong> 声明对上述作品享有完整的著作权。
              本作品系独立创作完成，不存在抄袭、剽窃他人作品的情况。
              如涉及版权纠纷，由声明者承担相应法律责任。
            </p>
          </section>

          <Separator />

          {/* Section 3: License */}
          <section className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-2">
              三、授权方式
            </h3>
            <div className="rounded-md bg-accent/50 border border-border px-4 py-3">
              <div className="text-sm font-medium text-foreground">
                {getLicenseLabel(data.licenseType)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {getLicenseDescription(data.licenseType)}
              </p>
            </div>
          </section>

          {data.additionalTerms && (
            <>
              <Separator />
              <section className="space-y-3">
                <h3 className="font-serif text-base font-semibold text-foreground border-b border-border pb-2">
                  四、附加条款
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {data.additionalTerms}
                </p>
              </section>
            </>
          )}

          <Separator />

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              本声明仅供参考，不构成法律意见。如涉及重大知识产权事项，建议咨询专业律师。
              本声明由奕诺平台生成，编号 {certId}，生成时间 {now}。
            </p>

            <div className="flex items-end justify-between">
              <div className="text-sm text-foreground">
                <div>声明人（签章）：_______________</div>
                <div className="mt-2">日期：{now}</div>
              </div>
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber/50 font-serif text-xs text-amber animate-stamp">
                  <div className="text-center leading-tight">
                    <div>奕诺</div>
                    <div className="text-[8px]">信任认证</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              打印 / 导出 PDF
            </Button>
            <Button variant="outline" onClick={onBack}>
              返回编辑
            </Button>
            <Button variant="ghost" onClick={onReset}>
              新建声明
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value || '-'}</div>
    </div>
  );
}
