'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  tags: string[];
}

interface TemplatePreviewProps {
  template: Template;
  onBack: () => void;
}

export function TemplatePreview({ template, onBack }: TemplatePreviewProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [certNumber, setCertNumber] = useState('');

  useEffect(() => {
    setCertNumber(Date.now().toString(36).toUpperCase());
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleReset = useCallback(() => {
    setFormData({});
    setSubmitted(false);
  }, []);

  if (submitted) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Card className="animate-fade-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl">
                {template.name} - 交付确认书
              </CardTitle>
              <Badge variant="secondary">已生成</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header */}
            <div className="rounded-lg border-2 border-amber/30 bg-accent/30 p-6 text-center">
              <div className="font-serif text-2xl font-bold text-foreground">
                交付确认书
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {template.name} | 编号: YN-{certNumber}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {field.label}
                  </div>
                  <div className="rounded-md bg-card border border-border px-4 py-2.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {formData[field.key] || '-'}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>生成时间：{new Date().toLocaleString('zh-CN')}</span>
              <span>奕诺信任交付</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                打印 / 导出
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重新填写
              </Button>
              <Button variant="ghost" onClick={onBack}>
                返回列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        返回模板列表
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {template.name}
          </h1>
          <Badge variant="secondary">{template.category}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {template.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">填写交付信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {template.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </label>
              {field.type === 'text' && (
                <Input
                  placeholder={`请输入${field.label}`}
                  value={formData[field.key] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field.key, e.target.value)}
                />
              )}
              {field.type === 'textarea' && (
                <Textarea
                  placeholder={`请输入${field.label}`}
                  value={formData[field.key] || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(field.key, e.target.value)}
                  className="min-h-[100px] resize-y"
                />
              )}
              {field.type === 'date' && (
                <Input
                  type="date"
                  value={formData[field.key] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field.key, e.target.value)}
                />
              )}
              {field.type === 'select' && field.options && (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(val: string) => handleChange(field.key, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`请选择${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">
              生成交付确认书
            </Button>
            <Button variant="outline" onClick={onBack}>
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
