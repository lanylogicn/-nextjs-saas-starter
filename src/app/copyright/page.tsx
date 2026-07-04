'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CopyrightPreview } from '@/components/copyright/copyright-preview';

type CopyrightState = 'form' | 'preview';

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

export default function CopyrightPage() {
  const [state, setState] = useState<CopyrightState>('form');
  const [data, setData] = useState<CopyrightData>({
    workTitle: '',
    authorName: '',
    authorId: '',
    workType: '',
    creationDate: '',
    publishDate: '',
    description: '',
    licenseType: 'all-rights',
    additionalTerms: '',
  });

  const handleChange = useCallback((key: keyof CopyrightData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canGenerate = data.workTitle && data.authorName && data.workType;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    setState('preview');
  }, [canGenerate]);

  const handleBack = useCallback(() => {
    setState('form');
  }, []);

  const handleReset = useCallback(() => {
    setData({
      workTitle: '',
      authorName: '',
      authorId: '',
      workType: '',
      creationDate: '',
      publishDate: '',
      description: '',
      licenseType: 'all-rights',
      additionalTerms: '',
    });
    setState('form');
  }, []);

  if (state === 'preview') {
    return <CopyrightPreview data={data} onBack={handleBack} onReset={handleReset} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          版权声明生成
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          一键生成具备法律参考价值的版权声明文件，明确知识产权归属、使用范围和授权条款
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif text-lg">作品信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                作品名称 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="请输入作品名称"
                value={data.workTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('workTitle', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  作者/权利人 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="姓名或机构名称"
                  value={data.authorName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('authorName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  证件号码
                </label>
                <Input
                  placeholder="身份证/统一社会信用代码"
                  value={data.authorId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('authorId', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                作品类型 <span className="text-destructive">*</span>
              </label>
              <Select
                value={data.workType}
                onValueChange={(val: string) => handleChange('workType', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择作品类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="文字作品">文字作品</SelectItem>
                  <SelectItem value="美术作品">美术作品</SelectItem>
                  <SelectItem value="软件代码">软件代码</SelectItem>
                  <SelectItem value="摄影作品">摄影作品</SelectItem>
                  <SelectItem value="音乐作品">音乐作品</SelectItem>
                  <SelectItem value="视听作品">视听作品</SelectItem>
                  <SelectItem value="设计作品">设计作品</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  创作完成日期
                </label>
                <Input
                  type="date"
                  value={data.creationDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('creationDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  首次发表日期
                </label>
                <Input
                  type="date"
                  value={data.publishDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('publishDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                作品描述
              </label>
              <Textarea
                placeholder="简要描述作品内容、创作背景等"
                value={data.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                className="min-h-[80px] resize-y"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                授权方式
              </label>
              <Select
                value={data.licenseType}
                onValueChange={(val: string) => handleChange('licenseType', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-rights">保留所有权利</SelectItem>
                  <SelectItem value="cc-by">CC BY（署名）</SelectItem>
                  <SelectItem value="cc-by-nc">CC BY-NC（署名-非商业）</SelectItem>
                  <SelectItem value="cc-by-sa">CC BY-SA（署名-相同方式共享）</SelectItem>
                  <SelectItem value="public-domain">公共领域</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                附加条款
              </label>
              <Textarea
                placeholder="如有特殊约定或使用限制，请在此说明"
                value={data.additionalTerms}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('additionalTerms', e.target.value)}
                className="min-h-[60px] resize-y"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex-1"
              >
                生成版权声明
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-serif text-lg">预览说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-amber">
                  1
                </div>
                <p>填写作品基本信息，带 <span className="text-destructive">*</span> 的为必填项</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-amber">
                  2
                </div>
                <p>选择授权方式，确定版权声明的权利保留程度</p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-amber">
                  3
                </div>
                <p>生成后可打印或导出为 PDF，作为交付物的版权声明附件</p>
              </div>
              <Separator />
              <p className="text-xs">
                声明内容仅供参考，不构成法律意见。如涉及重大知识产权事项，建议咨询专业律师。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
